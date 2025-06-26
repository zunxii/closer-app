import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { campaign_id, ...lead } = body;

        const response = await fetch("https://api.instantly.ai/api/v2/leads", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                campaign: campaign_id,
                email: lead.email,
                first_name: lead.first_name,
                personalization: lead.personalization || "",
                website: lead.website || "",
                custom_variables: {
                    instagram: lead.instagram,
                    product: lead.product,
                    brand: lead.brand,
                    deliverables: lead.deliverables,
                    cost: lead.cost,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("❌ Error adding lead:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
