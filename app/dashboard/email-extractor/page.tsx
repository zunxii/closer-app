"use client";
import { useState } from "react";
import {
  Instagram,
  Upload,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function InstagramLinkProcessor() {
  const [links, setLinks] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://instatoemail.onrender.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLinks = links.trim().split("\n").filter(Boolean);
    if (rawLinks.length === 0) return;

    const formData = new FormData();
    rawLinks.forEach((link) => formData.append("links", link));

    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch(`${BACKEND_URL}/process/`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLinks("");
    setResult(null);
  };

  const linkCount = links.trim().split("\n").filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-4">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Instagram Link Processor
            </h1>
            <p className="text-gray-600 mt-1">
              Extract contact information from Instagram profiles
            </p>
          </div>
        </div>
      </div>

      {/* Main Processing Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-light text-gray-900 mb-1">
            Process Links
          </h2>
          <p className="text-gray-600 text-sm">
            Paste Instagram profile links below, one per line
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Instagram Links
              </label>
              <textarea
                className="w-full h-40 p-4 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm font-mono placeholder-gray-400"
                placeholder="https://www.instagram.com/username1/
https://www.instagram.com/username2/
https://www.instagram.com/username3/"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                disabled={loading}
              />
              {links && (
                <div className="flex items-center text-xs text-black">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {linkCount} link{linkCount !== 1 ? "s" : ""} detected
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center py-3 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={loading || !links.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process Links
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 font-medium"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-light text-gray-900 flex items-center">
              {result.error ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                  Processing Failed
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Processing Complete
                </>
              )}
            </h2>
          </div>

          <div className="p-6">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Error occurred
                    </h3>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800 mb-1">
                        Successfully processed
                      </h3>
                      <p className="text-sm text-green-700">
                        Your Instagram links have been processed and contact
                        information extracted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Extracted Data
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Download Section */}
                {result.cloud_response?.csv_path ? (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          Download Results
                        </h3>
                        <p className="text-sm text-gray-600">
                          Download the processed data as a CSV file
                        </p>
                      </div>
                      <a
                        href={`${BACKEND_URL}${result.cloud_response.csv_path}`}
                        className="inline-flex items-center bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        download
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </a>
                    </div>
                  </div>
                ) : result.cloud_response?.error ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800 mb-1">
                          Download unavailable
                        </h3>
                        <p className="text-sm text-yellow-700">
                          {result.cloud_response.error}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">How to use</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            • Paste Instagram profile URLs in the text area above, one per line
          </p>
          <p>
            • Click "Process Links" to extract contact information from profiles
          </p>
          <p>• Download the results as a CSV file for further analysis</p>
          <p>
            • Supported formats: instagram.com/username or
            instagram.com/username/
          </p>
        </div>
      </div>
    </div>
  );
}
