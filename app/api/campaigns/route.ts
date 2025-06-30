// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const API_URL = "https://api.instantly.ai/api/v2/campaigns";
    const API_KEY = (process.env.INSTANTLY_API_KEY || "").trim();

    if (!API_KEY) {
        return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const headers = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
    };

    try {
        const campaigns: any[] = [];
        let starting_after: string | null = null;
        let hasMore = true;

        while (hasMore) {
            const url = new URL(API_URL);
            url.searchParams.set("limit", "100");
            if (starting_after) url.searchParams.set("starting_after", starting_after);

            const res = await fetch(url.toString(), { headers });
            const data = await res.json();

            if (!res.ok) {
                return NextResponse.json({ error: data }, { status: res.status });
            }

            campaigns.push(...(data.items || []));

            if (data.next_starting_after) {
                starting_after = data.next_starting_after;
            } else {
                hasMore = false;
            }
        }

        return NextResponse.json({
            items: campaigns,
            total: campaigns.length,
        });
    } catch (err: any) {
        console.error("Error fetching campaigns:", err.message || err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
