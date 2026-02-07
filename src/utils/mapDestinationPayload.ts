type DestinationFormData = {
  name: string;
  description: string;
  entryFee: string | number;
  mainCategory: string;
  subCategory: string;
};

/**
 * Maps Admin UI form data to backend Destination payload
 */
export function mapDestinationPayload(form: DestinationFormData) {
  const features: Record<string, number> = {};

  // Normalize strings
  const main = form.mainCategory.toLowerCase();
  const sub = form.subCategory.toLowerCase();

  // Feature mapping (extendable)
  if (main.includes("nature")) features.nature = 1;
  if (main.includes("cultural")) features.culture = 1;
  if (main.includes("beach")) features.beach = 1;
  if (main.includes("cruise")) features.nautical = 1;
  if (main.includes("leisure")) features.leisure = 1;

  if (sub.includes("eco")) features.eco = 1;
  if (sub.includes("trek")) features.adventure = 1;
  if (sub.includes("volcanic")) features.volcanic = 1;
  if (sub.includes("caves")) features.adventure = 1;

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    category: `${form.mainCategory} - ${form.subCategory}`,
    estimatedCost: Number(form.entryFee),
    features
  };
}
