// app/api/extract/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    const rawText = body.rawText || "";

    const lines = rawText.split(/\r?\n/);
    const usernames = lines.map((line) => {
      line = line.trim();
      if (!line) return "";

      const match = line.match(/instagram\.com(?:\/stories)?\/([A-Za-z0-9_.]+)/);
      if (match) return match[1].toLowerCase();

      if (/^[A-Za-z0-9_.]+$/.test(line)) return line.toLowerCase();

      return "";
    });

    return Response.json({ success: true, usernames });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message || "Invalid request" },
      { status: 500 }
    );
  }
}
