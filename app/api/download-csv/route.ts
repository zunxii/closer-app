import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const csvPath = path.join("/tmp", "downloads", "final_output.csv");

    if (!fs.existsSync(csvPath)) {
        return new Response("File not found", { status: 404 });
    }

    const csvBuffer = fs.readFileSync(csvPath);
    fs.unlinkSync(csvPath); // Delete after serving

    return new Response(csvBuffer, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="results.csv"',
        },
    });
}
