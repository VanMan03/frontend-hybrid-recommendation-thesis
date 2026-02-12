import type { MainCategory, SubCategory } from "@/app/data/tourismCategories";

interface MapInput {
  name: string;
  description: string;
  entryFee: number;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  location: {
    latitude: number;
    longitude: number;
    resolvedAddress?: string;
  };
}

export function mapDestinationPayload(input: MapInput) {
  return {
    name: input.name,
    description: input.description,
    category: input.mainCategory,
    features: [input.subCategory],
    estimatedCost: input.entryFee,
    latitude: Number(input.location.latitude),
    longitude: Number(input.location.longitude),
    location: input.location,
  };
}
