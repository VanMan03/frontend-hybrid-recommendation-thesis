import { X } from 'lucide-react';
import { type Destination } from '@/app/context/AdminDataContext';
import { LocationMap } from "@/app/components/LocationMap";
import { tourismCategories } from "@/app/data/tourismCategories";

interface ViewDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
}

export function ViewDestinationModal({ isOpen, onClose, destination }: ViewDestinationModalProps) {
  if (!isOpen || !destination) return null;

  const toFeatureKey = (value: string) =>
    value
      .replace(/&/g, "")
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .toLowerCase();
  const featureLabelMap = new Map<string, string>(
    Object.values(tourismCategories)
      .flat()
      .map((label) => [toFeatureKey(label), label])
  );
  const toLabel = (feature: string) => featureLabelMap.get(feature) ?? feature;

  const destinationImage = destination.images?.[0]?.url ?? destination.image?.[0]?.url;
  const categorySource = destination.categories ?? destination.category;
  const categoryText = Array.isArray(categorySource)
    ? categorySource.join(", ")
    : categorySource;
  const featuresList = Array.isArray(destination.features)
    ? destination.features.map(toLabel)
    : Object.entries(destination.features ?? {})
        .flatMap(([category, value]) => {
          if (Array.isArray(value)) {
            return value.map((feature) => toLabel(feature));
          }

          if (typeof value === "number") {
            return value > 0 ? [toLabel(category)] : [];
          }

          if (!value || typeof value !== "object") {
            return [];
          }

          return Object.entries(value)
            .filter(([, score]) => typeof score === "number" && score > 0)
            .map(([feature]) => toLabel(feature));
        });
  const featuresText = Array.from(new Set(featuresList)).join(', ');
  const destinationLatitude =
    destination.location?.lat ?? destination.location?.latitude ?? null;
  const destinationLongitude =
    destination.location?.lng ?? destination.location?.longitude ?? null;
  const destinationLocation =
    destinationLatitude !== null && destinationLongitude !== null
      ? {
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        }
      : null;
  const durationHours =
    typeof destination.durationHours === "number"
      ? destination.durationHours
      : typeof destination.duration === "number"
        ? destination.duration
        : null;
  const durationText =
    durationHours === null ? "Not available" : `${durationHours} hour${durationHours === 1 ? "" : "s"}`;

  const locationScope = destination.locationScope ?? "IN_BULUSAN";
  const locationScopeMeta: Record<
    "IN_BULUSAN" | "NEAR_BULUSAN" | "SORSOGON" | "BICOL_REGION" | "OUTSIDE_BICOL",
    { label: string; message: string }
  > = {
    IN_BULUSAN: {
      label: "In Bulusan",
      message: "This destination is within Bulusan municipality.",
    },
    NEAR_BULUSAN: {
      label: "Near Bulusan",
      message: "This destination is outside Bulusan but nearby and a strong alternative.",
    },
    SORSOGON: {
      label: "Within Sorsogon",
      message: "This destination is in Sorsogon province but not in Bulusan.",
    },
    BICOL_REGION: {
      label: "Within Bicol region",
      message: "This destination is within the Bicol region but outside Sorsogon.",
    },
    OUTSIDE_BICOL: {
      label: "Outside Bicol",
      message: "This destination is outside the Bicol region.",
    },
  };

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

  const toAddressText = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed;
    }
    if (typeof value !== "object") return "";

    const record = value as Record<string, unknown>;
    const fullAddress =
      typeof record.fullAddress === "string" ? record.fullAddress.trim() : "";
    if (fullAddress) return fullAddress;

    const parts = [
      record.purok,
      record.barangay,
      record.municipality,
      record.city,
      record.province,
      record.country,
    ]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .map((part) => part.trim());

    return parts.join(", ");
  };

  const normalizedAddress =
    toAddressText(destination.address) ||
    toAddressText((destination.location as Record<string, unknown> | undefined)?.address) ||
    toAddressText(destination.location?.resolvedAddress) ||
    "Not available";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className="relative h-64 overflow-hidden">
          {destinationImage ? (
            <img
              src={destinationImage}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
              No image available
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-lg"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Description */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{destination.name}</h2>
            <p className="text-gray-600 leading-relaxed">{destination.description}</p>
          </div>

          {/* Category and Features */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Destination Details</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Category:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                  {categoryText}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Features:</span>
                <span className="text-sm text-gray-700">
                  {featuresText || 'No features'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Location Scope:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                  {locationScopeMeta[locationScope].label}
                </span>
              </div>
              <p className="text-xs text-gray-600">{locationScopeMeta[locationScope].message}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estimated Fee */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Estimated Fee</p>
              <p className="text-xl font-bold text-blue-600">PHP {destination.estimatedCost}</p>
            </div>

            {/* Average Trip Duration */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-xs font-semibold text-amber-900 uppercase mb-2">Average Trip Duration</p>
              <p className="text-xl font-bold text-amber-700">{durationText}</p>
            </div>

            {/* Status */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-900 uppercase mb-2">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(destination.isActive)}`}>
                {destination.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase">Location</p>
            {destinationLocation ? (
              <>
                <LocationMap value={destinationLocation} heightClassName="h-56" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Latitude:</span>{" "}
                    {destinationLatitude !== null ? destinationLatitude.toFixed(6) : "Not available"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Longitude:</span>{" "}
                    {destinationLongitude !== null ? destinationLongitude.toFixed(6) : "Not available"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">No location saved for this destination.</p>
            )}
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Address:</span>{" "}
              {normalizedAddress}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
