import { Creator } from "./types";
import CreatorRow from "./CreatorRow";

interface Props {
  rows: Creator[];
  onChange: (index: number, key: keyof Creator, value: string) => void;
  onRemove: (index: number) => void;
}

const AddCreatorsTable = ({ rows, onChange, onRemove }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Creator Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Instagram
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No creators added yet
                    </p>
                    <p className="text-xs text-gray-500">
                      Start by adding your first creator to the list
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <CreatorRow
                  key={index}
                  row={row}
                  index={index}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total creators: {rows.length}</span>
            <span className="text-xs">
              Scroll horizontally to view all columns
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCreatorsTable;
