import { useCallback, useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { type Destination } from "@/app/context/AdminDataContext";
import { LocationMap } from "@/app/components/LocationMap";

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
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
  ) => Promise<void>;
  destination: Destination;
}

export function EditDestinationModal({
  isOpen,
  onClose,
  onSave,
  destination,
}: EditDestinationModalProps) {
  const [name, setName] = useState(destination.name);
  const [description, setDescription] = useState(destination.description);
  const [estimatedCost, setEstimatedCost] = useState(
    destination.estimatedCost.toString()
  );
  const [location, setLocation] = useState({
    latitude: destination.location?.latitude ?? null,
    longitude: destination.location?.longitude ?? null,
    resolvedAddress: destination.location?.resolvedAddress ?? "",
  });
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(destination.name);
    setDescription(destination.description);
    setEstimatedCost(destination.estimatedCost.toString());
    setLocation({
      latitude: destination.location?.latitude ?? null,
      longitude: destination.location?.longitude ?? null,
      resolvedAddress: destination.location?.resolvedAddress ?? "",
    });
  }, [destination, isOpen]);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setIsResolvingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        return "";
      }

      const data = (await response.json()) as { display_name?: string };
      return data.display_name ?? "";
    } catch (error) {
      console.error("Failed to reverse geocode location:", error);
      return "";
    } finally {
      setIsResolvingAddress(false);
    }
  }, []);

  const handleMapLocationSelect = useCallback(async (next: {
    latitude: number;
    longitude: number;
  }) => {
    setLocation((prev) => ({
      ...prev,
      latitude: next.latitude,
      longitude: next.longitude,
    }));

    const resolvedAddress = await reverseGeocode(next.latitude, next.longitude);

    setLocation({
      latitude: next.latitude,
      longitude: next.longitude,
      resolvedAddress,
    });
  }, [reverseGeocode]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      alert("Please enter a destination name and description");
      return;
    }
    if (location.latitude === null || location.longitude === null) {
      alert("Please select a destination location on the map");
      return;
    }

    setLoading(true);

    try {
      await onSave(destination._id, {
        name: name.trim(),
        description: description.trim(),
        estimatedCost: Number(estimatedCost),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          resolvedAddress: location.resolvedAddress || undefined,
        },
      });
      onClose();
    } catch {
      alert("Failed to update destination");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Destination</h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entry Fee (PHP)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Click on the map to update the destination location.
            </p>
            <LocationMap
              interactive
              value={
                location.latitude !== null && location.longitude !== null
                  ? { latitude: location.latitude, longitude: location.longitude }
                  : null
              }
              onSelect={handleMapLocationSelect}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Latitude
                </p>
                <p className="text-sm text-gray-900">
                  {location.latitude !== null
                    ? location.latitude.toFixed(6)
                    : "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Longitude
                </p>
                <p className="text-sm text-gray-900">
                  {location.longitude !== null
                    ? location.longitude.toFixed(6)
                    : "Not selected"}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs font-semibold uppercase text-gray-600">
                Resolved Address
              </p>
              <p className="text-sm text-gray-700">
                {isResolvingAddress
                  ? "Resolving address..."
                  : location.resolvedAddress || "No address resolved"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Save className="size-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
