import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useDestinationTaxonomy } from "@/app/hooks/useDestinationTaxonomy";
import { useAdminData } from "@/app/context/AdminDataContext";

interface ManageDestinationTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const parseFeatureInput = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

type TaxonomyActionDialog =
  | {
      kind: "rename-category";
      currentCategory: string;
      value: string;
    }
  | {
      kind: "rename-feature";
      feature: string;
      value: string;
    }
  | {
      kind: "delete-category";
      category: string;
    }
  | {
      kind: "delete-feature";
      feature: string;
    };

export function ManageDestinationTaxonomyModal({
  isOpen,
  onClose,
}: ManageDestinationTaxonomyModalProps) {
  const { destinations } = useAdminData();
  const {
    taxonomy,
    categories,
    loading,
    saving,
    error,
    refetch,
    createCategory,
    renameCategory,
    replaceCategoryFeatures,
    deleteCategory,
    createFeature,
    renameFeature,
    deleteFeature,
  } = useDestinationTaxonomy();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryFeatures, setNewCategoryFeatures] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [featureEditor, setFeatureEditor] = useState("");
  const [actionDialog, setActionDialog] = useState<TaxonomyActionDialog | null>(
    null
  );
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  const toInterestId = (label: string) => {
    const normalized = label
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return normalized.replace(/_tourism$/, "");
  };

  const toFeatureKey = (value: string) =>
    value
      .replace(/&/g, "")
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .toLowerCase();

  const getFeatureCandidates = (label: string) =>
    new Set([
      label,
      label.toLowerCase(),
      toInterestId(label),
      toFeatureKey(label),
    ]);

  const isFeatureUsed = (
    featureLabel: string,
    categoryLabel: string,
    destination: typeof destinations[number]
  ) => {
    const candidates = getFeatureCandidates(featureLabel);
    const matches = (value: string) => {
      if (candidates.has(value) || candidates.has(value.toLowerCase())) {
        return true;
      }
      if (candidates.has(toFeatureKey(value))) {
        return true;
      }
      if (candidates.has(toInterestId(value))) {
        return true;
      }
      return false;
    };

    if (Array.isArray(destination.subInterests)) {
      if (destination.subInterests.some(matches)) {
        return true;
      }
    }

    const features = destination.features;
    if (Array.isArray(features)) {
      if (features.some(matches)) {
        return true;
      }
      return false;
    }

    if (!features || typeof features !== "object") {
      return false;
    }

    const categoryValue = (features as Record<string, unknown>)[categoryLabel];
    if (Array.isArray(categoryValue) && categoryValue.some(matches)) {
      return true;
    }
    if (categoryValue && typeof categoryValue === "object") {
      if (Object.keys(categoryValue as Record<string, unknown>).some(matches)) {
        return true;
      }
    }

    return Object.entries(features as Record<string, unknown>).some(([, value]) => {
      if (Array.isArray(value)) {
        return value.some(matches);
      }
      if (value && typeof value === "object") {
        return Object.keys(value as Record<string, unknown>).some(matches);
      }
      return false;
    });
  };

  const featureUsage = useMemo(() => {
    if (!actionDialog || actionDialog.kind !== "delete-feature") {
      return [] as typeof destinations;
    }
    if (!selectedCategory) {
      return [] as typeof destinations;
    }
    return destinations.filter((destination) =>
      isFeatureUsed(actionDialog.feature, selectedCategory, destination)
    );
  }, [actionDialog, destinations, selectedCategory]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, isOpen, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) {
      setFeatureEditor("");
      return;
    }
    setFeatureEditor((taxonomy[selectedCategory] ?? []).join(", "));
  }, [selectedCategory, taxonomy]);

  const selectedFeatures = useMemo(
    () => taxonomy[selectedCategory] ?? [],
    [selectedCategory, taxonomy]
  );

  if (!isOpen) return null;

  const handleAddCategory = async () => {
    setFormValidationError(null);
    if (!newCategory.trim()) {
      setFormValidationError("Category name is required.");
      return;
    }
    const features = parseFeatureInput(newCategoryFeatures);
    if (features.length === 0) {
      setFormValidationError("A category must include at least one sub-interest/feature.");
      return;
    }

    try {
      await createCategory(newCategory, features);
      setNewCategory("");
      setNewCategoryFeatures("");
      setSelectedCategory(newCategory.trim());
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    }
  };

  const handleReplaceFeatures = async () => {
    setFormValidationError(null);
    if (!selectedCategory) return;
    const nextFeatures = parseFeatureInput(featureEditor);
    if (nextFeatures.length === 0) {
      setFormValidationError(
        `Category "${selectedCategory}" must contain at least one sub-interest/feature.`
      );
      return;
    }

    try {
      await replaceCategoryFeatures(selectedCategory, nextFeatures);
    } catch (err: any) {
      alert(err.message || "Failed to replace features");
    }
  };

  const handleAddFeature = async () => {
    setFormValidationError(null);
    if (!selectedCategory) return;
    if (!newFeature.trim()) {
      setFormValidationError("Feature name is required.");
      return;
    }

    try {
      await createFeature(selectedCategory, newFeature);
      setNewFeature("");
    } catch (err: any) {
      alert(err.message || "Failed to create feature");
    }
  };

  const handleActionConfirm = async () => {
    if (!actionDialog) {
      return;
    }

    if (actionDialog.kind === "delete-feature" && featureUsage.length > 0) {
      setFormValidationError(
        `Cannot delete "${actionDialog.feature}". ${featureUsage.length} destination(s) are currently using it.`
      );
      return;
    }

    setIsActionSubmitting(true);
    try {
      if (actionDialog.kind === "rename-category") {
        const next = actionDialog.value.trim();
        if (!next || next === actionDialog.currentCategory) {
          setActionDialog(null);
          return;
        }
        await renameCategory(actionDialog.currentCategory, next);
        setSelectedCategory(next);
      }

      if (actionDialog.kind === "rename-feature") {
        const next = actionDialog.value.trim();
        if (!next || next === actionDialog.feature) {
          setActionDialog(null);
          return;
        }
        await renameFeature(selectedCategory, actionDialog.feature, next);
      }

      if (actionDialog.kind === "delete-category") {
        await deleteCategory(actionDialog.category);
        setSelectedCategory("");
      }

      if (actionDialog.kind === "delete-feature") {
        await deleteFeature(selectedCategory, actionDialog.feature);
      }

      setActionDialog(null);
    } catch (err: any) {
      alert(err.message || "Failed to apply taxonomy action");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Destination Taxonomy Manager
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create, edit, and delete categories and features used by destination forms.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close taxonomy manager"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {formValidationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formValidationError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Categories</h3>
                <button
                  onClick={() => void refetch()}
                  className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  <RefreshCw className="size-4" />
                  Refresh
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-600">Loading taxonomy...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-600">No categories found.</p>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setFeatureEditor((taxonomy[category] ?? []).join(", "));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg border ${
                        selectedCategory === category
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-xs text-gray-600">
                        {(taxonomy[category] ?? []).length} feature(s)
                      </p>
                    </button>
                  ))
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-800">
                  Add Category
                </h4>
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <textarea
                  rows={3}
                  placeholder="Features (comma-separated)"
                  value={newCategoryFeatures}
                  onChange={(e) => setNewCategoryFeatures(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="size-4" />
                  Create Category
                </button>
              </div>
            </section>

            <section className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Features</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setActionDialog({
                        kind: "rename-category",
                        currentCategory: selectedCategory,
                        value: selectedCategory,
                      })
                    }
                    disabled={!selectedCategory || saving}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Pencil className="size-4" />
                    Rename Category
                  </button>
                  <button
                    onClick={() =>
                      setActionDialog({
                        kind: "delete-category",
                        category: selectedCategory,
                      })
                    }
                    disabled={!selectedCategory || saving}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                    Delete Category
                  </button>
                </div>
              </div>

              {!selectedCategory ? (
                <p className="text-sm text-gray-600">
                  Select a category to manage its features.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Selected:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedCategory}
                    </span>
                  </p>

                  <div className="space-y-2 max-h-52 overflow-y-auto border rounded-lg p-3">
                    {selectedFeatures.length === 0 ? (
                      <p className="text-sm text-gray-600">No features found.</p>
                    ) : (
                      selectedFeatures.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center justify-between border rounded px-3 py-2"
                        >
                          <span className="text-sm text-gray-900">{feature}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                setActionDialog({
                                  kind: "rename-feature",
                                  feature,
                                  value: feature,
                                })
                              }
                              className="p-1.5 rounded hover:bg-gray-100"
                              title="Rename feature"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActionDialog({
                                  kind: "delete-feature",
                                  feature,
                                })
                              }
                              className="p-1.5 rounded hover:bg-red-50 text-red-700"
                              title="Delete feature"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      placeholder="New feature name"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={handleAddFeature}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      <Plus className="size-4" />
                      Add Feature
                    </button>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Replace All Features
                    </h4>
                    <textarea
                      rows={3}
                      placeholder="Comma-separated features"
                      value={featureEditor}
                      onChange={(e) => setFeatureEditor(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                    />
                    <button
                      onClick={handleReplaceFeatures}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <Save className="size-4" />
                      Save Feature List
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {actionDialog && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border">
            <div className="p-5 border-b flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                {actionDialog.kind === "rename-category" && "Rename Category"}
                {actionDialog.kind === "rename-feature" && "Rename Feature"}
                {actionDialog.kind === "delete-category" && "Delete Category"}
                {actionDialog.kind === "delete-feature" && "Delete Feature"}
              </h4>
              <button
                onClick={() => setActionDialog(null)}
                className="p-1.5 rounded hover:bg-gray-100"
                disabled={isActionSubmitting}
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {actionDialog.kind === "rename-category" && (
                <input
                  type="text"
                  value={actionDialog.value}
                  onChange={(e) =>
                    setActionDialog((prev) =>
                      prev && prev.kind === "rename-category"
                        ? { ...prev, value: e.target.value }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="New category name"
                />
              )}

              {actionDialog.kind === "rename-feature" && (
                <input
                  type="text"
                  value={actionDialog.value}
                  onChange={(e) =>
                    setActionDialog((prev) =>
                      prev && prev.kind === "rename-feature"
                        ? { ...prev, value: e.target.value }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="New feature name"
                />
              )}

              {actionDialog.kind === "delete-category" && (
                <p className="text-sm text-gray-700">
                  Delete <span className="font-semibold">{actionDialog.category}</span>{" "}
                  and all its features?
                </p>
              )}

              {actionDialog.kind === "delete-feature" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Delete feature <span className="font-semibold">{actionDialog.feature}</span>?
                  </p>
                  {featureUsage.length > 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <p className="font-semibold">
                        This feature is still used by {featureUsage.length} destination(s).
                      </p>
                      <p>Remove it from those destinations before deleting.</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setActionDialog(null)}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100"
                disabled={isActionSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleActionConfirm()}
                disabled={isActionSubmitting || (actionDialog.kind === "delete-feature" && featureUsage.length > 0)}
                className={`px-3 py-2 rounded-lg text-white ${
                  actionDialog.kind.includes("delete")
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isActionSubmitting
                  ? "Processing..."
                  : actionDialog.kind.includes("delete")
                    ? "Delete"
                    : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
