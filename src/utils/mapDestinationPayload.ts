import type { MainCategory, SubCategory } from "@/app/data/tourismCategories";
import { tourismCategories } from "@/app/data/tourismCategories";

interface MapInput {
  name: string;
  description: string;
  entryFee: number;
  mainCategory: MainCategory;
  subCategories: SubCategory[];
  location: {
    latitude: number;
    longitude: number;
    resolvedAddress?: string;
  };
}

export function mapDestinationPayload(input: MapInput) {
  const categories = Array.from(
    new Set(
      input.subCategories.flatMap((subCategory) =>
        (Object.keys(tourismCategories) as MainCategory[]).filter((category) =>
          tourismCategories[category].includes(subCategory)
        )
      )
    )
  );

  const featuresByCategory: Record<string, SubCategory[]> = {};
  categories.forEach((category) => {
    const selected = input.subCategories.filter((subCategory) =>
      tourismCategories[category].includes(subCategory)
    );

    if (selected.length > 0) {
      featuresByCategory[category] = Array.from(new Set(selected));
    }
  });

  return {
    name: input.name,
    description: input.description,
    category: categories,
    categories,
    features: featuresByCategory,
    estimatedCost: input.entryFee,
    latitude: Number(input.location.latitude),
    longitude: Number(input.location.longitude),
    location: input.location,
  };
}
