"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Download,
  Search,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import MatchResultsTable from "./MatchResultsTable";

const MatchForm = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedCreators, setMatchedCreators] = useState([]);
  const [processingStep, setProcessingStep] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return alert("Please paste links or usernames.");
    setLoading(true);
    setProcessingStep("Extracting usernames...");

    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: input }),
    });

    const result = await res.json();
    if (!result.success) {
      alert("Script failed: " + result.error);
      setLoading(false);
      setProcessingStep("");
      return;
    }

    setProcessingStep("Loading username database...");
    const usernames = result.usernames;
    const inputSet = new Set(usernames.map((u) => u.toLowerCase()));

    setProcessingStep("Searching creator database...");
    let all = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error || !data || data.length === 0) break;
      all = [...all, ...data];
      page++;
    }

    setProcessingStep("Matching creators...");
    const seen = new Set();
    const matched = all.filter((creator) => {
      const uname = (creator.instagram_username || "").toLowerCase();
      const valid =
        inputSet.has(uname) &&
        creator.contact_no &&
        creator.contact_no.trim() !== "-" &&
        !seen.has(uname);
      if (valid) seen.add(uname);
      return valid;
    });

    setMatchedCreators(matched);
    setLoading(false);
    setProcessingStep("");
  };

  const handleDownload = () => {
    const csv = Papa.unparse(
      matchedCreators.map((c) => ({
        CreatorName: c.creator_name,
        InstagramLink: c.instagram_link,
        InstagramUsername: c.instagram_username,
        Email: c.mail_id,
        ContactNo: c.contact_no || "",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matched_creators.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-auto bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-300">
          {/* Input Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-black" />
              <label className="text-lg font-semibold text-black">
                Instagram Links & Usernames
              </label>
            </div>
            <div className="relative">
              <textarea
                rows={8}
                placeholder={`Paste Instagram links or usernames here (one per line)

Examples:
https://instagram.com/username
username`}
                className="w-full border-2 border-gray-300 rounded-2xl p-6 font-mono text-sm text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-300 resize-none bg-white placeholder-gray-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                {input.split("\n").filter((line) => line.trim()).length} entries
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative bg-black text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  {processingStep || "Processing..."}
                </span>
              ) : (
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  Find Matching Creators
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>

          {/* Loading Progress */}
          {loading && (
            <div className="mb-8">
              <div className="bg-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-center text-gray-700 font-medium">
                  {processingStep || "Working on your request..."}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {matchedCreators.length > 0 && !loading && (
            <div className="mb-8">
              <div className="bg-gray-100 border border-gray-300 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-black" />
                  <span className="text-xl font-semibold text-black">
                    Success! Found {matchedCreators.length} matching creators
                  </span>
                </div>
                <p className="text-center text-gray-700">
                  Your matched creators are ready for download and review
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        {matchedCreators.length > 0 && (
          <div className="mt-8">
            <MatchResultsTable
              matchedCreators={matchedCreators}
              handleDownload={handleDownload}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchForm;
