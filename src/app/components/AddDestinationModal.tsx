import { useCallback, useState } from "react";
import { X, Save } from "lucide-react";
import {
  tourismCategories,
  getCategoryColor,
  type MainCategory,
  type SubCategory,
} from "@/app/data/tourismCategories";
import { useAdminData } from "@/app/context/AdminDataContext";
import { mapDestinationPayload } from "@/utils/mapDestinationPayload";
import { LocationMap } from "@/app/components/LocationMap";

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDestinationModal({
  isOpen,
  onClose,
}: AddDestinationModalProps) {
  const { createDestination, uploadImages } = useAdminData();

  const [image, setImages] = useState<File[]>([]);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mainCategory: "Nature Tourism" as MainCategory,
    subCategory: tourismCategories["Nature Tourism"][0] as SubCategory,
    entryFeeValue: null as number | null,
    accessibility: "Moderate",
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
      resolvedAddress: "",
    },
  });

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (image.length + files.length > 4) {
      alert("Maximum 4 images only");
      return;
    }

    setImages([...image, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(image.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      mainCategory: "Nature Tourism" as MainCategory,
      subCategory: tourismCategories["Nature Tourism"][0] as SubCategory,
      entryFeeValue: null,
      accessibility: "Moderate",
      location: {
        latitude: null,
        longitude: null,
        resolvedAddress: "",
      },
    });
    setImages([]);
    setIsResolvingAddress(false);
  };

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
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: next.latitude,
        longitude: next.longitude,
      },
    }));

    const resolvedAddress = await reverseGeocode(next.latitude, next.longitude);

    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: next.latitude,
        longitude: next.longitude,
        resolvedAddress,
      },
    }));
  }, [reverseGeocode]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    if (formData.entryFeeValue === null || Number.isNaN(formData.entryFeeValue)) {
      alert("Please enter an entry fee");
      return;
    }
    if (formData.entryFeeValue < 0) {
      alert("Entry fee cannot be negative");
      return;
    }
    if (
      formData.location.latitude === null ||
      formData.location.longitude === null
    ) {
      alert("Please select a destination location on the map");
      return;
    }

    try {
      const payload = mapDestinationPayload({
        name: formData.name,
        description: formData.description,
        entryFee: formData.entryFeeValue,
        mainCategory: formData.mainCategory,
        subCategory: formData.subCategory,
        location: {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          resolvedAddress: formData.location.resolvedAddress || undefined,
        },
      });

      console.log("Creating destination:", payload);

      const created = await createDestination(payload);

      if (image.length > 0 && created?._id) {
        await uploadImages(created._id, image);
      }

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

  if (!isOpen) return null;

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
              Entry Fee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.entryFeeValue ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  entryFeeValue:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Click on the map to pin the destination location.
            </p>
            <LocationMap
              interactive
              value={
                formData.location.latitude !== null &&
                formData.location.longitude !== null
                  ? {
                      latitude: formData.location.latitude,
                      longitude: formData.location.longitude,
                    }
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
                  {formData.location.latitude !== null
                    ? formData.location.latitude.toFixed(6)
                    : "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Longitude
                </p>
                <p className="text-sm text-gray-900">
                  {formData.location.longitude !== null
                    ? formData.location.longitude.toFixed(6)
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
                  : formData.location.resolvedAddress || "No address resolved"}
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Destination Images (max 4)
            </label>

            <input type="file" accept="image/*" multiple onChange={handleImageChange} />

            <div className="grid grid-cols-4 gap-2 mt-3">
              {image.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-6">
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
