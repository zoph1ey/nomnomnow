import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChatResponse, ChatMessage } from "@/lib/ai";
import { SavedRestaurant } from "@/lib/supabase/restaurants";

interface DiscoveredPlace {
  name: string;
  address: string;
  placeId: string;
  rating?: number;
  priceLevel?: number;
}

// Search for restaurants using Google Places API - only returns OPEN places
async function discoverRestaurants(
  query: string,
  latitude: number,
  longitude: number
): Promise<DiscoveredPlace[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const searchUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    searchUrl.searchParams.set("query", `${query} restaurant`);
    searchUrl.searchParams.set("location", `${latitude},${longitude}`);
    searchUrl.searchParams.set("radius", "5000");
    searchUrl.searchParams.set("type", "restaurant");
    searchUrl.searchParams.set("key", apiKey);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.status !== "OK") return [];

    // Filter to only open restaurants and take first 5
    const openPlaces = (data.results || [])
      .filter((place: { opening_hours?: { open_now?: boolean } }) =>
        place.opening_hours?.open_now === true
      )
      .slice(0, 5)
      .map((place: {
        place_id: string;
        name: string;
        formatted_address: string;
        rating?: number;
        price_level?: number;
      }) => ({
        name: place.name,
        address: place.formatted_address,
        placeId: place.place_id,
        rating: place.rating,
        priceLevel: place.price_level,
      }));

    return openPlaces;
  } catch (error) {
    console.error("Discovery error:", error);
    return [];
  }
}

// Price range labels for AI context
const PRICE_LABELS: Record<number, string> = {
  1: "Budget-friendly ($)",
  2: "Moderate ($$)",
  3: "Upscale ($$$)",
  4: "Fine dining ($$$$)",
};

// Context tag labels for AI context
const CONTEXT_LABEL_MAP: Record<string, string> = {
  "date-night": "Date Night",
  "solo-friendly": "Solo Friendly",
  "group-friendly": "Group Friendly",
  "special-occasion": "Special Occasion",
  "quick-lunch": "Quick Lunch",
  "late-night": "Late Night",
  "family-friendly": "Family Friendly",
  "work-meeting": "Work Meeting",
  "casual-hangout": "Casual Hangout",
};

function buildSystemPrompt(restaurants: SavedRestaurant[]): string {
  const restaurantList = restaurants
    .map((r) => {
      const parts = [`- ${r.name} (${r.address})`];
      if (r.tags && r.tags.length > 0) parts.push(`  Cuisine/Tags: ${r.tags.join(", ")}`);
      if (r.price_range) parts.push(`  Price: ${PRICE_LABELS[r.price_range] || r.price_range}`);
      if (r.rating) parts.push(`  User rating: ${r.rating}/5`);
      if (r.dietary_tags && r.dietary_tags.length > 0) {
        parts.push(`  Dietary: ${r.dietary_tags.join(", ")}`);
      }
      if (r.context_tags && r.context_tags.length > 0) {
        const contextLabels = r.context_tags.map((t) => CONTEXT_LABEL_MAP[t] || t);
        parts.push(`  Best for: ${contextLabels.join(", ")}`);
      }
      if (r.what_to_order) parts.push(`  What to order: ${r.what_to_order}`);
      if (r.notes) parts.push(`  Notes: ${r.notes}`);
      return parts.join("\n");
    })
    .join("\n\n");

  return `You are a warm, quick food recommendation assistant for NomNomNow. Users tell you their situation upfront - make recommendations immediately without asking follow-up questions.

The user has saved these restaurants:

${restaurantList || "No restaurants saved yet."}

## Your Approach (BE DIRECT - NO FOLLOW-UP QUESTIONS)

The user will tell you:
- How they're feeling (mood/energy)
- Who they're eating with (solo, date, friends, family)
- Budget preference
- Any dietary needs

**Your job: Recommend 1-3 restaurants IMMEDIATELY based on what they told you.**

DO NOT ask follow-up questions. Work with whatever info they give you. If something is unclear, make a reasonable assumption and recommend.

## How to Match:
- Use "Best for" tags to match occasions (date-night → date, solo-friendly → solo, etc.)
- Use "Price" to match budget ($ = cheap, $$ = moderate, $$$ = splurge)
- Use "Dietary" tags to filter for restrictions
- Use mood to pick cuisine style (tired → comfort food, adventurous → bold flavors)

## Response Format:
Keep it SHORT and use PLAIN TEXT (no markdown, no ** or other formatting).

Example:
"For a tired solo night on a budget, I'd go with Ramen House - it's solo-friendly, cheap eats, and their tonkotsu is pure comfort. Backup option: Noodle Bar has great udon too."

That's it. No "let me know if you want more options" - just give them the answer.

## Time Awareness:
Current time: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}

If it's late (after 9pm) or early (before 8am), add "just check they're open first!" at the end of your recommendation since you don't have opening hours data.

## Discovery Mode - Finding NEW Restaurants
You can search for nearby restaurants that are OPEN RIGHT NOW!

ALWAYS use discovery to suggest new options. At the end of your message, include:
[DISCOVER: "search terms here"]

Examples:
- [DISCOVER: "cozy ramen"]
- [DISCOVER: "romantic Italian date night"]
- [DISCOVER: "quick healthy lunch"]

The search terms should reflect the mood and preferences they described. This will show them places that are confirmed open nearby.

## Important Rules:
- Recommend from saved restaurants if they have good matches
- ALSO trigger [DISCOVER: "..."] to show open places nearby (especially late night)
- Keep responses conversational, not robotic
- Match the restaurant's "Best for" tags to the occasion they described
- Filter by dietary restrictions if they mention any
- Consider price range based on their budget comments
- Don't ask about cuisine type right away - discover it through mood/context`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { messages, latitude, longitude } = (await request.json()) as {
      messages: ChatMessage[];
      latitude?: number;
      longitude?: number;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    const hasLocation = latitude !== undefined && longitude !== undefined;

    // Fetch user's saved restaurants
    const { data: restaurants, error: dbError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch restaurants" },
        { status: 500 }
      );
    }

    // Build system prompt with restaurant context
    let systemPrompt = buildSystemPrompt(restaurants || []);

    // Add discovery capability note if location is available
    if (!hasLocation) {
      // Remove the discovery section if no location
      systemPrompt = systemPrompt.replace(
        /## Discovery Mode - Finding NEW Restaurants[\s\S]*?(?=## Important Rules)/,
        ""
      );
    }

    // Get AI response
    let response = await getChatResponse(messages, systemPrompt);

    // Check if AI requested discovery
    const discoverMatch = response.match(/\[DISCOVER:\s*"([^"]+)"\]/);
    let discoveredPlaces: DiscoveredPlace[] = [];

    if (discoverMatch && hasLocation) {
      const searchQuery = discoverMatch[1];
      // Remove the discover marker from the response
      response = response.replace(/\[DISCOVER:\s*"[^"]+"\]/, "").trim();

      // Perform the search
      discoveredPlaces = await discoverRestaurants(
        searchQuery,
        latitude!,
        longitude!
      );

      // If we found places, append info to the response
      if (discoveredPlaces.length > 0) {
        response +=
          "\n\nI found some places that are open right now near you! Check them out below.";
      } else {
        response +=
          "\n\nI searched but couldn't find open places matching that right now. Try a different type of food or check back during regular hours.";
      }
    }

    return NextResponse.json({
      message: response,
      discoveredPlaces: discoveredPlaces.length > 0 ? discoveredPlaces : undefined,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
