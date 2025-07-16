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
  const [extractedCount, setExtractedCount] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLinks = links.trim().split("\n").filter(Boolean);
    if (rawLinks.length === 0) return;

    setTotalLinks(rawLinks.length);
    setExtractedCount(0);
    setLoading(true);
    setResult(null);
    setDownloadUrl(null);

    const batchSize = 20;
    const batches: string[][] = [];
    for (let i = 0; i < rawLinks.length; i += batchSize) {
      batches.push(rawLinks.slice(i, i + batchSize));
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        const formData = new FormData();
        batches[i].forEach((link: string | Blob) =>
          formData.append("links", link)
        );

        const resp = await fetch(`/api/process`, {
          method: "POST",
          headers: {
            ...(i === 0 ? { "x-reset-csv": "true" } : {}),
          },
          body: formData,
        });

        const data = await resp.json();
        setExtractedCount((prev) => prev + batches[i].length);

        if (data.cloud_response?.csv_path) {
          setDownloadUrl(data.cloud_response.csv_path);
        }
      }
      setResult({ data: rawLinks });
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetch("/api/reset-csv", {
      method: "DELETE",
    });
    setLinks("");
    setResult(null);
    setDownloadUrl(null);
    setExtractedCount(0);
    setTotalLinks(0);
  };

  const linkCount = links.trim().split("\n").filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Instagram Links
              </label>
              <textarea
                className="w-full h-40 p-4 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm font-mono placeholder-gray-400"
                placeholder={`https://www.instagram.com/username1/\nhttps://www.instagram.com/username2/`}
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

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center py-3 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={loading || !links.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting {extractedCount}/{totalLinks}
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

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Processed Links
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {downloadUrl && (
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
                        href={downloadUrl}
                        className="inline-flex items-center bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        download
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
