interface Props {
  value: string;
  onChange: (value: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
}

export default function EditableCell({ value, onChange, onPaste }: Props) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerText)}
      onPaste={onPaste}
      className="w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white p-2 rounded border border-transparent hover:border-gray-200 transition-all min-h-[36px] break-words shadow"
      style={{ minWidth: 60 }}
    >
      {value}
    </div>
  );
}
