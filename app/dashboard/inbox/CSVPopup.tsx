"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Trash2,
  Save,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";

interface CreatorRow {
  instagram_username: string;
  contact_no: string;
  mail_id?: string;
}

export default function CSVPopup({
  csvText,
  onClose,
}: {
  csvText: string;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<CreatorRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!csvText) return;

    console.log("Raw CSV text:", csvText.substring(0, 500));

    // Parse CSV with robust options
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      trimHeaders: true,
      delimiter: ",", // Explicitly set delimiter
      quoteChar: '"',
      escapeChar: '"',
      transform: (value, field) => {
        // Clean the value
        let cleanValue = value.toString().trim();

        // Remove Excel-style formula wrapping
        if (cleanValue.startsWith('="') && cleanValue.endsWith('"')) {
          cleanValue = cleanValue.slice(2, -1);
        } else if (cleanValue.startsWith("=") && cleanValue.includes('"')) {
          cleanValue = cleanValue.slice(1).replace(/"/g, "");
        } else if (cleanValue.startsWith("=")) {
          cleanValue = cleanValue.slice(1);
        }

        // Remove any remaining quotes at start/end
        cleanValue = cleanValue.replace(/^"(.*)"$/, "$1");

        return cleanValue;
      },
    });

    console.log("Parsed CSV data:", parsed.data);
    console.log("CSV headers detected:", parsed.meta.fields);

    if (parsed.errors.length > 0) {
      console.error("CSV parsing errors:", parsed.errors);
    }

    // More robust field mapping
    const mappedRows = (parsed.data as any[]).map((row, index) => {
      console.log(`Row ${index}:`, row);

      // Function to find field value with flexible matching
      const getFieldValue = (possibleNames: string[]): string => {
        // First try exact matches
        for (const name of possibleNames) {
          if (
            row[name] !== undefined &&
            row[name] !== null &&
            row[name] !== ""
          ) {
            return row[name].toString().trim();
          }
        }

        // Then try case-insensitive and partial matches
        const keys = Object.keys(row);
        for (const name of possibleNames) {
          const lowerName = name.toLowerCase();
          const matchedKey = keys.find((key) => {
            const lowerKey = key.toLowerCase();
            return (
              lowerKey === lowerName ||
              lowerKey.includes(lowerName) ||
              lowerName.includes(lowerKey)
            );
          });

          if (
            matchedKey &&
            row[matchedKey] !== undefined &&
            row[matchedKey] !== null &&
            row[matchedKey] !== ""
          ) {
            return row[matchedKey].toString().trim();
          }
        }

        return "";
      };

      // Map fields with comprehensive name variations
      const mappedRow: CreatorRow = {
        instagram_username: getFieldValue([
          "instagram_username",
          "Username",
          "username",
          "social_handle",
          "handle",
          "instagram",
          "ig_username",
          "user",
          "name",
          "creator_name",
          "influencer_name",
          "account_name",
        ]),
        contact_no: getFieldValue([
          "contact_no",
          "Phone",
          "phone",
          "phone_no",
          "Contact No",
          "contact",
          "mobile",
          "number",
          "phone_number",
          "contact_number",
          "mobile_number",
          "cell",
          "telephone",
        ]),
        mail_id: getFieldValue([
          "mail_id",
          "Email",
          "email",
          "Mail",
          "email_address",
          "e_mail",
          "gmail",
          "mail",
          "email_id",
          "e-mail",
        ]),
      };

      return mappedRow;
    });

    console.log("Mapped rows:", mappedRows);

    // Filter out completely empty rows
    const filteredRows = mappedRows.filter((row) => {
      const hasUsername =
        row.instagram_username && row.instagram_username.length > 0;
      const hasContact = row.contact_no && row.contact_no.length > 0;
      const hasEmail = row.mail_id && row.mail_id.length > 0;
      return hasUsername || hasContact || hasEmail;
    });

    console.log("Filtered rows:", filteredRows);
    setRows(filteredRows);
  }, [csvText]);

  const handleChange = (
    index: number,
    key: keyof CreatorRow,
    value: string
  ) => {
    const updated = [...rows];
    updated[index][key] = value;
    setRows(updated);
  };

  const handleDelete = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);

    try {
      // Prepare data for insertion
      const dataToInsert = rows.map((r) => ({
        instagram_username: r.instagram_username || null,
        contact_no: r.contact_no || null,
        mail_id: r.mail_id || null,
        creator_name: null,
        instagram_link: r.instagram_username
          ? `https://instagram.com/${r.instagram_username.replace("@", "")}`
          : null,
      }));

      const { error } = await supabase.from("creators").insert(dataToInsert);

      if (error) {
        setErrorMessage(`Failed to save: ${error.message}`);
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred while saving data");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl relative overflow-hidden max-h-[90vh] text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black z-10 bg-white rounded-full p-1 shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Edit & Save Inbox Data
          </h2>
          <p className="text-gray-600 text-sm">
            Review and edit the imported data before saving to database
          </p>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          {rows.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                No data found in CSV file
              </div>
              <div className="text-sm text-gray-400">
                Check the browser console for debugging information
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-slate-700">
                      Instagram Username
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-slate-700">
                      Contact Number
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-slate-700">
                      Email Address
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          className="w-full text-black bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white rounded px-2 py-1"
                          value={row.instagram_username || ""}
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "instagram_username",
                              e.target.value
                            )
                          }
                          placeholder="@username"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          className="w-full text-black bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white rounded px-2 py-1"
                          value={row.contact_no || ""}
                          onChange={(e) =>
                            handleChange(idx, "contact_no", e.target.value)
                          }
                          placeholder="+1234567890"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          className="w-full text-black bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white rounded px-2 py-1"
                          value={row.mail_id || ""}
                          onChange={(e) =>
                            handleChange(idx, "mail_id", e.target.value)
                          }
                          placeholder="email@example.com"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                          title="Delete row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-20">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <CheckCircle className="text-green-600 w-8 h-8" />
              <div>
                <h3 className="text-green-800 font-semibold text-lg">
                  Success!
                </h3>
                <p className="text-green-700">
                  Data has been successfully saved to the database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600 w-5 h-5" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            {rows.length} {rows.length === 1 ? "row" : "rows"} to be saved
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                saving
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              disabled={saving || rows.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save to Database
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
