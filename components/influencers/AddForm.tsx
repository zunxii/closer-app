"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Plus,
  RotateCcw,
  Save,
  CheckCircle,
  Users,
  Database,
  Sparkles,
  CloudUpload,
  Table,
  Info,
} from "lucide-react";
import { Creator } from "@/types/index";
import CreatorRow from "./CreatorRow";

// Default empty row
const defaultRow: Creator = {
  creator_name: "",
  instagram_link: "",
  mail_id: "",
  contact_no: "",
  instagram_username: "",
};

// Function to extract username from IG URL
const extractInstagramUsername = (link: string): string => {
  try {
    const url = new URL(link.trim());
    return url.pathname.replace(/\//g, "");
  } catch {
    return "";
  }
};

// Map aliases to column keys
const headerAliases: { [alias: string]: keyof Creator } = {
  creator_name: "creator_name",
  name: "creator_name",
  "full name": "creator_name",
  instagram: "instagram_link",
  instagram_link: "instagram_link",
  link: "instagram_link",
  url: "instagram_link",
  email: "mail_id",
  mail: "mail_id",
  mail_id: "mail_id",
  contact: "contact_no",
  contact_no: "contact_no",
  phone: "contact_no",
  username: "instagram_username",
  instagram_username: "instagram_username",
};

const AddForm = () => {
  const [rows, setRows] = useState<Creator[]>([{ ...defaultRow }]);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize header to get key
  const getKeyFromHeader = (header: string): keyof Creator | null => {
    const normalized = header.toLowerCase().trim().replace(/ /g, "_");
    return headerAliases[normalized] || null;
  };

  // Handle input change
  const handleInputChange = (
    rowIndex: number,
    key: keyof Creator,
    value: string
  ) => {
    const updated = [...rows];
    updated[rowIndex][key] = value;

    if (key === "instagram_link") {
      updated[rowIndex].instagram_username = extractInstagramUsername(value);
    }

    setRows(updated);
  };

  // Handle paste
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    colKey: keyof Creator
  ) => {
    const clipboard = e.clipboardData.getData("text");
    const lines = clipboard.trim().split("\n");

    if (!lines.length) return;

    const firstRow = lines[0].split("\t").map((h) => h.trim().toLowerCase());
    const possibleKeys = firstRow.map(getKeyFromHeader);
    const isHeaderRow = possibleKeys.filter(Boolean).length >= 2;

    const dataLines = isHeaderRow ? lines.slice(1) : lines;
    const newRows = [...rows];

    dataLines.forEach((line, i) => {
      const r = rowIndex + i;
      const cells = line.split("\t");

      if (!newRows[r]) newRows.push({ ...defaultRow });

      cells.forEach((cell, j) => {
        const value = cell.trim();
        if (!value) return;

        let key: keyof Creator | null;

        if (isHeaderRow) {
          key = getKeyFromHeader(firstRow[j]);
        } else {
          if (cells.length === 1) {
            // only 1 column, paste vertically
            key = colKey;
          } else {
            // fallback order
            key = [
              "creator_name",
              "instagram_link",
              "contact_no",
              "mail_id",
              "instagram_username",
            ][j] as keyof Creator;
          }
        }

        if (key) {
          newRows[r][key] = value;

          if (key === "instagram_link") {
            newRows[r].instagram_username = extractInstagramUsername(value);
          }
        }
      });
    });

    setRows(newRows);
    e.preventDefault();
  };

  // Add row
  const handleAddRow = () => setRows([...rows, { ...defaultRow }]);

  // Reset all rows
  const handleResetRows = () => setRows([{ ...defaultRow }]);

  // Remove row
  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  // Submit to Supabase
  const handleSubmitRows = async () => {
    setIsSubmitting(true);

    const cleanedRows = rows.map((row) => ({
      ...row,
      instagram_username: extractInstagramUsername(row.instagram_link),
    }));

    const { error } = await supabase.from("creators").insert(cleanedRows);

    if (error) {
      alert("❌ Failed to add creators: " + error.message);
    } else {
      setAddSuccess(true);
      setRows([{ ...defaultRow }]);
      setTimeout(() => setAddSuccess(false), 3000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-auto bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Table Container */}
        <div className="bg-white rounded-3xl shadow-2xl border-black overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Table className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    Creator Database
                  </h2>
                  <p className="text-gray-800 text-sm">
                    Managing {rows.length} creator{rows.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddRow}
                  className="group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  Add Row
                </button>

                <button
                  onClick={handleResetRows}
                  className="group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  Reset All
                </button>

                <button
                  onClick={handleSubmitRows}
                  disabled={isSubmitting}
                  className={`group flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                    isSubmitting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-white text-black hover:bg-gray-100 hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Submit All
                    </>
                  )}
                </button>

                {addSuccess && (
                  <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border border-gray-400 shadow-lg animate-pulse">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="font-medium text-sm">Success!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Creator Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Instagram
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {rows.map((row, index) => (
                  <CreatorRow
                    key={index}
                    row={row}
                    index={index}
                    onChange={handleInputChange}
                    onRemove={handleRemoveRow}
                    onPaste={handlePaste}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-100 px-6 py-4 border-t border-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-black" />
                <span className="text-sm text-black font-medium">
                  Pro tip: You can paste data from Excel or Google Sheets
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Auto-save enabled</span>
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddForm;
