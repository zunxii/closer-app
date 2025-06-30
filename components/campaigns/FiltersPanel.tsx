import { X } from "lucide-react";

interface Props {
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

export default function FiltersPanel({
  filters,
  setFilters,
  clearFilters,
}: Props) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <input
            type="text"
            value={filters.brand}
            onChange={(e) =>
              setFilters((prev: any) => ({ ...prev, brand: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            placeholder="Filter by brand..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <input
            type="text"
            value={filters.product}
            onChange={(e) =>
              setFilters((prev: any) => ({ ...prev, product: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            placeholder="Filter by product..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.cost.min}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  cost: { ...prev.cost, min: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.cost.max}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  cost: { ...prev.cost, max: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              placeholder="Max"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Info
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={filters.hasEmail === true}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    hasEmail: e.target.checked ? true : null,
                  }))
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Has Email
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={filters.hasInstagram === true}
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    hasInstagram: e.target.checked ? true : null,
                  }))
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Has Instagram
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}
