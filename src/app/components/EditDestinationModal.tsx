import { useState } from "react";
import { X, Save } from "lucide-react";
import { useAdminData } from "@/app/context/AdminDataContext";

type Destination = {
  _id: string;
  name: string;
  description: string;
  category: string;
  estimatedCost: number;
  isActive: boolean;
};

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination;
}

export function EditDestinationModal({
  isOpen,
  onClose,
  destination,
}: EditDestinationModalProps) {
  const { updateDestination } = useAdminData();

  const [name, setName] = useState(destination.name);
  const [estimatedCost, setEstimatedCost] = useState(
    destination.estimatedCost.toString()
  );
  const [isActive, setIsActive] = useState(destination.isActive);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a destination name");
      return;
    }

    setLoading(true);

    try {
      await updateDestination(destination._id, {
        name,
        estimatedCost: Number(estimatedCost),
        isActive,
      });

      onClose();
    } catch (err) {
      alert("Failed to update destination");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Destination
            </h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Destination Name */}
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

          {/* Entry Fee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entry Fee (₱)
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

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Status
            </label>
            <div className="space-y-2">
              {[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setIsActive(option.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left ${
                    isActive === option.value
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
