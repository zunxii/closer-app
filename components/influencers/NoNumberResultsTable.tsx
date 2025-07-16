"use client";

import React, { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import Papa from "papaparse";
import Toast from "./Toast";

interface Creator {
  creator_name: string;
  instagram_username: string;
  instagram_link: string;
  mail_id?: string;
  contact_no?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: number;
}

const NoNumberResultsTable = ({
  creators: initialCreators,
}: {
  creators: Creator[];
}) => {
  const [creators, setCreators] = useState<Creator[]>(initialCreators);
  const [loading, setLoading] = useState(false);
  const [emailsExtracted, setEmailsExtracted] = useState(false);
  const [campaignSubmitted, setCampaignSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data.items || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const extractEmails = async () => {
    setLoading(true);
    try {
      await fetch("/api/reset-csv", { method: "DELETE" });

      const instagramLinks = creators
        .map((c) => {
          if (c.instagram_link) {
            return c.instagram_link.trim();
          }
          if (c.instagram_username) {
            return `https://www.instagram.com/${c.instagram_username
              .replace(/^@/, "")
              .trim()}/`;
          }
          return null;
        })
        .filter((link): link is string => Boolean(link));

      if (instagramLinks.length === 0) {
        throw new Error("No valid Instagram links to process.");
      }

      const batchSize = 20;
      const batches: string[][] = [];
      for (let i = 0; i < instagramLinks.length; i += batchSize) {
        batches.push(instagramLinks.slice(i, i + batchSize));
      }

      let csvContent = "";

      for (let i = 0; i < batches.length; i++) {
        const formData = new FormData();
        batches[i].forEach((link) => formData.append("links", link));

        const resp = await fetch("/api/process", {
          method: "POST",
          headers: i === 0 ? { "x-reset-csv": "true" } : undefined,
          body: formData,
        });

        const data = await resp.json();
        csvContent = data.cloud_response?.csv_content || csvContent;
      }

      if (!csvContent) {
        throw new Error("No CSV content found in response.");
      }

      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
      });

      const emailMap: Record<string, string> = {};
      for (const row of parsed.data as any[]) {
        let instagramUsername = (row["INSTAGRAM"] || "")
          .trim()
          .replace(/^@/, "")
          .replace(/\/$/, "")
          .toLowerCase();

        const email =
          row["EMAIL"] ||
          row["Email"] ||
          row["email"] ||
          row["Email Address"] ||
          "";

        if (instagramUsername && email && email.includes("@")) {
          emailMap[instagramUsername] = email;
        }
      }

      const updatedCreators = creators.map((creator) => {
        const username = creator.instagram_username
          ?.toLowerCase()
          .replace(/^@/, "")
          .trim();
        if (username && emailMap[username]) {
          return { ...creator, mail_id: emailMap[username] };
        }
        return creator;
      });

      setCreators(updatedCreators);
      setEmailsExtracted(true);
      showToast("✅ Emails extracted successfully");
    } catch (error: any) {
      console.error("Email extraction failed:", error);
      showToast("❌ Email extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const addToCampaign = async () => {
    if (!selectedCampaign) {
      return showToast("⚠️ Please select a campaign.");
    }

    setLoading(true);
    try {
      const validLeads = creators.filter((c) => c.mail_id);

      if (validLeads.length === 0) {
        return showToast("⚠️ No valid leads found.");
      }

      const res = await fetch("/api/add-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: selectedCampaign,
          leads: validLeads.map((c) => ({
            first_name: c.creator_name,
            email: c.mail_id!,
            instagram: c.instagram_username,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to add leads");

      showToast("✅ Added to campaign");
      setCampaignSubmitted(true);

      setTimeout(() => {
        fetch("/api/reset-csv", { method: "DELETE" });
      }, 3000);
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to add to campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 text-black">
      {toastMessage && <Toast message={toastMessage} />}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {creators.length} Creators Without Contact Number
        </h2>
        <button
          onClick={emailsExtracted ? addToCampaign : extractEmails}
          disabled={
            loading ||
            creators.length === 0 ||
            (emailsExtracted && campaignSubmitted) ||
            (emailsExtracted && !selectedCampaign)
          }
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 inline-flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              {emailsExtracted ? "Adding..." : "Extracting..."}
            </>
          ) : (
            <>
              <MailCheck className="w-4 h-4 mr-2" />
              {emailsExtracted
                ? campaignSubmitted
                  ? "Added"
                  : "Add to Campaign"
                : "Extract Emails"}
            </>
          )}
        </button>
      </div>

      {emailsExtracted && campaigns.length > 0 && (
        <div className="mb-4 max-w-sm">
          <label className="block mb-1 font-medium text-black">
            Select Campaign:
          </label>
          <select
            className="border border-gray-300 text-black rounded px-3 py-2 w-full"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">-- Choose Campaign --</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto border rounded mt-4">
        <table className="min-w-full text-sm text-black bg-white">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Instagram</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {creators.map((c, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{c.creator_name}</td>
                <td className="px-4 py-2">
                  <a
                    href={c.instagram_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black underline hover:text-gray-800"
                  >
                    {c.instagram_link}
                  </a>
                </td>
                <td className="px-4 py-2">{c.instagram_username}</td>
                <td className="px-4 py-2">
                  {c.mail_id || (
                    <span className="text-gray-400">Not found</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoNumberResultsTable;
