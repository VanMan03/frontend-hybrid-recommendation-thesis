import { useState } from "react";
import { Search, Plus, Edit, Power, Eye, Tag, FolderTree } from "lucide-react";
import { AddDestinationModal } from "@/app/components/AddDestinationModal";
import { EditCategoryModal } from "@/app/components/EditCategoryModal";
import { EditDestinationModal } from "@/app/components/EditDestinationModal";
import { ManageDestinationTaxonomyModal } from "@/app/components/ManageDestinationTaxonomyModal";
import { ViewDestinationModal } from "@/app/components/ViewDestinationModal";
import { useAdminData, type Destination } from "@/app/context/AdminDataContext";
import { tourismCategories } from "@/app/data/tourismCategories";

export function Destinations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [editingCategoryDestination, setEditingCategoryDestination] =
    useState<Destination | null>(null);
  const [viewingDestination, setViewingDestination] =
    useState<Destination | null>(null);

  const { destinations, loading, error, updateDestination } = useAdminData();

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCategorySave = async (
    destinationId: string,
    updates: {
      category: string[];
      categories: string[];
      features: string[] | Record<string, string[]>;
      mainInterests?: string[];
      subInterests?: string[];
    }
  ) => {
    await updateDestination(destinationId, updates);
    setEditingCategoryDestination(null);
  };

  const handleEditDestinationSave = async (
    destinationId: string,
    updates: {
      name: string;
      description: string;
      estimatedCost: number;
      durationHours: number;
      locationScope: Destination["locationScope"];
      location: {
        lat: number;
        lng: number;
        latitude?: number;
        longitude?: number;
        resolvedAddress?: string;
      };
      address?: {
        purok?: string;
        barangay?: string;
        municipality?: string;
        province?: string;
        fullAddress?: string;
      };
      images: {
        url: string;
        publicId: string;
      }[];
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

  const toFeatureKey = (value: string) =>
    value
      .replace(/&/g, "")
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .toLowerCase();

  const featureLabelMap = new Map<string, string>(
    Object.values(tourismCategories)
      .flat()
      .map((label) => [toFeatureKey(label), label])
  );

  const formatFeatures = (features: Destination["features"]) => {
    const toLabel = (feature: string) => featureLabelMap.get(feature) ?? feature;

    if (Array.isArray(features)) {
      return Array.from(new Set(features.map(toLabel))).join(", ");
    }

    const normalizedFeatures = Object.entries(features ?? {})
      .flatMap(([category, value]) => {
        if (Array.isArray(value)) {
          return value.map((feature) => toLabel(feature));
        }

        if (typeof value === "number") {
          return value > 0 ? [toLabel(category)] : [];
        }

        if (!value || typeof value !== "object") {
          return [];
        }

        return Object.entries(value)
          .filter(([, score]) => typeof score === "number" && score > 0)
          .map(([feature]) => toLabel(feature));
      });

    return Array.from(new Set(normalizedFeatures)).join(", ");
  };

  const formatCategory = (destination: Destination) => {
    const categories = destination.categories ?? destination.category;
    if (Array.isArray(categories)) {
      return categories.join(", ");
    }
    return categories;
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTaxonomyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50"
          >
            <FolderTree className="size-5" />
            Manage Categories
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus className="size-5" />
            Add Destination
          </button>
        </div>
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
                  Estimated Fee
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
                    <td className="px-6 py-4">{formatCategory(dest)}</td>
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
                          title="Edit destination details"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategoryDestination(dest)}
                          className="p-2 hover:bg-teal-50 rounded"
                          title="Edit category and features"
                        >
                          <Tag className="size-4" />
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
      <ManageDestinationTaxonomyModal
        isOpen={isTaxonomyModalOpen}
        onClose={() => setIsTaxonomyModalOpen(false)}
      />

      {editingCategoryDestination && (
        <EditCategoryModal
          isOpen={!!editingCategoryDestination}
          onClose={() => setEditingCategoryDestination(null)}
          onSave={handleEditCategorySave}
          destination={editingCategoryDestination}
        />
      )}

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
