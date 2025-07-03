import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawText = body.rawText || "";

  const inputPath = path.resolve("Insta_link_to_username/input.txt");
  const outputPath = path.resolve("public/usernames.json");
  const scriptPath = path.resolve("Insta_link_to_username/extract_usernames.py");

  try {
    fs.writeFileSync(inputPath, rawText, "utf-8");
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to write input file" });
  }

  return new Promise((resolve) => {
    exec(`python "${scriptPath}" "${inputPath}" "${outputPath}"`, (error, stdout, stderr) => {
      if (error) {
        return resolve(
          NextResponse.json({ success: false, error: stderr || error.message })
        );
      }
      return resolve(NextResponse.json({ success: true, output: stdout }));
    });
  });
}
