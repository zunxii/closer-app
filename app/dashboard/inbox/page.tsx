"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Search, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CSVPopup from "./CSVPopup";

export default function InboxCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [popupData, setPopupData] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const statusMap: Record<number | string, string> = {
    0: "Draft",
    1: "Active",
    2: "Paused",
    3: "Completed",
    4: "Running Subsequences",
    "-99": "Account Suspended",
    "-1": "Accounts Unhealthy",
    "-2": "Bounce Protect",
  };

  const statusColorMap: Record<string, string> = {
    Draft: "text-gray-600 border-gray-600",
    Active: "text-green-600 border-green-600",
    Paused: "text-yellow-600 border-yellow-600",
    Completed: "text-blue-600 border-blue-600",
    "Running Subsequences": "text-purple-600 border-purple-600",
    "Account Suspended": "text-red-600 border-red-600",
    "Accounts Unhealthy": "text-red-600 border-red-600",
    "Bounce Protect": "text-orange-600 border-orange-600",
  };

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        const items = data.items || [];
        setCampaigns(items);
        setFiltered(items);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const result = campaigns.filter((c) =>
      c.name.toLowerCase().includes(query)
    );
    setFiltered(result);
  }, [search, campaigns]);

  const extractUsernameFromSubject = (subject: string): string => {
    const match = subject.match(/\b[A-Za-z0-9._%+-]+\b/);
    return match ? match[0] : "Unknown";
  };

  const extractMobileFromBody = (body: string): string => {
    const match = body.match(/(?:\+91[-\s]?|0)?[6-9]\d{9}/);
    if (!match) return "Not Found";
    const cleaned = match[0].replace(/\D+$/, "");
    return cleaned;
  };

  const enhanceCSV = (csvText: string): string => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return csvText;

    const headers = lines[0].split(",");
    const subjectIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("subject")
    );
    const bodyIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("body")
    );

    if (subjectIndex === -1 || bodyIndex === -1) return csvText;

    const enhancedLines = [lines[0] + ",username,mobile"];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split(",");
      const subject = cols[subjectIndex] || "";
      const body = cols[bodyIndex] || "";

      const username = extractUsernameFromSubject(subject);
      const mobile = extractMobileFromBody(body);

      enhancedLines.push(
        `${lines[i]},${username.replace(/"/g, "")},${mobile.replace(/"/g, "")}`
      );
    }

    return enhancedLines.join("\n");
  };

  const cleanCSVData = (csvText: string): string => {
    let cleanText = csvText.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r?\n/);
    const processedLines = lines.map((line) =>
      line
        .replace(/="([^"]*)"/g, '"$1"')
        .replace(/=([^,"\s][^,]*)/g, "$1")
        .replace(/\t/g, ",")
    );
    const cleanedText = processedLines.join("\n");
    return enhanceCSV(cleanedText);
  };

  const downloadCSV = async (campaignId: string) => {
    setDownloading(campaignId);
    try {
      const res = await fetch(`/api/inbox-csv?campaignId=${campaignId}`);
      if (!res.ok) throw new Error("Failed to download CSV");

      const csvText = await res.text();
      const cleanedCsvText = cleanCSVData(csvText);

      const blob = new Blob([cleanedCsvText], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `campaign_${campaignId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setPopupData(cleanedCsvText);
    } catch (err) {
      alert("Error downloading CSV");
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="px-4 py-10 sm:px-8 max-w-7xl mx-auto text-black">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
          Inbox Campaigns
        </h1>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading campaigns...</span>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center text-red-600 mt-4">
          <AlertTriangle className="mr-2" />
          Error fetching campaigns
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-12">
          No campaigns found for "
          <span className="font-semibold">{search}</span>"
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => {
            const statusLabel = statusMap[c.status] || "Unknown";
            const badgeColor =
              statusColorMap[statusLabel] || "text-gray-600 border-gray-600";
            const isDownloadingThis = downloading === c.id;
            const isAnyDownloading = downloading !== null;

            return (
              <div
                key={c.id}
                className="transition duration-200 hover:scale-[1.02]"
              >
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md p-5 h-full flex flex-col justify-between transition-all text-black">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-2 truncate">
                      {c.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`${badgeColor} text-xs px-3 py-1 rounded-full mb-4`}
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                  <button
                    onClick={() => downloadCSV(c.id)}
                    disabled={isAnyDownloading}
                    className={`mt-auto px-4 py-2 text-sm rounded flex items-center justify-center gap-2 transition-all ${
                      isAnyDownloading
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isDownloadingThis ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download & Edit CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {popupData && (
        <CSVPopup csvText={popupData} onClose={() => setPopupData(null)} />
      )}
    </div>
  );
}
