"use client";

import React, { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import Papa from "papaparse";
import Toast from "./Toast";
import { supabase } from "@/lib/supabaseClient";

const BACKEND_URL = "https://instatoemail.onrender.com";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      const instagramLinks = creators
        .map((c) => {
          const username = c.instagram_username?.trim();
          if (!username) return null;
          if (username.startsWith("http")) return username;
          return `https://www.instagram.com/${username.replace(/^@/, "")}/`;
        })
        .filter((link): link is string => Boolean(link));

      if (instagramLinks.length === 0) {
        throw new Error("No valid Instagram usernames to process.");
      }

      const formData = new FormData();
      instagramLinks.forEach((link) => formData.append("links", link));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BACKEND_URL}/process/`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      let csvContent = "";
      if (result.csv_content) csvContent = result.csv_content;
      else if (result.data && typeof result.data === "string")
        csvContent = result.data;
      else if (result.cloud_response?.csv_content)
        csvContent = result.cloud_response.csv_content;
      else throw new Error("No CSV content found in response");

      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
      });

      const emailMap: Record<string, string> = {};
      for (const row of parsed.data as any[]) {
        let instagramUrl =
          row["INSTAGRAM"] ||
          row["Instagram"] ||
          row["instagram"] ||
          row["Instagram Link"] ||
          "";
        let username = instagramUrl
          .toLowerCase()
          .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
          .replace(/\/$/, "")
          .replace(/^@/, "")
          .trim();
        const email =
          row["EMAIL"] ||
          row["Email"] ||
          row["email"] ||
          row["Email Address"] ||
          "";
        if (username && email && email.includes("@")) {
          emailMap[username] = email;
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
    if (!selectedCampaign) return showToast("⚠️ Please select a campaign.");
    setLoading(true);
    try {
      const validLeads = creators.filter((c) => c.mail_id);

      if (validLeads.length === 0) return showToast("⚠️ No valid leads found.");

      // Step 1: Insert all into creators table
      const { error: insertError } = await supabase.from("creators").insert(
        validLeads.map((c) => ({
          creator_name: c.creator_name || null,
          instagram_username: c.instagram_username,
          instagram_link: c.instagram_link,
          mail_id: c.mail_id || null,
          contact_no: c.contact_no || null,
        }))
      );

      if (insertError) {
        console.error("Supabase insert error:", insertError.message);
        showToast("❌ Supabase insert failed");
      } else {
        console.log("✅ Data inserted into Supabase");
      }

      // Step 2: Add leads to campaign
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
            Search & Select Campaign:
          </label>
          <select
            className="border border-gray-300 text-black rounded px-3 py-2 w-full"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">-- Choose Campaign --</option>
            {campaigns
              .filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((c) => (
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
