import Link from "next/link";
import { ArrowLeft, ChevronDown, Filter, Search } from "lucide-react";

interface Props {
  campaignName: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
}

export default function CampaignHeader({
  campaignName,
  searchTerm,
  onSearchChange,
  showFilters,
  toggleFilters,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/campaigns"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors group flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          Campaign: <span className="text-indigo-600">{campaignName}</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-800 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
          />
        </div>
        <button
          onClick={toggleFilters}
          className={`text-sm px-3 py-1.5 rounded-md transition-all border font-medium flex items-center gap-1.5 ${
            showFilters
              ? "bg-indigo-100 text-indigo-700 border-indigo-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
