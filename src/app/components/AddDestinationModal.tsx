import { useState } from "react";
import { X, Save } from "lucide-react";
import {
  tourismCategories,
  getCategoryColor,
  type MainCategory,
  type SubCategory,
} from "@/app/data/tourismCategories";
import { useAdminData } from "@/app/context/AdminDataContext";
import { mapDestinationPayload } from "@/utils/mapDestinationPayload";

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDestinationModal({
  isOpen,
  onClose,
}: AddDestinationModalProps) {
  const { createDestination } = useAdminData();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mainCategory: "Nature Tourism" as MainCategory,
    subCategory: tourismCategories["Nature Tourism"][0] as SubCategory,
    entryFeeValue: null as number | null,
    accessibility: "Moderate", // UI-only, not sent to backend
  });

  if (!isOpen) return null;

  const handleMainCategoryChange = (category: MainCategory) => {
    setFormData({
      ...formData,
      mainCategory: category,
      subCategory: tourismCategories[category][0] as SubCategory,
    });
  };

  const handleSubCategoryChange = (subCategory: SubCategory) => {
    setFormData({
      ...formData,
      subCategory,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      mainCategory: "Nature Tourism" as MainCategory,
      subCategory: tourismCategories["Nature Tourism"][0] as SubCategory,
      entryFeeValue: null,
      accessibility: "Moderate",
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = mapDestinationPayload({
        name: formData.name,
        description: formData.description,
        entryFee: formData.entryFeeValue ?? 0,
        mainCategory: formData.mainCategory,
        subCategory: formData.subCategory,
      });

      console.log("Creating destination:", payload);

      await createDestination(payload);

      resetForm();
      onClose();
    } catch (error) {
      console.error("Create destination failed:", error);
      alert("Failed to create destination");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add New Destination
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new tourism destination
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Entry Fee */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Entry Fee (₱)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.entryFeeValue ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  entryFeeValue:
                    e.target.value === ""
                      ? null
                      : parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-6">
            {/* Main */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Main Category
              </label>
              <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {Object.keys(tourismCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      handleMainCategoryChange(category as MainCategory)
                    }
                    className={`w-full p-2.5 rounded-lg border-2 text-left ${
                      formData.mainCategory === category
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Sub Category
              </label>
              <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {tourismCategories[formData.mainCategory].map((sub) => (
                  <button
                    key={sub}
                    onClick={() =>
                      handleSubCategoryChange(sub as SubCategory)
                    }
                    className={`w-full p-2.5 rounded-lg border-2 text-left ${
                      formData.subCategory === sub
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-teal-50 border rounded-lg p-4">
            <p className="text-xs font-semibold uppercase mb-2">
              Selected Category
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                formData.mainCategory
              )}`}
            >
              {formData.mainCategory}
            </span>
            <p className="text-sm mt-1">→ {formData.subCategory}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Save className="size-4" />
            Create Destination
          </button>
        </div>
      </div>
    </div>
  );
}
