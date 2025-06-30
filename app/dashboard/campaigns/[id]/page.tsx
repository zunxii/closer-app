"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import CampaignHeader from "@/components/campaigns/CampaignHeader";
import CampaignActions from "@/components/campaigns/CampaignActions";
import FiltersPanel from "@/components/campaigns/FiltersPanel";
import SuccessToast from "@/components/campaigns/SuccessToast";
import LeadRow from "@/components/campaigns/LeadRow";

export default function CampaignDetail() {
  const params = useParams();
  const id = params?.id as string;

  type RowType = {
    first_name: string;
    email: string;
    instagram: string;
    product: string;
    brand: string;
    deliverables: string;
    cost: string;
    website: string;
    personalization: string;
    [key: string]: string;
  };

  const defaultRow: RowType = {
    first_name: "",
    email: "",
    instagram: "",
    product: "",
    brand: "",
    deliverables: "",
    cost: "",
    website: "",
    personalization: "",
  };

  const keys = Object.keys(defaultRow);

  const [campaign, setCampaign] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    brand: "",
    product: "",
    cost: { min: "", max: "" },
    hasEmail: null as boolean | null,
    hasInstagram: null as boolean | null,
  });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [rows, setRows] = useState([{ ...defaultRow }]);
  const [colWidths, setColWidths] = useState<{ [key: string]: number }>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/campaigns");
        const data = await res.json();
        const found = data.items?.find((c: any) => c.id === id);
        setCampaign(found);
      } catch (err) {
        console.error("Failed to load campaign", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      if (
        searchTerm &&
        !Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(searchLower)
        )
      )
        return false;
      if (
        filters.brand &&
        !row.brand.toLowerCase().includes(filters.brand.toLowerCase())
      )
        return false;
      if (
        filters.product &&
        !row.product.toLowerCase().includes(filters.product.toLowerCase())
      )
        return false;
      const cost = parseFloat(row.cost.replace(/[^0-9.-]+/g, "")) || 0;
      if (filters.cost.min && cost < parseFloat(filters.cost.min)) return false;
      if (filters.cost.max && cost > parseFloat(filters.cost.max)) return false;
      if (filters.hasEmail !== null) {
        const hasEmail = row.email.trim().length > 0;
        if (filters.hasEmail !== hasEmail) return false;
      }
      if (filters.hasInstagram !== null) {
        const hasInstagram = row.instagram.trim().length > 0;
        if (filters.hasInstagram !== hasInstagram) return false;
      }
      return true;
    });
  }, [rows, searchTerm, filters]);

  const handlePaste = (
    e: React.ClipboardEvent,
    rowIndex: number,
    colKey: string
  ) => {
    const clipboardData = e.clipboardData.getData("text");
    const lines = clipboardData.trim().split("\n");
    if (lines.length === 0) return;

    // Intelligent header mapping
    const headerMap: { [key: string]: string[] } = {
      first_name: ["first name", "name", "first", "full name"],
      email: ["email", "email address", "mail"],
      instagram: ["instagram", "insta", "ig"],
      product: ["product", "item"],
      brand: ["brand", "company", "business"],
      deliverables: ["deliverables", "tasks", "offers"],
      cost: ["cost", "price", "budget", "amount"],
      website: ["website", "site", "url", "link"],
      personalization: ["personalization", "message", "note"],
    };

    // Build alias → key mapping
    const aliasToKey: { [alias: string]: string } = {};
    for (const key in headerMap) {
      headerMap[key].forEach((alias) => {
        aliasToKey[alias.toLowerCase()] = key;
      });
    }

    // Split first row to detect headers
    const firstRow = lines[0].split("\t").map((h) => h.toLowerCase().trim());
    const matchedKeys = firstRow.map((header) => aliasToKey[header] || null);

    // Determine if first line is a header
    const matchedCount = matchedKeys.filter((k) => k !== null).length;
    const isHeaderRow =
      matchedCount >= Math.floor(Object.keys(headerMap).length / 2);

    const dataLines = isHeaderRow ? lines.slice(1) : lines;

    setRows((prevRows) => {
      const updated = [...prevRows];
      let currentRow = rowIndex;

      dataLines.forEach((line) => {
        const cells = line.split("\t");

        if (currentRow >= updated.length) {
          updated.push({ ...defaultRow });
        }

        cells.forEach((cell, i) => {
          let key: string | null = null;

          if (isHeaderRow) {
            key = matchedKeys[i]; // Map using header alias
          } else {
            const startIndex = keys.indexOf(colKey);
            key = keys[startIndex + i]; // Linear paste mode
          }

          if (key && key in defaultRow) {
            updated[currentRow][key] = cell.trim();
          }
        });

        currentRow++;
      });

      return updated;
    });

    e.preventDefault();
  };

  const handleInputChange = (index: number, key: string, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      if (key in updated[index]) {
        updated[index][key as keyof typeof defaultRow] = value;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSuccess(false);
    const res = await fetch("/api/add-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: id, leads: rows }),
    });
    const result = await res.json();
    if (res.ok) {
      setSuccess(true);
      setRows([{ ...defaultRow }]);
      setSelectedRows(new Set());
    } else {
      alert(`❌ Failed: ${result?.message || "Unknown error"}`);
    }
    setIsSubmitting(false);
  };

  const handleAddRow = () => setRows((prev) => [...prev, { ...defaultRow }]);
  const handleResetRows = () => {
    setRows([{ ...defaultRow }]);
    setSelectedRows(new Set());
  };
  const handleRemoveRow = (index: number) => {
    setRows((prev) => {
      if (prev.length === 1) return [{ ...defaultRow }];
      return prev.filter((_, i) => i !== index);
    });
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };
  const handleRemoveSelected = () => {
    setRows((prev) => prev.filter((_, index) => !selectedRows.has(index)));
    setSelectedRows(new Set());
  };
  const handleSelectRow = (index: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };
  const handleSelectAll = () => {
    if (selectedRows.size === filteredRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRows.map((_, index) => index)));
    }
  };
  const clearFilters = () => {
    setFilters({
      brand: "",
      product: "",
      cost: { min: "", max: "" },
      hasEmail: null,
      hasInstagram: null,
    });
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <CampaignHeader
          campaignName={campaign?.name || "Untitled Campaign"}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          toggleFilters={() => setShowFilters((prev) => !prev)}
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-6">
          <CampaignActions
            onAddRow={handleAddRow}
            onRemoveSelected={handleRemoveSelected}
            onReset={handleResetRows}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            selectedCount={selectedRows.size}
            hasRows={rows.length > 0}
          />
          {showFilters && (
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
            />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === filteredRows.length &&
                        filteredRows.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    #
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                  {keys
                    .filter((key) => !hiddenColumns.has(key))
                    .map((key) => (
                      <th
                        key={key}
                        className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((row, index) => (
                  <LeadRow
                    key={index}
                    row={row}
                    index={index}
                    keys={keys}
                    selected={selectedRows.has(index)}
                    onSelect={handleSelectRow}
                    onRemove={handleRemoveRow}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    hiddenColumns={hiddenColumns}
                    colWidths={colWidths}
                  />
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={keys.length + 3}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <Users className="w-12 h-12 text-gray-300" />
                        <div>
                          <p className="font-medium">No leads found</p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {success && <SuccessToast />}
      </div>
    </div>
  );
}
