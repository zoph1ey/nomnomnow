import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PlaceResult {
  name: string;
  address: string;
  placeId: string;
  rating?: number;
  priceLevel?: number;
  types?: string[];
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  price_level?: number;
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
  };
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

    const { query, latitude, longitude, radius = 5000 } = await request.json();

    if (!query || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Query and location required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Places Text Search API
    const searchUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    searchUrl.searchParams.set("query", `${query} restaurant`);
    searchUrl.searchParams.set("location", `${latitude},${longitude}`);
    searchUrl.searchParams.set("radius", radius.toString());
    searchUrl.searchParams.set("type", "restaurant");
    searchUrl.searchParams.set("key", apiKey);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: "Failed to search restaurants" },
        { status: 500 }
      );
    }

    // Format results
    const places: PlaceResult[] = (data.results || [])
      .slice(0, 5) // Limit to 5 results
      .map((place: GooglePlaceResult) => ({
        name: place.name,
        address: place.formatted_address,
        placeId: place.place_id,
        rating: place.rating,
        priceLevel: place.price_level,
        types: place.types,
      }));

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Discover API error:", error);
    return NextResponse.json(
      { error: "Failed to discover restaurants" },
      { status: 500 }
    );
  }
}
