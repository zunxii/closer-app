import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const links = formData.getAll("links") as string[];
        const cleanedLinks = links.map((link) => link.trim());

        const logsDir = path.join(process.cwd(), "logs");
        fs.mkdirSync(logsDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
        const logPath = path.join(logsDir, `input_${timestamp}.txt`);
        fs.appendFileSync(logPath, cleanedLinks.join("\n") + "\n");

        const csvDir = path.join(process.cwd(), "public", "downloads");
        fs.mkdirSync(csvDir, { recursive: true });
        const csvPath = path.join(csvDir, "final_output.csv");

        const resetCSV = request.headers.get("x-reset-csv") === "true";
        if (resetCSV && fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, "");
        }

        const cloudResponse = await fetch(
            "https://asia-south1-closer-influencer.cloudfunctions.net/getEmailsFromInstagram",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ links: cleanedLinks }),
            }
        );

        let cloudOutput: any = {};
        let savedCSVContent = "";

        if (cloudResponse.ok) {
            cloudOutput = await cloudResponse.json();

            if (cloudOutput.csv_content) {
                let csvData = cloudOutput.csv_content.trim();

                const alreadyExists = fs.existsSync(csvPath);
                if (alreadyExists && fs.readFileSync(csvPath, "utf-8").length > 0) {
                    const lines = csvData.split("\n");
                    if (lines.length > 1) {
                        csvData = lines.slice(1).join("\n");
                    }
                }

                fs.appendFileSync(csvPath, csvData + "\n");
                cloudOutput.csv_path = "/downloads/final_output.csv";

                savedCSVContent = fs.readFileSync(csvPath, "utf-8"); // ✅ Final CSV
            }
        } else {
            cloudOutput = {
                error: `Status: ${cloudResponse.status}`,
                raw: await cloudResponse.text(),
            };
        }

        return NextResponse.json({
            status: "success",
            data: cleanedLinks,
            csv_content: savedCSVContent, // ✅ Returning the merged CSV
            cloud_response: cloudOutput,
        });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message });
    }
}
