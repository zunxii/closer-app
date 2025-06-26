// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const API_URL = "https://api.instantly.ai/api/v2/campaigns";
    const RAW_API_KEY = process.env.INSTANTLY_API_KEY;

    const API_KEY = (RAW_API_KEY || "").trim();

    if (!API_KEY) {
        console.error("API Key missing in environment variables.");
        return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);

        // Extract query params
        let limit = parseInt(searchParams.get("limit") || "100", 10);
        const search = searchParams.get("search");
        const starting_after = searchParams.get("starting_after");
        const tag_ids = searchParams.get("tag_ids");

        // Clamp limit between 1 and 100
        if (isNaN(limit) || limit < 1 || limit > 100) {
            limit = 100;
        }

        // Construct Instantly API URL
        const url = new URL(API_URL);
        url.searchParams.set("limit", limit.toString());
        if (search) url.searchParams.set("search", search);
        if (starting_after) url.searchParams.set("starting_after", starting_after);
        if (tag_ids) url.searchParams.set("tag_ids", tag_ids);

        // Prepare headers
        const headers = {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        };

        // Make API request
        const response = await fetch(url.toString(), {
            method: "GET",
            headers,
        });

        // Parse response
        const data = await response.json();

        // Handle failure
        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    { error: "Unauthorized - API key may be invalid or expired." },
                    { status: 401 }
                );
            }
            return NextResponse.json({ error: data }, { status: response.status });
        }

        // Success
        return NextResponse.json({
            items: data.items || [],
            next_starting_after: data.next_starting_after || null,
        });
    } catch (error: any) {
        console.error("Unexpected error:", error.message || error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
