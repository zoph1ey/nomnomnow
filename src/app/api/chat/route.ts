import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChatResponse, ChatMessage } from "@/lib/ai";
import { SavedRestaurant } from "@/lib/supabase/restaurants";

function buildSystemPrompt(restaurants: SavedRestaurant[]): string {
  const restaurantList = restaurants
    .map((r) => {
      const parts = [`- ${r.name} (${r.address})`];
      if (r.tags.length > 0) parts.push(`  Tags: ${r.tags.join(", ")}`);
      if (r.rating) parts.push(`  User rating: ${r.rating}/5`);
      if (r.what_to_order) parts.push(`  What to order: ${r.what_to_order}`);
      if (r.notes) parts.push(`  Notes: ${r.notes}`);
      return parts.join("\n");
    })
    .join("\n\n");

  return `You are a friendly, conversational food recommendation assistant for NomNomNow. Your goal is to help the user decide what to eat from their saved restaurants.

The user has saved these restaurants:

${restaurantList || "No restaurants saved yet."}

Your approach:
1. Start by asking what they're in the mood for (cuisine type, flavors, comfort food vs adventurous, etc.)
2. Ask follow-up questions about practical constraints if relevant (budget, distance, time)
3. Once you have enough info, recommend 1-3 restaurants from their list with clear reasoning
4. Be concise, warm, and helpful - like a foodie friend

Important:
- Only recommend from the restaurants listed above
- If none of their saved restaurants match, say so honestly and suggest what type of place they might want to add
- Keep responses brief and conversational
- Use the "what to order" and "notes" info when making recommendations`;
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
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

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
    const systemPrompt = buildSystemPrompt(restaurants || []);

    // Get AI response
    const response = await getChatResponse(messages, systemPrompt);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
