import { Trash2 } from "lucide-react";
import { Creator } from "@/types/index";

interface Props {
  row: Creator;
  index: number;
  onChange: (index: number, key: keyof Creator, value: string) => void;
  onRemove: (index: number) => void;
  onPaste: (
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    colKey: keyof Creator
  ) => void;
}

const CreatorRow = ({ row, index, onChange, onRemove, onPaste }: Props) => {
  return (
    <tr className="border-t border-gray-300 text-black hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 text-black font-medium">{index + 1}</td>

      {/* Creator Name */}
      <td className="px-2 py-3">
        <input
          type="text"
          className="border-2 border-gray-300 w-full rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
          value={row.creator_name || ""}
          onChange={(e) => onChange(index, "creator_name", e.target.value)}
          onPaste={(e) => onPaste(e, index, "creator_name")}
          placeholder="Name"
        />
      </td>

      {/* Instagram Link */}
      <td className="px-2 py-3">
        <input
          type="text"
          className="border-2 border-gray-300 w-full rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
          value={row.instagram_link || ""}
          onChange={(e) => onChange(index, "instagram_link", e.target.value)}
          onPaste={(e) => onPaste(e, index, "instagram_link")}
          placeholder="https://instagram.com/..."
        />
      </td>

      {/* Email */}
      <td className="px-2 py-3">
        <input
          type="email"
          className="border-2 border-gray-300 w-full rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
          value={row.mail_id || ""}
          onChange={(e) => onChange(index, "mail_id", e.target.value)}
          onPaste={(e) => onPaste(e, index, "mail_id")}
          placeholder="email@example.com"
        />
      </td>

      {/* Contact Number */}
      <td className="px-2 py-3">
        <input
          type="text"
          className="border-2 border-gray-300 w-full rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
          value={row.contact_no || ""}
          onChange={(e) => onChange(index, "contact_no", e.target.value)}
          onPaste={(e) => onPaste(e, index, "contact_no")}
          placeholder="+91..."
        />
      </td>

      {/* Delete Row */}
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => onRemove(index)}
          className="text-black hover:text-white hover:bg-black p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
          aria-label={`Delete row ${index + 1}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default CreatorRow;
