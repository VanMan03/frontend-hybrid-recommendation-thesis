import type { MainCategory, SubCategory } from "@/app/data/tourismCategories";

interface MapInput {
  name: string;
  description: string;
  entryFee: number;
  mainCategory: MainCategory;
  subCategory: SubCategory; // this is actually FEATURE
}

export function mapDestinationPayload(input: MapInput) {
  return {
    name: input.name,
    description: input.description,
    category: input.mainCategory,          // ✅ category
    features: [input.subCategory],          // ✅ FEATURES ARRAY
    estimatedCost: input.entryFee,
  };
}
