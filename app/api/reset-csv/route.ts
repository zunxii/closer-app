import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE() {
    try {
        const csvDir = path.join("/tmp", "downloads");
        if (fs.existsSync(csvDir)) {
            fs.readdirSync(csvDir).forEach(file => {
                fs.unlinkSync(path.join(csvDir, file));
            });
        }

        const logsDir = path.join("/tmp", "logs");
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
