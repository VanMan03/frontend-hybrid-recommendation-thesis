import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { type Destination } from "@/app/context/AdminDataContext";

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    destinationId: string,
    updates: {
      name: string;
      description: string;
      estimatedCost: number;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(destination.name);
    setDescription(destination.description);
    setEstimatedCost(destination.estimatedCost.toString());
  }, [destination, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      alert("Please enter a destination name and description");
      return;
    }

    setLoading(true);

    try {
      await onSave(destination._id, {
        name: name.trim(),
        description: description.trim(),
        estimatedCost: Number(estimatedCost),
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
