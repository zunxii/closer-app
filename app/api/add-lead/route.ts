import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { campaign_id, leads } = await req.json();

        if (!Array.isArray(leads) || leads.length === 0) {
            return NextResponse.json({ message: "No leads provided" }, { status: 400 });
        }

        const results = await Promise.all(
            leads.map(async (lead: any) => {
                try {
                    const res = await fetch("https://api.instantly.ai/api/v2/leads", {
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

                    const data = await res.json();
                    return { email: lead.email, success: res.ok, data, status: res.status };
                } catch (err) {
                    return { email: lead.email, success: false, error: err.message };
                }
            })
        );

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("❌ API route error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
