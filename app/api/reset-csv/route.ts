import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE() {
    try {
        const csvPath = path.join(process.cwd(), "public", "downloads", "final_output.csv");
        if (fs.existsSync(csvPath)) {
            fs.unlinkSync(csvPath);
        }

        const logsDir = path.join(process.cwd(), "logs");
        if (fs.existsSync(logsDir)) {
            fs.readdirSync(logsDir).forEach(file => {
                fs.unlinkSync(path.join(logsDir, file));
            });
        }

        return NextResponse.json({ status: "success", message: "CSV and logs cleared." });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message });
    }
}
