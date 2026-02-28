import { useCallback, useEffect, useMemo, useState } from "react";
import { tourismCategories } from "@/app/data/tourismCategories";
import {
  createDestinationCategory,
  createDestinationFeature,
  deleteDestinationCategory,
  deleteDestinationFeature,
  getDestinationTaxonomy,
  type DestinationTaxonomyMap,
  updateDestinationCategory,
  updateDestinationFeature,
} from "@/services/destinationTaxonomy";

type UseDestinationTaxonomyResult = {
  taxonomy: DestinationTaxonomyMap;
  categories: string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCategory: (category: string, features: string[]) => Promise<void>;
  renameCategory: (currentCategory: string, nextCategory: string) => Promise<void>;
  replaceCategoryFeatures: (
    category: string,
    features: string[]
  ) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  createFeature: (category: string, feature: string) => Promise<void>;
  renameFeature: (
    category: string,
    currentFeature: string,
    nextFeature: string
  ) => Promise<void>;
  deleteFeature: (category: string, feature: string) => Promise<void>;
};

const fallbackTaxonomy: DestinationTaxonomyMap = tourismCategories;

const trimList = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

export function useDestinationTaxonomy(): UseDestinationTaxonomyResult {
  const [taxonomy, setTaxonomy] =
    useState<DestinationTaxonomyMap>(fallbackTaxonomy);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const validFeatures = await getDestinationTaxonomy();
      if (Object.keys(validFeatures).length > 0) {
        setTaxonomy(validFeatures);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load destination taxonomy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const runMutation = useCallback(async (mutator: () => Promise<unknown>) => {
    setSaving(true);
    setError(null);
    try {
      await mutator();
      await refetch();
    } catch (err: any) {
      setError(err.message || "Failed to update destination taxonomy");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [refetch]);

  const categories = useMemo(() => Object.keys(taxonomy), [taxonomy]);

  return {
    taxonomy,
    categories,
    loading,
    saving,
    error,
    refetch,
    createCategory: async (category: string, features: string[]) => {
      const nextCategory = category.trim();
      const nextFeatures = trimList(features);
      await runMutation(() =>
        createDestinationCategory({
          category: nextCategory,
          features: nextFeatures,
        })
      );
    },
    renameCategory: async (currentCategory: string, nextCategory: string) => {
      await runMutation(() =>
        updateDestinationCategory(currentCategory, {
          category: nextCategory.trim(),
        })
      );
    },
    replaceCategoryFeatures: async (category: string, features: string[]) => {
      await runMutation(() =>
        updateDestinationCategory(category, { features: trimList(features) })
      );
    },
    deleteCategory: async (category: string) => {
      await runMutation(() => deleteDestinationCategory(category));
    },
    createFeature: async (category: string, feature: string) => {
      await runMutation(() =>
        createDestinationFeature(category, { feature: feature.trim() })
      );
    },
    renameFeature: async (
      category: string,
      currentFeature: string,
      nextFeature: string
    ) => {
      await runMutation(() =>
        updateDestinationFeature(category, currentFeature, {
          feature: nextFeature.trim(),
        })
      );
    },
    deleteFeature: async (category: string, feature: string) => {
      await runMutation(() => deleteDestinationFeature(category, feature));
    },
  };
}
