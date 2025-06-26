"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const statusMap: Record<number | string, string> = {
    0: "Draft",
    1: "Active",
    2: "Paused",
    3: "Completed",
    4: "Running Subsequences",
    "-99": "Account Suspended",
    "-1": "Accounts Unhealthy",
    "-2": "Bounce Protect",
  };

  const statusColorMap: Record<string, string> = {
    Draft: "text-gray-600 border-gray-600",
    Active: "text-green-600 border-green-600",
    Paused: "text-yellow-600 border-yellow-600",
    Completed: "text-blue-600 border-blue-600",
    "Running Subsequences": "text-purple-600 border-purple-600",
    "Account Suspended": "text-red-600 border-red-600",
    "Accounts Unhealthy": "text-red-600 border-red-600",
    "Bounce Protect": "text-orange-600 border-orange-600",
  };

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        const items = data.items || [];
        setCampaigns(items);
        setFiltered(items);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const result = campaigns.filter((c) =>
      c.name.toLowerCase().includes(query)
    );
    setFiltered(result);
  }, [search, campaigns]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Campaigns</h1>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading campaigns...</span>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center text-red-600 mt-4">
          <AlertTriangle className="mr-2" />
          Error fetching campaigns
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-12">
          No campaigns found with “
          <span className="font-semibold">{search}</span>”
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => {
            const statusLabel = statusMap[c.status] || "Unknown";
            const badgeColor =
              statusColorMap[statusLabel] || "text-gray-600 border-gray-600";

            return (
              <Link
                key={c.id}
                href={`/dashboard/campaigns/${c.id}`}
                className="transition duration-200 transform hover:scale-[1.02]"
              >
                <div className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg p-5 h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                      {c.name}
                    </h2>
                    <Badge variant="outline" className={badgeColor}>
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
