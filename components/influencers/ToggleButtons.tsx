import { Search, UserPlus, Edit2 } from "lucide-react";

const ToggleButtons = ({
  formToggle,
  setFormToggle,
}: {
  formToggle: "match" | "add" | "edit";
  setFormToggle: (v: "match" | "add" | "edit") => void;
}) => (
  <div className="flex justify-center mb-8">
    <div className="inline-flex bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
      <button
        onClick={() => setFormToggle("match")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          formToggle === "match"
            ? "bg-black text-white shadow-sm"
            : "text-gray-700 hover:text-black hover:bg-gray-100"
        }`}
      >
        <Search className="w-4 h-4" /> Match Creators
      </button>
      <button
        onClick={() => setFormToggle("add")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          formToggle === "add"
            ? "bg-black text-white shadow-sm"
            : "text-gray-700 hover:text-black hover:bg-gray-100"
        }`}
      >
        <UserPlus className="w-4 h-4" /> Add Creators
      </button>
      <button
        onClick={() => setFormToggle("edit")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          formToggle === "edit"
            ? "bg-black text-white shadow-sm"
            : "text-gray-700 hover:text-black hover:bg-gray-100"
        }`}
      >
        <Edit2 className="w-4 h-4" /> Edit Creators
      </button>
    </div>
  </div>
);

export default ToggleButtons;
