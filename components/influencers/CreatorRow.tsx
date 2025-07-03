import { Trash2 } from "lucide-react";
import { Creator } from "./types";

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
    <tr className="border-t">
      <td className="px-4 py-2 text-black">{index + 1}</td>

      {/* Name */}
      <td className="px-2 py-1">
        <input
          type="text"
          className="border w-full rounded px-2 py-1 text-black"
          value={row.creator_name}
          onChange={(e) => onChange(index, "creator_name", e.target.value)}
          onPaste={(e) => onPaste(e, index, "creator_name")}
        />
      </td>

      {/* Instagram Link */}
      <td className="px-2 py-1">
        <input
          type="text"
          className="border w-full rounded px-2 py-1 text-black"
          value={row.instagram_link}
          onChange={(e) => onChange(index, "instagram_link", e.target.value)}
          onPaste={(e) => onPaste(e, index, "instagram_link")}
        />
      </td>

      {/* Email */}
      <td className="px-2 py-1">
        <input
          type="email"
          className="border w-full rounded px-2 py-1 text-black"
          value={row.mail_id}
          onChange={(e) => onChange(index, "mail_id", e.target.value)}
          onPaste={(e) => onPaste(e, index, "mail_id")}
        />
      </td>

      {/* Contact No */}
      <td className="px-2 py-1">
        <input
          type="text"
          className="border w-full rounded px-2 py-1 text-black"
          value={row.contact_no}
          onChange={(e) => onChange(index, "contact_no", e.target.value)}
          onPaste={(e) => onPaste(e, index, "contact_no")}
        />
      </td>

      {/* Delete Row */}
      <td className="px-4 py-2 text-center">
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default CreatorRow;
