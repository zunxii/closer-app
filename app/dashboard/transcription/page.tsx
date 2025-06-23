"use client";

import { useState, useMemo } from "react";
import {
  Upload,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Mic,
} from "lucide-react";

export default function TranscriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://trascription01.onrender.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch(`${BACKEND_URL}/transcribe-video`, {
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
    setFile(null);
    setResult(null);
  };

  const badEndWords = [
    "to",
    "and",
    "but",
    "or",
    "if",
    "so",
    "because",
    "that",
    "which",
    "with",
    "for",
    "of",
    "a",
    "an",
    "the",
    "in",
    "on",
    "at",
    "by",
    "as",
  ];

  const sentences = useMemo(() => {
    if (!result?.transcription?.words) return [];

    const words = result.transcription.words;
    const sentences: any[][] = [];
    let currentSentence: any[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentSentence.push(word);

      const isLast = i === words.length - 1;
      const endsWithPunctuation = /[.!?]/.test(word.text);
      const nextWord = words[i + 1];

      if (
        endsWithPunctuation ||
        isLast ||
        (!badEndWords.includes(word.text.toLowerCase()) &&
          nextWord?.text?.[0]?.toUpperCase() === nextWord?.text?.[0])
      ) {
        sentences.push([...currentSentence]);
        currentSentence = [];
      }
    }

    if (currentSentence.length) {
      sentences.push(currentSentence);
    }

    return sentences;
  }, [result]);

  const generateTxtContent = () => {
    return sentences
      .map((sentence, i) => {
        const start = formatTime(sentence[0].start);
        const end = formatTime(sentence.at(-1)?.end);
        const lines = [`Sentence ${i + 1}: [${start} - ${end}]`];
        for (const word of sentence) {
          lines.push(
            `  ${word.text} → start: ${formatTime(
              word.start
            )}, end: ${formatTime(word.end)}, confidence: ${
              word.confidence?.toFixed(2) ?? "0.00"
            }, energy: ${word.energy?.toFixed(2) ?? "0.00"}`
          );
        }
        return lines.join("\n");
      })
      .join("\n\n");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 border-b pb-6 space-y-4 sm:space-y-0">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg w-fit">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Transcription Processor
          </h1>
          <p className="text-gray-600">
            Upload an MP4 file to get the transcribed text with word-level
            insights.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload MP4 File
            </label>
            <div className="relative w-full">
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
              />
              <div className="block w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm text-black cursor-pointer hover:bg-gray-100 transition pointer-events-none">
                {file ? file.name : "Choose an MP4 file"}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || !file}
              className={`cursor-pointer flex-1 flex items-center justify-center py-3 px-6 rounded-lg transition font-medium text-white ${
                loading || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Transcription
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer flex items-center justify-center py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b flex items-center">
            {result.error ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h2 className="text-lg font-semibold text-red-600">
                  Error: {result.error}
                </h2>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <h2 className="text-lg font-semibold text-green-600">
                  Transcription Complete
                </h2>
              </>
            )}
          </div>

          {!result.error && (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Downloads */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.audio_path && (
                  <a
                    href={`${BACKEND_URL}${result.audio_path}`}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition shadow"
                    download
                  >
                    <Download className="w-4 h-4" />
                    Download MP3
                  </a>
                )}
                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(result.transcription, null, 2)
                  )}`}
                  download="transcription.json"
                  className="flex items-center justify-center gap-2 bg-sky-600 text-white py-2.5 px-4 rounded-lg hover:bg-sky-700 transition shadow"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </a>
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                    generateTxtContent()
                  )}`}
                  download="transcription.txt"
                  className="flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 px-4 rounded-lg hover:bg-amber-600 transition shadow"
                >
                  <Download className="w-4 h-4" />
                  Download TXT
                </a>
              </div>

              {/* Word-Level Table */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-indigo-600" />
                  Word-Level Details
                </h3>

                {sentences.map((sentence, idx) => (
                  <div key={idx} className="mb-6">
                    <p className="text-base font-medium text-gray-800 mb-2">
                      📝 Sentence {idx + 1}
                    </p>

                    <table className="min-w-[600px] w-full text-sm text-left text-gray-700 border border-gray-300 rounded-lg shadow-sm">
                      <thead className="text-xs uppercase bg-gray-100 border-b text-gray-600">
                        <tr>
                          <th className="px-4 py-2">Word</th>
                          <th className="px-4 py-2">Start</th>
                          <th className="px-4 py-2">End</th>
                          <th className="px-4 py-2">Confidence</th>
                          <th className="px-4 py-2">Energy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sentence.map((w, i) => (
                          <tr
                            key={i}
                            className="border-b hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2 font-medium text-gray-800">
                              {w.text}
                            </td>
                            <td className="px-4 py-2">{formatTime(w.start)}</td>
                            <td className="px-4 py-2">{formatTime(w.end)}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      w.confidence > 0.9
                                        ? "#10b981"
                                        : w.confidence > 0.75
                                        ? "#f59e0b"
                                        : "#ef4444",
                                  }}
                                />
                                {w.confidence?.toFixed(2) ?? "0.00"}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="absolute top-0 left-0 h-2 bg-blue-500"
                                    style={{
                                      width: `${(w.energy * 100).toFixed(0)}%`,
                                    }}
                                  />
                                </div>
                                {w.energy?.toFixed(2) ?? "0.00"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helpers
function formatTime(ms: number) {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function avgEnergy(words: any[]) {
  const energies = words.map((w) => w.energy ?? 0);
  const sum = energies.reduce((a, b) => a + b, 0);
  return energies.length ? sum / energies.length : 0;
}
