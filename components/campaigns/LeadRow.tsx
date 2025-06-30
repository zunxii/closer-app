import { Trash2 } from "lucide-react";
import EditableCell from "./EditableCell";

interface Props {
  row: any;
  index: number;
  keys: string[];
  selected: boolean;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onChange: (index: number, key: string, value: string) => void;
  onPaste: (e: React.ClipboardEvent, rowIndex: number, colKey: string) => void;
  hiddenColumns: Set<string>;
  colWidths: { [key: string]: number };
}

export default function LeadRow({
  row,
  index,
  keys,
  selected,
  onSelect,
  onRemove,
  onChange,
  onPaste,
  hiddenColumns,
  colWidths,
}: Props) {
  return (
    <tr
      className={`transition-colors ${
        selected ? "bg-indigo-50 border-indigo-200" : ""
      }`}
    >
      {/* Checkbox */}
      <td className="px-4 py-3 bg-white shadow rounded">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(index)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          aria-label={`Select row ${index + 1}`}
        />
      </td>

      {/* Index */}
      <td className="px-4 py-3 text-gray-500 text-center font-medium bg-white shadow rounded">
        {index + 1}
      </td>

      {/* Remove Button */}
      <td className="px-4 py-3 text-center bg-white shadow rounded">
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>

      {/* Editable Cells */}
      {keys
        .filter((key) => !hiddenColumns.has(key))
        .map((key) => (
          <td
            key={key}
            style={{ width: colWidths[key] || "auto" }}
            className="px-4 py-3 relative group bg-white shadow rounded"
          >
            <EditableCell
              value={row[key]}
              onChange={(val) => onChange(index, key, val)}
              onPaste={(e) => onPaste(e, index, key)}
            />
          </td>
        ))}
    </tr>
  );
}
