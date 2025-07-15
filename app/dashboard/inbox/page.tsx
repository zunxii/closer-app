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

  // Enhanced username extraction with multiple patterns and fallbacks
  const extractUsernameFromSubject = (subject: string): string => {
    if (!subject || typeof subject !== "string") return "Unknown";

    const cleanSubject = subject.toLowerCase().trim();

    // Pattern 1: Direct patterns with keywords
    const directPatterns = [
      /(?:from|by|regarding|issue\s+by|application\s+from|submitted\s+by|created\s+by|posted\s+by|sent\s+by|inquiry\s+from|request\s+from|message\s+from|complaint\s+by|feedback\s+from|query\s+from|concern\s+from|problem\s+reported\s+by)\s+([A-Za-z][A-Za-z\s]{1,30})/i,
      /(?:user|customer|client|member|person|individual|contact)[\s:]+([A-Za-z][A-Za-z\s]{1,30})/i,
      /(?:name|full\s+name|customer\s+name|user\s+name)[\s:]+([A-Za-z][A-Za-z\s]{1,30})/i,
    ];

    // Try direct patterns first
    for (const pattern of directPatterns) {
      const match = subject.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length >= 2 && extracted.length <= 30) {
          return formatName(extracted);
        }
      }
    }

    // Pattern 2: Extract from email signatures or contact info
    const emailPattern = /([A-Za-z][A-Za-z\s]{1,25})\s*<[^>]+@[^>]+>/i;
    const emailMatch = subject.match(emailPattern);
    if (emailMatch && emailMatch[1]) {
      return formatName(emailMatch[1].trim());
    }

    // Pattern 3: Look for names in quotes
    const quotedPattern = /"([A-Za-z][A-Za-z\s]{1,25})"/i;
    const quotedMatch = subject.match(quotedPattern);
    if (quotedMatch && quotedMatch[1]) {
      return formatName(quotedMatch[1].trim());
    }

    // Pattern 4: Extract potential names (2-3 words starting with capitals)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g;
    const nameMatches = subject.match(namePattern);
    if (nameMatches) {
      // Filter out common words that aren't names
      const commonWords = [
        "Subject",
        "Email",
        "Message",
        "Contact",
        "Form",
        "Inquiry",
        "Request",
        "Issue",
        "Problem",
        "Question",
        "Feedback",
        "Support",
        "Help",
        "Service",
        "Department",
        "Team",
        "Admin",
        "System",
        "Auto",
        "Notification",
        "Alert",
        "Update",
        "Report",
        "Status",
        "Response",
        "Reply",
        "Forward",
        "FW",
        "RE",
        "Regarding",
        "About",
        "Info",
        "Information",
      ];

      for (const match of nameMatches) {
        if (
          !commonWords.includes(match) &&
          match.length >= 2 &&
          match.length <= 25
        ) {
          return formatName(match);
        }
      }
    }

    return "Unknown";
  };

  // Enhanced mobile number extraction with multiple patterns and validation
  const extractMobilesFromBody = (body: string): string[] => {
    if (!body || typeof body !== "string") return [];

    const phones = new Set<string>();

    // Pattern 1: International format with country code
    const internationalPattern =
      /(?:\+|00)\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
    const internationalMatches = body.match(internationalPattern);
    if (internationalMatches) {
      internationalMatches.forEach((match) => {
        const cleaned = cleanPhoneNumber(match);
        if (isValidPhoneNumber(cleaned)) phones.add(cleaned);
      });
    }

    // Pattern 2: Standard formats (10-11 digits)
    const standardPatterns = [
      /\b\d{10,11}\b/g, // 10-11 consecutive digits
      /\b\d{3,4}[-.\s]\d{3,4}[-.\s]\d{4}\b/g, // XXX-XXX-XXXX or XXXX-XXX-XXXX
      /\(\d{3,4}\)[-.\s]?\d{3,4}[-.\s]?\d{4}/g, // (XXX) XXX-XXXX
      /\b\d{1,4}[-.\s]\d{3,4}[-.\s]\d{3,4}[-.\s]\d{3,4}\b/g, // Various hyphenated formats
    ];

    standardPatterns.forEach((pattern) => {
      const matches = body.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const cleaned = cleanPhoneNumber(match);
          if (isValidPhoneNumber(cleaned)) phones.add(cleaned);
        });
      }
    });

    // Pattern 3: Look for phone numbers near keywords
    const phoneKeywords = [
      "phone",
      "mobile",
      "cell",
      "contact",
      "number",
      "tel",
      "call",
      "reach",
      "dial",
    ];
    phoneKeywords.forEach((keyword) => {
      const keywordPattern = new RegExp(
        `${keyword}[\\s:]*([\\d\\s\\-\\.\\(\\)\\+]{10,20})`,
        "gi"
      );
      const matches = body.match(keywordPattern);
      if (matches) {
        matches.forEach((match) => {
          const numberPart = match
            .replace(new RegExp(keyword, "gi"), "")
            .trim();
          const cleaned = cleanPhoneNumber(numberPart);
          if (isValidPhoneNumber(cleaned)) phones.add(cleaned);
        });
      }
    });

    // Pattern 4: Extract from structured data (like forms)
    const structuredPatterns = [
      /phone[\s:]*(\+?[\d\s\-\.\(\)]{10,20})/gi,
      /mobile[\s:]*(\+?[\d\s\-\.\(\)]{10,20})/gi,
      /contact[\s:]*(\+?[\d\s\-\.\(\)]{10,20})/gi,
      /tel[\s:]*(\+?[\d\s\-\.\(\)]{10,20})/gi,
    ];

    structuredPatterns.forEach((pattern) => {
      const matches = [...body.matchAll(pattern)];
      matches.forEach((match) => {
        if (match[1]) {
          const cleaned = cleanPhoneNumber(match[1]);
          if (isValidPhoneNumber(cleaned)) phones.add(cleaned);
        }
      });
    });

    return Array.from(phones);
  };

  // Extract email address from from_address_email field
  const extractEmailFromRow = (fromAddressEmail: string): string => {
    if (!fromAddressEmail || typeof fromAddressEmail !== "string") {
      return "No email found";
    }

    // Clean and validate email
    const cleanEmail = fromAddressEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(cleanEmail)) {
      return cleanEmail;
    }

    return "Invalid email format";
  };

  // Fetch Instagram username from lead API
  const fetchInstagramUsername = async (leadId: string): Promise<string> => {
    console.log(`Making API call to /api/leads/${leadId}`);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`API Response status for lead ${leadId}:`, response.status);

      if (!response.ok) {
        console.error(
          `API Error for lead ${leadId}:`,
          response.status,
          response.statusText
        );
        throw new Error(
          `Failed to fetch lead data: ${response.status} ${response.statusText}`
        );
      }

      const leadData = await response.json();
      console.log(`Lead data for ${leadId}:`, leadData);

      // Try different possible field names for Instagram username
      const instagramFields = [
        "instagram_username",
        "instagram",
        "social_links",
        "social_media",
        "ig_username",
        "insta_username",
        "social_instagram",
        "instagram_handle",
      ];

      let foundInstagram = null;

      for (const field of instagramFields) {
        if (leadData[field]) {
          console.log(
            `Found Instagram field '${field}' with value:`,
            leadData[field]
          );

          // Handle if it's a direct string
          if (typeof leadData[field] === "string") {
            foundInstagram = leadData[field];
            break;
          }

          // Handle if it's an object with Instagram data
          if (typeof leadData[field] === "object") {
            if (leadData[field].instagram) {
              foundInstagram = leadData[field].instagram;
              break;
            }
            if (leadData[field].username) {
              foundInstagram = leadData[field].username;
              break;
            }
          }
        }
      }

      if (foundInstagram) {
        // Clean up the username
        const cleanUsername = foundInstagram.toString().trim();
        const finalUsername = cleanUsername.startsWith("@")
          ? cleanUsername
          : `@${cleanUsername}`;
        console.log(`Final Instagram username for ${leadId}:`, finalUsername);
        return finalUsername;
      }

      console.log(`No Instagram username found for lead ${leadId}`);
      return "No Instagram found";
    } catch (error) {
      console.error(`Error fetching Instagram for lead ${leadId}:`, error);
      return `Error: ${error.message}`;
    }
  };

  // Helper function to format names properly
  const formatName = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  // Helper function to clean phone numbers
  const cleanPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, "");

    // If starts with +, keep it
    if (phone.includes("+")) {
      cleaned = "+" + cleaned.replace(/\+/g, "");
    }

    return cleaned;
  };

  // Helper function to validate phone numbers
  const isValidPhoneNumber = (phone: string): boolean => {
    // Remove + for length check
    const digitsOnly = phone.replace(/\+/g, "");

    // Check if it's a valid length (typically 10-15 digits)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;

    // Check for obvious invalid patterns
    if (/^0+$/.test(digitsOnly)) return false; // All zeros
    if (/^1+$/.test(digitsOnly)) return false; // All ones
    if (/^(\d)\1{9,}$/.test(digitsOnly)) return false; // Same digit repeated

    // Check for common invalid patterns
    const invalidPatterns = [
      /^123456789/,
      /^987654321/,
      /^111111111/,
      /^000000000/,
      /^999999999/,
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(digitsOnly)) return false;
    }

    return true;
  };

  // Enhanced CSV processing with email and Instagram data
  const enhanceCSV = async (csvText: string): Promise<string> => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return csvText;

    // Parse CSV headers more carefully
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    console.log("CSV Headers found:", headers);

    const subjectIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("subject")
    );
    const bodyIndex = headers.findIndex((h) =>
      h.toLowerCase().includes("body")
    );
    const fromEmailIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("from_address_email") ||
        h.toLowerCase().includes("from_email")
    );
    const leadIdIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("lead_id") ||
        h.toLowerCase().includes("leadid")
    );

    console.log("Column indices:", {
      subject: subjectIndex,
      body: bodyIndex,
      fromEmail: fromEmailIndex,
      leadId: leadIdIndex,
    });

    if (subjectIndex === -1 || bodyIndex === -1) {
      console.error("Required columns not found");
      return csvText;
    }

    const enhancedLines = [
      lines[0] +
        ",extracted_username,extracted_email,instagram_username,extracted_mobiles,mobile_count",
    ];

    // Process each row with better CSV parsing
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Better CSV parsing to handle quoted fields
      const cols = parseCSVLine(lines[i]);
      const subject = cols[subjectIndex] || "";
      const body = cols[bodyIndex] || "";
      const fromEmail = cols[fromEmailIndex] || "";
      const leadId = cols[leadIdIndex] || "";

      console.log(`Processing row ${i}:`, {
        leadId,
        fromEmail: fromEmail.substring(0, 50) + "...",
        hasSubject: !!subject,
        hasBody: !!body,
      });

      // Extract data using existing and new logic
      const username = extractUsernameFromSubject(subject);
      const email = extractEmailFromRow(fromEmail);
      const mobiles = extractMobilesFromBody(body);
      const mobileCount = mobiles.length;

      // Fetch Instagram username (with error handling)
      let instagramUsername = "No Instagram found";
      if (leadId && leadId.trim()) {
        console.log(`Fetching Instagram for lead ID: ${leadId}`);
        try {
          instagramUsername = await fetchInstagramUsername(leadId.trim());
          console.log(`Instagram result for ${leadId}:`, instagramUsername);
        } catch (error) {
          console.error(`Failed to fetch Instagram for lead ${leadId}:`, error);
          instagramUsername = "Error fetching Instagram";
        }
      } else {
        console.log(`No lead ID found for row ${i}`);
      }

      // Format the mobile numbers for CSV (handle commas properly)
      const mobilesString =
        mobiles.length > 0 ? mobiles.join(" | ") : "No mobile found";

      enhancedLines.push(
        `${lines[i]},"${username}","${email}","${instagramUsername}","${mobilesString}",${mobileCount}`
      );
    }

    return enhancedLines.join("\n");
  };

  // Helper function to parse CSV line properly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] === ",")) {
        inQuotes = true;
      } else if (
        char === '"' &&
        inQuotes &&
        (i === line.length - 1 || line[i + 1] === ",")
      ) {
        inQuotes = false;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
        i++;
        continue;
      } else {
        current += char;
      }
      i++;
    }

    result.push(current.trim());
    return result;
  };

  const cleanCSVData = async (csvText: string): Promise<string> => {
    let cleanText = csvText.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r?\n/);
    const processedLines = lines.map((line) =>
      line
        .replace(/="([^"]*)"/g, '"$1"')
        .replace(/=([^,"\s][^,]*)/g, "$1")
        .replace(/\t/g, ",")
    );
    const cleanedText = processedLines.join("\n");
    return await enhanceCSV(cleanedText);
  };

  const downloadCSV = async (campaignId: string) => {
    setDownloading(campaignId);
    try {
      const res = await fetch(`/api/inbox-csv?campaignId=${campaignId}`);
      if (!res.ok) throw new Error("Failed to download CSV");

      const csvText = await res.text();
      const cleanedCsvText = await cleanCSVData(csvText);

      const blob = new Blob([cleanedCsvText], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `enhanced_campaign_${campaignId}.csv`);
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download Enhanced CSV
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
