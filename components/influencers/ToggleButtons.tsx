import { Search, UserPlus } from "lucide-react";

const ToggleButtons = ({
  formToggle,
  setFormToggle,
}: {
  formToggle: "match" | "add";
  setFormToggle: (v: "match" | "add") => void;
}) => (
  <div className="flex justify-center mb-8">
    <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-sm">
      <button
        onClick={() => setFormToggle("match")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          formToggle === "match"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        <Search className="w-4 h-4" />
        Match Creators
      </button>
      <button
        onClick={() => setFormToggle("add")}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          formToggle === "add"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        <UserPlus className="w-4 h-4" />
        Add Creators
      </button>
    </div>
  </div>
);

export default ToggleButtons;
