import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { AddDestinationModal } from "@/app/components/AddDestinationModal";
import { EditDestinationModal } from "@/app/components/EditDestinationModal";
import { useAdminData } from "@/app/context/AdminDataContext";

type Destination = {
  _id: string;
  name: string;
  description: string;
  category: string;
  estimatedCost: number;
  features: Record<string, number>;
  isActive: boolean;
};

export function Destinations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);

  const {
    destinations,
    loading,
    error,
    deleteDestination,
  } = useAdminData();

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Destination Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage destinations stored in the system
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="size-5" />
          Add Destination
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by destination name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-600">Loading destinations…</p>
        ) : error ? (
          <p className="p-6 text-red-600">{error}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Destination
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Entry Fee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDestinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No destinations found
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((dest) => (
                  <tr key={dest._id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{dest.name}</p>
                      <p className="text-xs text-gray-500">
                        {dest.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">{dest.category}</td>
                    <td className="px-6 py-4">
                      ₱{dest.estimatedCost}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dest.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {dest.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingDestination(dest)}
                          className="p-2 hover:bg-amber-50 rounded"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => deleteDestination(dest._id)}
                          className="p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

{/* Add Modal */}
<AddDestinationModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
/>



      {/* Edit Modal */}
      {editingDestination && (
        <EditDestinationModal
          isOpen={!!editingDestination}
          onClose={() => setEditingDestination(null)}
          destination={editingDestination}
        />
      )}
    </div>
  );
}
