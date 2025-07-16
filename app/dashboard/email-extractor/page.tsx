"use client";

import { useState } from "react";
import {
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

  const handleSubmit = async () => {
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

    let accumulatedCsv = "";
    let csvHeaders = "";

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

        // Handle CSV accumulation
        if (data.cloud_response?.csv_content) {
          const csvLines = data.cloud_response.csv_content
            .split("\n")
            .filter(Boolean);

          if (i === 0) {
            // First batch - include headers
            csvHeaders = csvLines[0];
            accumulatedCsv = csvLines.join("\n");
          } else {
            // Subsequent batches - skip headers and append data
            const dataLines = csvLines.slice(1);
            if (dataLines.length > 0) {
              accumulatedCsv += "\n" + dataLines.join("\n");
            }
          }
        }
      }

      // Only set result after all batches are processed
      setResult({ csv: accumulatedCsv });
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

  // Colorful Instagram Icon Component
  const InstagramIcon = () => (
    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 rounded-lg flex items-center justify-center">
      <svg
        className="w-5 h-5 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="space-y-6 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white rounded-xl mr-4 shadow-sm">
              <InstagramIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Instagram Link Processor
              </h1>
              <p className="text-gray-600 mt-1">
                Extract contact information from Instagram profiles
              </p>
            </div>
          </div>
        </div>

        {/* Main Processing Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Instagram Links
                </label>
                <textarea
                  className="w-full h-40 p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none font-mono placeholder-gray-400 text-black"
                  placeholder={`https://www.instagram.com/username1/\nhttps://www.instagram.com/username2/`}
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  disabled={loading}
                />
                {links && (
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {linkCount} link{linkCount !== 1 ? "s" : ""} detected
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center py-3 px-6 bg-black text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  disabled={loading || !links.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing {extractedCount}/{totalLinks}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Process Links
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center py-3 px-6 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card - Only shown after processing is complete */}
        {result && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 mb-1">
                        Processing Failed
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
                          Processing Complete
                        </h3>
                        <p className="text-sm text-green-700">
                          Successfully processed {totalLinks} Instagram links
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.csv && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Results
                      </h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-80">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">
                                  #
                                </th>
                                {result.csv
                                  .split("\n")[0]
                                  .split(",")
                                  .map((header: string, idx: number) => (
                                    <th
                                      key={idx}
                                      className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
                                    >
                                      {header}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {result.csv
                                .split("\n")
                                .slice(1)
                                .filter(Boolean)
                                .map((row: string, rowIdx: number) => (
                                  <tr key={rowIdx} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-200 font-medium">
                                      {rowIdx + 1}
                                    </td>
                                    {row
                                      .split(",")
                                      .map((cell: string, cellIdx: number) => (
                                        <td
                                          key={cellIdx}
                                          className="px-3 py-2 text-gray-900 border-r border-gray-200 last:border-r-0"
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {downloadUrl && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Download Results
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get your processed data as CSV
                        </p>
                      </div>
                      <a
                        href={downloadUrl}
                        className="inline-flex items-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        download
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
