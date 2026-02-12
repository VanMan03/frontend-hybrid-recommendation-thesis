import { useState } from "react";
import { Search, Plus, Edit, Power, Eye } from "lucide-react";
import { AddDestinationModal } from "@/app/components/AddDestinationModal";
import { EditDestinationModal } from "@/app/components/EditDestinationModal";
import { ViewDestinationModal } from "@/app/components/ViewDestinationModal";
import { useAdminData, type Destination } from "@/app/context/AdminDataContext";

export function Destinations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [viewingDestination, setViewingDestination] =
    useState<Destination | null>(null);

  const { destinations, loading, error, updateDestination } = useAdminData();

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditDestinationSave = async (
    destinationId: string,
    updates: {
      name: string;
      description: string;
      estimatedCost: number;
      location: {
        latitude: number;
        longitude: number;
        resolvedAddress?: string;
      };
    }
  ) => {
    await updateDestination(destinationId, updates);
    setEditingDestination(null);
  };

  const handleToggleDestinationStatus = async (destination: Destination) => {
    await updateDestination(destination._id, {
      isActive: !destination.isActive,
    });
  };

  const formatFeatures = (features: Destination["features"]) => {
    if (Array.isArray(features)) {
      return features.join(", ");
    }

    return Object.entries(features ?? {})
      .filter(([, value]) => value > 0)
      .map(([feature]) => feature)
      .join(", ");
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-600">Loading destinations...</p>
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
                  Features
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No destinations found
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((dest) => (
                  <tr key={dest._id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{dest.name}</p>
                    </td>
                    <td className="px-6 py-4">{dest.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatFeatures(dest.features) || "No features"}
                    </td>
                    <td className="px-6 py-4">PHP {dest.estimatedCost}</td>
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
                          onClick={() => setViewingDestination(dest)}
                          className="p-2 hover:bg-blue-50 rounded"
                          title="View destination details"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => setEditingDestination(dest)}
                          className="p-2 hover:bg-amber-50 rounded"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleToggleDestinationStatus(dest)}
                          className={`p-2 rounded ${
                            dest.isActive ? "hover:bg-red-50" : "hover:bg-green-50"
                          }`}
                          title={dest.isActive ? "Set inactive" : "Set active"}
                        >
                          <Power className="size-4" />
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

      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingDestination && (
        <EditDestinationModal
          isOpen={!!editingDestination}
          onClose={() => setEditingDestination(null)}
          onSave={handleEditDestinationSave}
          destination={editingDestination}
        />
      )}

      <ViewDestinationModal
        isOpen={!!viewingDestination}
        onClose={() => setViewingDestination(null)}
        destination={viewingDestination}
      />
    </div>
  );
}
