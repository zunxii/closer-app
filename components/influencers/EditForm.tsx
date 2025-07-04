"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Creator } from "@/types/index";
import CreatorRow from "./CreatorRow"; // reusable row component
import debounce from "lodash.debounce";

const EditForm = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  // Fetch creators from Supabase based on search query
  const fetchMatchingData = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setData([]);
        return;
      }

      setLoading(true);

      let orQuery = [
        `creator_name.ilike.%${query}%`,
        `instagram_link.ilike.%${query}%`,
        `mail_id.ilike.%${query}%`,
        `contact_no.ilike.%${query}%`,
      ].join(",");

      const { data: results, error } = await supabase
        .from("creators")
        .select("*")
        .or(orQuery)
        .limit(5000); // up to 5000 rows

      if (error) {
        console.error("Fetch error:", error.message);
        setData([]);
      } else {
        setData(results || []);
      }

      setLoading(false);
    }, 400),
    []
  );

  useEffect(() => {
    fetchMatchingData(searchQuery);
  }, [searchQuery, fetchMatchingData]);

  // Update logic
  const handleChange = (index: number, key: keyof Creator, value: string) => {
    const updated = [...data];
    updated[index][key] = value;
    setData(updated);
  };

  const handleUpdate = async (index: number) => {
    const row = data[index];
    const { id, ...fieldsToUpdate } = row;

    const { error } = await supabase
      .from("creators")
      .update(fieldsToUpdate)
      .eq("id", id);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      alert("Updated successfully!");
    }
  };

  // Calculate optimal column widths based on content
  const calculateColumnWidths = useCallback(() => {
    if (data.length === 0) {
      setColumnWidths({});
      return;
    }

    // Create a temporary canvas to measure text width
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set font to match the input field font
    context.font = "14px system-ui, -apple-system, sans-serif";

    const padding = 48; // 24px padding on each side (px-6 = 24px)
    const minWidth = 120; // minimum column width
    const maxWidth = 1000; // maximum column width to prevent overly wide columns

    // Calculate width for each column
    const widths: Record<string, number> = {};

    // Header widths
    const headerWidths = {
      creator_name: context.measureText("Name").width,
      instagram_link: context.measureText("Instagram").width,
      mail_id: context.measureText("Email").width,
      contact_no: context.measureText("Contact").width,
    };

    // Calculate content widths for each column
    const columns = [
      "creator_name",
      "instagram_link",
      "mail_id",
      "contact_no",
    ] as const;

    columns.forEach((column) => {
      let maxContentWidth = headerWidths[column];

      data.forEach((row) => {
        const value = row[column] || "";
        const textWidth = context.measureText(value.toString()).width;
        maxContentWidth = Math.max(maxContentWidth, textWidth);
      });

      // Add padding and constrain to min/max width
      const totalWidth = Math.min(
        maxWidth,
        Math.max(minWidth, maxContentWidth + padding)
      );
      widths[column] = totalWidth;
    });

    // Fixed widths for index and action columns
    widths.index = 80;
    widths.action = 120;

    setColumnWidths(widths);
  }, [data]);

  // Recalculate column widths when data changes
  useEffect(() => {
    if (data.length > 0) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        calculateColumnWidths();
      }, 0);
    }
  }, [data, calculateColumnWidths]);

  // Also recalculate when any field changes (for real-time adjustment)
  useEffect(() => {
    if (data.length > 0) {
      const timeoutId = setTimeout(() => {
        calculateColumnWidths();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [data, calculateColumnWidths]);

  return (
    <div className="bg-gray-50 min-h-auto p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-gray-900 text-2xl font-medium mb-8">
          Search & Update Creators
        </h1>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, email, contact, or Instagram..."
            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Searching...</div>
          </div>
        )}

        {!loading && data.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500">No matching records found.</p>
          </div>
        )}

        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-auto max-h-[70vh]">
              <table
                ref={tableRef}
                className="table-fixed w-full"
                style={{
                  minWidth:
                    Object.values(columnWidths).reduce(
                      (sum, width) => sum + width,
                      0
                    ) || "auto",
                }}
              >
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidths.index || 80 }}
                    >
                      #
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidths.creator_name || "auto" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidths.instagram_link || "auto" }}
                    >
                      Instagram
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidths.mail_id || "auto" }}
                    >
                      Email
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidths.contact_no || "auto" }}
                    >
                      Contact
                    </th>
                    <th
                      className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidths.action || 120 }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ width: columnWidths.index || 80 }}
                      >
                        <span className="text-sm font-medium text-gray-400">
                          {index + 1}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ width: columnWidths.creator_name || "auto" }}
                      >
                        <input
                          type="text"
                          value={row.creator_name || ""}
                          onChange={(e) =>
                            handleChange(index, "creator_name", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ width: columnWidths.instagram_link || "auto" }}
                      >
                        <input
                          type="text"
                          value={row.instagram_link || ""}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "instagram_link",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ width: columnWidths.mail_id || "auto" }}
                      >
                        <input
                          type="text"
                          value={row.mail_id || ""}
                          onChange={(e) =>
                            handleChange(index, "mail_id", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ width: columnWidths.contact_no || "auto" }}
                      >
                        <input
                          type="text"
                          value={row.contact_no || ""}
                          onChange={(e) =>
                            handleChange(index, "contact_no", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td
                        className="px-6 py-4 text-center"
                        style={{ width: columnWidths.action || 120 }}
                      >
                        <button
                          onClick={() => handleUpdate(index)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditForm;
