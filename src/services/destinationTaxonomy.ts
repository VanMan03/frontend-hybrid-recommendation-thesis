import { apiRequest } from "./api";

export type DestinationTaxonomyMap = Record<string, string[]>;

type TaxonomyResponse = {
  key?: string;
  validFeatures?: DestinationTaxonomyMap;
  updatedAt?: string;
};

const normalizeTaxonomy = (
  data: TaxonomyResponse | DestinationTaxonomyMap
): DestinationTaxonomyMap => {
  if ("validFeatures" in data && data.validFeatures) {
    return data.validFeatures;
  }

  return data as DestinationTaxonomyMap;
};

export const getDestinationTaxonomy = async (): Promise<DestinationTaxonomyMap> => {
  const response = await apiRequest("/admin/destination-taxonomy");
  return normalizeTaxonomy(response as TaxonomyResponse | DestinationTaxonomyMap);
};

export const replaceDestinationTaxonomy = async (
  validFeatures: DestinationTaxonomyMap
) => {
  return apiRequest("/admin/destination-taxonomy", {
    method: "PUT",
    body: JSON.stringify({ validFeatures }),
  });
};

export const createDestinationCategory = async (payload: {
  category: string;
  features: string[];
}) => {
  return apiRequest("/admin/destination-taxonomy/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateDestinationCategory = async (
  category: string,
  payload: {
    category?: string;
    features?: string[];
  }
) => {
  return apiRequest(
    `/admin/destination-taxonomy/categories/${encodeURIComponent(category)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

export const deleteDestinationCategory = async (category: string) => {
  return apiRequest(
    `/admin/destination-taxonomy/categories/${encodeURIComponent(category)}`,
    {
      method: "DELETE",
    }
  );
};

export const createDestinationFeature = async (
  category: string,
  payload: { feature: string }
) => {
  return apiRequest(
    `/admin/destination-taxonomy/categories/${encodeURIComponent(
      category
    )}/features`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const updateDestinationFeature = async (
  category: string,
  feature: string,
  payload: { feature: string }
) => {
  return apiRequest(
    `/admin/destination-taxonomy/categories/${encodeURIComponent(
      category
    )}/features/${encodeURIComponent(feature)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

export const deleteDestinationFeature = async (
  category: string,
  feature: string
) => {
  return apiRequest(
    `/admin/destination-taxonomy/categories/${encodeURIComponent(
      category
    )}/features/${encodeURIComponent(feature)}`,
    {
      method: "DELETE",
    }
  );
};
