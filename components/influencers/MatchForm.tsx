import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Download,
  Instagram,
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
  const [matchedCreators, setMatchedCreators] = useState<any[]>([]);
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
    const usernamesRes = await fetch("/usernames.json");
    const usernames: string[] = await usernamesRes.json();
    const inputSet = new Set(usernames.map((u) => u.toLowerCase()));

    setProcessingStep("Searching creator database...");
    let all: any[] = [];
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Input Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-sky-600" />
              <label className="text-lg font-semibold text-black">
                Instagram Links & Usernames
              </label>
            </div>
            <div className="relative">
              <textarea
                rows={8}
                placeholder="Paste Instagram links or usernames here (one per line)&#10;&#10;Examples:&#10;https://instagram.com/username&#10;@username&#10;username"
                className="w-full border-2 border-sky-200 rounded-2xl p-6 font-mono text-sm text-black focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all duration-300 resize-none bg-gradient-to-br from-white to-sky-50/30 placeholder-gray-500"
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
              className="group relative bg-gradient-to-r from-sky-600 to-blue-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
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
              <div className="bg-sky-100 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-center text-sky-700 font-medium">
                  {processingStep || "Working on your request..."}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {matchedCreators.length > 0 && !loading && (
            <div className="mb-8">
              <div className="bg-green-100 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-xl font-semibold text-green-800">
                    Success! Found {matchedCreators.length} matching creators
                  </span>
                </div>
                <p className="text-center text-green-700">
                  Your matched creators are ready for download and review
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {matchedCreators.length > 0 && (
          <div className="mt-8">
            <MatchResultsTable
              matchedCreators={matchedCreators}
              handleDownload={handleDownload}
            />
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-black mb-2">Smart Matching</h3>
            <p className="text-gray-700 text-sm">
              Advanced algorithms to find exact matches from your input
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-black mb-2">Easy Export</h3>
            <p className="text-gray-700 text-sm">
              Download your results as CSV for further analysis
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-black mb-2">
              Comprehensive Data
            </h3>
            <p className="text-gray-700 text-sm">
              Access creator names, contacts, and social links
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchForm;
