import { PlusCircle, RotateCcw, Trash2, Loader2 } from "lucide-react";

interface Props {
  onAddRow: () => void;
  onRemoveSelected: () => void;
  onReset: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedCount: number;
  hasRows: boolean;
}

export default function CampaignActions({
  onAddRow,
  onRemoveSelected,
  onReset,
  onSubmit,
  isSubmitting,
  selectedCount,
  hasRows,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onAddRow}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Row
        </button>

        {selectedCount > 0 && (
          <button
            onClick={onRemoveSelected}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-md text-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Remove Selected ({selectedCount})
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting || !hasRows}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
        {isSubmitting ? "Submitting..." : "Submit All Leads"}
      </button>
    </div>
  );
}
