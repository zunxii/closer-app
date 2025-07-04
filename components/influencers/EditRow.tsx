import { Creator } from "@/types/index";

interface Props {
  row: Creator;
  index: number;
  onChange: (key: keyof Creator, value: string) => void;
  columnWidths?: Record<string, number>;
}

const EditRow = ({ row, index, onChange, columnWidths = {} }: Props) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td
      className="px-6 py-4 whitespace-nowrap"
      style={{ width: columnWidths.index || 80 }}
    >
      <span className="text-sm font-medium text-gray-400">{index + 1}</span>
    </td>
    <td
      className="px-6 py-4"
      style={{ width: columnWidths.creator_name || "auto" }}
    >
      <input
        type="text"
        value={row.creator_name || ""}
        onChange={(e) => onChange("creator_name", e.target.value)}
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
        onChange={(e) => onChange("instagram_link", e.target.value)}
        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </td>
    <td
      className="px-6 py-4"
      style={{ width: columnWidths.instagram_username || "auto" }}
    >
      <input
        type="text"
        value={row.instagram_username || ""}
        disabled
        className="w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
      />
    </td>
    <td className="px-6 py-4" style={{ width: columnWidths.mail_id || "auto" }}>
      <input
        type="text"
        value={row.mail_id || ""}
        onChange={(e) => onChange("mail_id", e.target.value)}
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
        onChange={(e) => onChange("contact_no", e.target.value)}
        className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </td>
  </tr>
);

export default EditRow;
