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

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    try {
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

  const sentences = useMemo(() => {
    if (!result?.transcription?.words) return [];

    const words = result.transcription.words;
    const sentences = [];
    let currentSentence = [];
    for (let i = 0; i < words.length; i++) {
      currentSentence.push(words[i]);
      if (
        words[i].text.endsWith(".") ||
        words[i].text.endsWith("!") ||
        words[i].text.endsWith("?") ||
        i === words.length - 1
      ) {
        sentences.push([...currentSentence]);
        currentSentence = [];
      }
    }
    return sentences;
  }, [result]);

  const generateTxtContent = () => {
    return sentences
      .map((sentence) => {
        const start = formatTime(sentence[0].start);
        const end = formatTime(sentence.at(-1)?.end);
        const text = sentence.map((w) => w.text).join(" ");
        return `[${start} - ${end}] ${text}`;
      })
      .join("\n");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b pb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Transcription Processor
          </h1>
          <p className="text-gray-600">
            Upload an MP4 to extract audio & get transcription.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload MP4 File
            </label>
            <div className="relative w-full">
              <input
                id="file-upload"
                type="file"
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
                title="Upload MP4 File"
              />
              <div className="block w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm text-black cursor-pointer hover:bg-gray-100 transition pointer-events-none">
                {file ? file.name : "Choose an MP4 file"}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Start Transcription Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg transition font-medium text-white ${
                loading || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 cursor-pointer"
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

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
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
        <div className="bg-white border border-gray-200 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center">
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
            <div className="p-6 space-y-6">
              {/* Download Section */}
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

              {/* Sentence Display */}
              <div className="grid gap-4 bg-gray-50 border border-gray-200 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                {sentences.map((sentence, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-gray-300 rounded shadow-sm hover:ring-2 hover:ring-indigo-300 transition"
                  >
                    <p className="text-sm text-gray-800 font-medium">
                      {sentence.map((w) => w.text).join(" ")}
                    </p>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>
                        🕒 {formatTime(sentence[0].start)} -{" "}
                        {formatTime(sentence.at(-1)?.end)}
                      </span>
                      <span>
                        🔋 Avg Energy: {avgEnergy(sentence).toFixed(2)}
                      </span>
                    </div>
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
  const s = Math.floor(ms / 1000);
  const minutes = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (s % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function avgEnergy(words: any[]) {
  const energies = words.map((w) => w.energy ?? 0);
  const sum = energies.reduce((a, b) => a + b, 0);
  return energies.length ? sum / energies.length : 0;
}
