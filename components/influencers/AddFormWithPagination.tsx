"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Creator } from "@/types/index";
import CreatorRow from "./CreatorRow"; // editable row component
import { Plus, RotateCcw, Save, CheckCircle } from "lucide-react";

const PAGE_SIZE = 100;

export default function AddFormWithPagination() {
  const [rows, setRows] = useState<Creator[]>([
    {
      creator_name: "",
      instagram_link: "",
      mail_id: "",
      contact_no: "",
      instagram_username: "",
    },
  ]);
  const [pageData, setPageData] = useState<Creator[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function fetchPage(nextPage: number) {
    setLoading(true);
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from("creators")
      .select("*", { count: "exact" })
      .range(from, to);
    setLoading(false);

    if (error) return alert(error.message);

    setPageData((prev) => [...prev, ...(data || [])]);
    setHasMore(to + 1 < (count || 0));
    setPage(nextPage);
  }

  useEffect(() => {
    fetchPage(0);
  }, []);

  const handleRowChange = (i: number, key: keyof Creator, val: string) => {
    setKeep((prev) => {
      const np = [...prev];
      np[i] = { ...np[i], [key]: val };
      return np;
    });
  };

  const handleRemove = (i: number) => {
    setPageData((prev) => prev.filter((_, idx) => idx !== i));
    supabase.from("creators").delete().eq("id", pageData[i].id);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* AddForm component would go here */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-black overflow-hidden mb-8">
          <div className="bg-black p-6">
            <h2 className="text-xl font-semibold text-white">
              Existing Creators
            </h2>
            <p className="text-gray-300 text-sm">
              Browse and edit your creator database
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
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
                {pageData.map((r, i) => (
                  <CreatorRow
                    key={r.id}
                    row={r}
                    index={i}
                    onChange={(idx, key, val) => handleRowChange(idx, key, val)}
                    onRemove={handleRemove}
                    onPaste={function (
                      e: React.ClipboardEvent<HTMLInputElement>,
                      rowIndex: number,
                      colKey: keyof Creator
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                ))}
              </tbody>
            </table>

            {loading ? (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-black font-medium">Loading...</span>
                </div>
              </div>
            ) : hasMore ? (
              <div className="p-6 text-center border-t border-gray-300">
                <button
                  onClick={() => fetchPage(page + 1)}
                  className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Load More
                </button>
              </div>
            ) : (
              <div className="p-6 text-center border-t border-gray-300">
                <div className="text-gray-600 font-medium">
                  ✓ All creators loaded
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
