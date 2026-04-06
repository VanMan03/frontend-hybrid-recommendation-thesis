import { useEffect, useMemo, useState } from "react";
import { X, Save } from "lucide-react";
import { type Destination } from "@/app/context/AdminDataContext";
import { getCategoryColor, tourismCategories } from "@/app/data/tourismCategories";
import { useDestinationTaxonomy } from "@/app/hooks/useDestinationTaxonomy";

type EditCategoryUpdates = {
  category: string[];
  categories: string[];
  features: string[] | Record<string, string[]>;
};

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination;
  onSave: (destinationId: string, updates: EditCategoryUpdates) => Promise<void>;
}

const normalizeFeatureMap = (
  destination: Destination,
  taxonomy: Record<string, string[]>
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  const addFeature = (category: string, feature: string) => {
    const valid = taxonomy[category] ?? [];
    if (!valid.includes(feature)) {
      return;
    }
    const existing = result[category] ?? [];
    if (!existing.includes(feature)) {
      result[category] = [...existing, feature];
    }
  };

  if (Array.isArray(destination.features)) {
    destination.features.forEach((feature) => {
      Object.entries(taxonomy).forEach(([category, validFeatures]) => {
        if (validFeatures.includes(feature)) {
          addFeature(category, feature);
        }
      });
    });
    return result;
  }

  Object.entries(destination.features ?? {}).forEach(([category, value]) => {
    if (Array.isArray(value)) {
      value.forEach((feature) => addFeature(category, feature));
      return;
    }

    if (typeof value === "number") {
      if (value > 0) {
        addFeature(category, category);
      }
      return;
    }

    if (value && typeof value === "object") {
      Object.entries(value).forEach(([feature, score]) => {
        if (typeof score === "number" && score > 0) {
          addFeature(category, feature);
        }
      });
    }
  });

  return result;
};

export function EditCategoryModal({
  isOpen,
  onClose,
  destination,
  onSave,
}: EditCategoryModalProps) {
  const { taxonomy, categories, refetch } = useDestinationTaxonomy();
  const [activeCategory, setActiveCategory] = useState("Nature Tourism");
  const [selectedFeaturesByCategory, setSelectedFeaturesByCategory] = useState<
    Record<string, string[]>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [categoryValidationError, setCategoryValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void refetch();
  }, [isOpen, refetch]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstCategory = categories[0] ?? "Nature Tourism";
    const categorySource = destination.categories ?? destination.category;
    const initialCategory = Array.isArray(categorySource)
      ? categorySource[0]
      : categorySource;
    const nextActiveCategory = initialCategory && categories.includes(initialCategory)
      ? initialCategory
      : firstCategory;

    setActiveCategory(nextActiveCategory);
    setSelectedFeaturesByCategory(normalizeFeatureMap(destination, taxonomy));
    setCategoryValidationError(null);
  }, [categories, destination, isOpen, taxonomy]);

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    setActiveCategory((prev) => (categories.includes(prev) ? prev : categories[0]));
    setSelectedFeaturesByCategory((prev) =>
      Object.fromEntries(
        Object.entries(prev)
          .filter(([category]) => categories.includes(category))
          .map(([category, features]) => [
            category,
            features.filter((feature) => (taxonomy[category] ?? []).includes(feature)),
          ])
          .filter(([, features]) => features.length > 0)
      )
    );
  }, [categories, taxonomy]);

  const selectedCategories = useMemo(
    () =>
      Object.keys(selectedFeaturesByCategory).filter(
        (category) => (selectedFeaturesByCategory[category] ?? []).length > 0
      ),
    [selectedFeaturesByCategory]
  );

  if (!isOpen) return null;

  const handleSubCategoryChange = (subCategory: string) => {
    setCategoryValidationError(null);
    setSelectedFeaturesByCategory((prev) => {
      const current = prev[activeCategory] ?? [];
      const isSelected = current.includes(subCategory);
      const next = isSelected
        ? current.filter((item) => item !== subCategory)
        : [...current, subCategory];

      const updated = { ...prev };
      if (next.length === 0) {
        delete updated[activeCategory];
      } else {
        updated[activeCategory] = next;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    const normalizedSelections = Object.fromEntries(
      Object.entries(selectedFeaturesByCategory)
        .filter(([category]) => categories.includes(category))
        .map(([category, features]) => [
          category,
          Array.from(new Set(features)).filter((feature) =>
            (taxonomy[category] ?? []).includes(feature)
          ),
        ])
    );
    const categoriesMissingSubInterests = Object.entries(normalizedSelections)
      .filter(([, features]) => features.length === 0)
      .map(([category]) => category);

    if (categoriesMissingSubInterests.length > 0) {
      setCategoryValidationError(
        `Each selected category must include at least one sub-category: ${categoriesMissingSubInterests.join(
          ", "
        )}`
      );
      return;
    }

    const featuresByCategory = Object.fromEntries(
      Object.entries(normalizedSelections).filter(([, features]) => features.length > 0)
    );
    const nextCategories = Object.keys(featuresByCategory);

    if (nextCategories.length === 0) {
      setCategoryValidationError("Please select at least one sub-category before saving.");
      return;
    }
    setCategoryValidationError(null);

    const flattenedFeatures = Array.from(
      new Set(Object.values(featuresByCategory).flat())
    );

    setIsSaving(true);
    try {
      await onSave(destination._id, {
        category: nextCategories,
        categories: nextCategories,
        features: flattenedFeatures,
      });
      onClose();
    } catch {
      alert("Failed to update destination categories");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Destination Category
            </h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Main Category
              </label>
              <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left ${
                      activeCategory === category
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-xs text-gray-500">
                        {(selectedFeaturesByCategory[category] ?? []).length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Sub Category
              </label>
              <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {(taxonomy[activeCategory] ?? []).length === 0 ? (
                  <p className="text-sm text-red-700">
                    This category has no sub-categories yet. Add at least one in Taxonomy Manager.
                  </p>
                ) : (
                  (taxonomy[activeCategory] ?? []).map((subCategory) => (
                    <button
                      key={subCategory}
                      onClick={() => handleSubCategoryChange(subCategory)}
                      className={`w-full p-2.5 rounded-lg border-2 text-left ${
                        (selectedFeaturesByCategory[activeCategory] ?? []).includes(subCategory)
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200"
                      }`}
                    >
                      {subCategory}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          {categoryValidationError ? (
            <p className="text-sm text-red-700">{categoryValidationError}</p>
          ) : null}

          <div className="bg-teal-50 border rounded-lg p-4">
            <p className="text-xs font-semibold uppercase mb-2">
              Selected Categories
            </p>
            <div className="space-y-2">
              {selectedCategories.length === 0 ? (
                <p className="text-sm text-gray-700">No sub categories selected</p>
              ) : (
                selectedCategories.map((category) => (
                  <div key={category}>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        category in tourismCategories
                          ? getCategoryColor(category as keyof typeof tourismCategories)
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category}
                    </span>
                    <p className="text-sm mt-1">
                      {"->"} {(selectedFeaturesByCategory[category] ?? []).join(", ")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
