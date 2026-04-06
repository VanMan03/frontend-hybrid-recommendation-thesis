import { useCallback, useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { type Destination, type LocationScope } from "@/app/context/AdminDataContext";
import { LocationMap } from "@/app/components/LocationMap";

type UploadedImage = {
  url: string;
  publicId: string;
};

type CloudinaryUploadSuccessInfo = {
  secure_url?: string;
  public_id?: string;
};

type CloudinaryUploadResult = {
  event?: string;
  info?: CloudinaryUploadSuccessInfo;
};

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryUploadResult) => void
      ) => {
        open: () => void;
      };
    };
  }
}

const MAX_IMAGES = 4;
const CLOUDINARY_SCRIPT_ID = "cloudinary-upload-widget-script";
const CLOUDINARY_WIDGET_SRC =
  "https://upload-widget.cloudinary.com/latest/global/all.js";
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const LOCATION_SCOPE_OPTIONS: Array<{
  value: LocationScope;
  label: string;
  helper: string;
}> = [
  {
    value: "IN_BULUSAN",
    label: "In Bulusan",
    helper: "Located within Bulusan municipality.",
  },
  {
    value: "NEAR_BULUSAN",
    label: "Near Bulusan",
    helper: "Outside Bulusan but nearby and recommended as a close alternative.",
  },
  {
    value: "SORSOGON",
    label: "Within Sorsogon",
    helper: "Within Sorsogon province but not in Bulusan.",
  },
  {
    value: "BICOL_REGION",
    label: "Within Bicol region",
    helper: "Located within the Bicol region but outside Sorsogon.",
  },
  {
    value: "OUTSIDE_BICOL",
    label: "Outside Bicol",
    helper: "Located outside the Bicol region.",
  },
];

interface EditDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    destinationId: string,
    updates: {
      name: string;
      description: string;
      estimatedCost: number;
      durationHours: number;
      locationScope: LocationScope;
      location: {
        lat: number;
        lng: number;
        latitude?: number;
        longitude?: number;
      };
      address?: {
        purok?: string;
        barangay?: string;
        municipality?: string;
        province?: string;
        fullAddress?: string;
      };
      images: UploadedImage[];
    }
  ) => Promise<void>;
  destination: Destination;
}

export function EditDestinationModal({
  isOpen,
  onClose,
  onSave,
  destination,
}: EditDestinationModalProps) {
  const getLatitude = (value?: Destination["location"]) =>
    value?.lat ?? value?.latitude ?? null;
  const getLongitude = (value?: Destination["location"]) =>
    value?.lng ?? value?.longitude ?? null;

  const getDurationHours = (value: Destination) =>
    value.durationHours ??
    (typeof (value as Destination & { duration?: number }).duration === "number"
      ? (value as Destination & { duration?: number }).duration
      : null);

  const [name, setName] = useState(destination.name);
  const [description, setDescription] = useState(destination.description);
  const [locationScope, setLocationScope] = useState<LocationScope>(
    destination.locationScope ?? "IN_BULUSAN"
  );
  const [estimatedCost, setEstimatedCost] = useState(
    destination.estimatedCost.toString()
  );
  const [durationHours, setDurationHours] = useState(
    getDurationHours(destination)?.toString() ?? ""
  );
  const [durationValidationError, setDurationValidationError] = useState<string | null>(null);
  const [location, setLocation] = useState({
    lat: getLatitude(destination.location),
    lng: getLongitude(destination.location),
  });
  const [address, setAddress] = useState({
    purok: destination.address?.purok ?? "",
    barangay: destination.address?.barangay ?? "",
    municipality: destination.address?.municipality ?? "",
    province: destination.address?.province ?? "",
    fullAddress:
      destination.address?.fullAddress ??
      destination.location?.resolvedAddress ??
      "",
  });
  const [images, setImages] = useState<UploadedImage[]>(
    destination.images ?? destination.image ?? []
  );
  const [isWidgetLoading, setIsWidgetLoading] = useState(false);
  const [widgetLoadError, setWidgetLoadError] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(destination.name);
    setDescription(destination.description);
    setLocationScope(destination.locationScope ?? "IN_BULUSAN");
    setEstimatedCost(destination.estimatedCost.toString());
    setDurationHours(getDurationHours(destination)?.toString() ?? "");
    setDurationValidationError(null);
    setLocation({
      lat: getLatitude(destination.location),
      lng: getLongitude(destination.location),
    });
    setAddress({
      purok: destination.address?.purok ?? "",
      barangay: destination.address?.barangay ?? "",
      municipality: destination.address?.municipality ?? "",
      province: destination.address?.province ?? "",
      fullAddress:
        destination.address?.fullAddress ??
        destination.location?.resolvedAddress ??
        "",
    });
    setImages(destination.images ?? destination.image ?? []);
  }, [destination, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || window.cloudinary) {
      return;
    }

    const existingScript = document.getElementById(CLOUDINARY_SCRIPT_ID);
    if (existingScript) {
      const cloudinaryReady = Boolean(window.cloudinary?.createUploadWidget);
      setIsWidgetLoading(!cloudinaryReady);
      if (!cloudinaryReady) {
        const onLoad = () => {
          setIsWidgetLoading(false);
          if (!window.cloudinary?.createUploadWidget) {
            setWidgetLoadError("Cloudinary widget did not initialize.");
          }
        };
        const onError = () => {
          setIsWidgetLoading(false);
          setWidgetLoadError("Failed to load Cloudinary widget script.");
        };
        existingScript.addEventListener("load", onLoad, { once: true });
        existingScript.addEventListener("error", onError, { once: true });
      }
      return;
    }

    setIsWidgetLoading(true);
    setWidgetLoadError(null);

    const script = document.createElement("script");
    script.id = CLOUDINARY_SCRIPT_ID;
    script.src = CLOUDINARY_WIDGET_SRC;
    script.async = true;
    script.onload = () => {
      setIsWidgetLoading(false);
      if (!window.cloudinary?.createUploadWidget) {
        setWidgetLoadError("Cloudinary widget did not initialize.");
      }
    };
    script.onerror = () => {
      setIsWidgetLoading(false);
      setWidgetLoadError("Failed to load Cloudinary widget script.");
    };
    document.body.appendChild(script);
  }, []);

  const openUploadWidget = useCallback(() => {
    if (images.length >= MAX_IMAGES) {
      alert("Maximum 4 images only");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!API_BASE_URL || !token) {
      alert("Missing API configuration or admin session.");
      return;
    }

    if (isWidgetLoading) {
      alert("Cloudinary upload widget is loading. Please try again in a moment.");
      return;
    }

    if (widgetLoadError) {
      alert(`Cloudinary upload widget error: ${widgetLoadError}`);
      return;
    }

    if (
      !window.cloudinary ||
      typeof window.cloudinary.createUploadWidget !== "function"
    ) {
      alert("Cloudinary upload widget is still loading. Please try again.");
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dxhn0w931",
        multiple: true,
        maxFiles: Math.min(remainingSlots, 10),
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png"],
        maxFileSize: 10_000_000,
        folder: "destinations",
        uploadSignature: async (
          callback: (signature: string, timestamp: number) => void,
          paramsToSign: Record<string, string | number | boolean>
        ) => {
          const res = await fetch(`${API_BASE_URL}/admin/cloudinary/signature`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              folder: "destinations",
              paramsToSign,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to get Cloudinary signature");
          }

          const data = (await res.json()) as {
            signature?: string;
            timestamp?: number;
          };
          if (!data.signature || !data.timestamp) {
            throw new Error("Cloudinary signature response is invalid");
          }

          callback(data.signature, data.timestamp);
        },
        apiKey: "712265452497626",
      },
      (error, result) => {
        if (error || result?.event !== "success") {
          return;
        }

        const url = result.info?.secure_url;
        const publicId = result.info?.public_id;
        if (!url || !publicId) {
          return;
        }

        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) {
            return prev;
          }

          if (prev.some((item) => item.publicId === publicId)) {
            return prev;
          }

          return [...prev, { url, publicId }];
        });
      }
    );

    widget.open();
  }, [images.length, isWidgetLoading, widgetLoadError]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    setLocation((prev) => ({
      ...prev,
      lat: next.latitude,
      lng: next.longitude,
    }));

    const resolvedAddress = await reverseGeocode(next.latitude, next.longitude);

    setLocation({ lat: next.latitude, lng: next.longitude });
    setAddress((prev) => ({
      ...prev,
      fullAddress: resolvedAddress || prev.fullAddress,
    }));
  }, [reverseGeocode]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      alert("Please enter a destination name and description");
      return;
    }
    if (location.lat === null || location.lng === null) {
      alert("Please select a destination location on the map");
      return;
    }
    const parsedDurationHours = Number(durationHours);
    if (!durationHours.trim() || Number.isNaN(parsedDurationHours)) {
      setDurationValidationError("Estimated stay duration is required.");
      return;
    }
    if (parsedDurationHours < 0.5 || parsedDurationHours > 12) {
      setDurationValidationError("Estimated stay duration must be between 0.5 and 12 hours.");
      return;
    }
    setDurationValidationError(null);

    setLoading(true);

    try {
      const trimOptional = (value: string) => {
        const trimmed = value.trim();
        return trimmed ? trimmed : undefined;
      };

      await onSave(destination._id, {
        name: name.trim(),
        description: description.trim(),
        locationScope,
        estimatedCost: Number(estimatedCost),
        durationHours: parsedDurationHours,
        location: {
          lat: location.lat,
          lng: location.lng,
          latitude: location.lat,
          longitude: location.lng,
        },
        address: {
          purok: trimOptional(address.purok),
          barangay: trimOptional(address.barangay),
          municipality: trimOptional(address.municipality),
          province: trimOptional(address.province),
          fullAddress: trimOptional(address.fullAddress),
        },
        images,
      });
      onClose();
    } catch {
      alert("Failed to update destination");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Destination</h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location Scope <span className="text-red-500">*</span>
            </label>
            <select
              value={locationScope}
              onChange={(e) => setLocationScope(e.target.value as LocationScope)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {LOCATION_SCOPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {LOCATION_SCOPE_OPTIONS.find((option) => option.value === locationScope)?.helper}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Fee (PHP)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Stay Duration (hours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              onBlur={() => {
                const parsed = Number(durationHours);
                if (!durationHours.trim() || Number.isNaN(parsed)) {
                  setDurationValidationError("Estimated stay duration is required.");
                  return;
                }
                if (parsed < 0.5 || parsed > 12) {
                  setDurationValidationError(
                    "Estimated stay duration must be between 0.5 and 12 hours."
                  );
                  return;
                }
                setDurationValidationError(null);
              }}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            {durationValidationError ? (
              <p className="text-sm text-red-700 mt-1">{durationValidationError}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination Images (max 4)
            </label>
            <button
              type="button"
              onClick={openUploadWidget}
              disabled={images.length >= MAX_IMAGES || isWidgetLoading}
              className="px-4 py-2 rounded-lg border border-teal-600 text-teal-700 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWidgetLoading ? "Loading Uploader..." : "Upload Image"}
            </button>
            <p className="text-xs text-gray-600 mt-2">
              {images.length}/{MAX_IMAGES} uploaded
            </p>
            {widgetLoadError ? (
              <p className="text-xs text-red-600 mt-1">{widgetLoadError}</p>
            ) : null}

            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.map((img, index) => (
                <div key={img.publicId} className="relative">
                  <img
                    src={img.url}
                    alt={`Destination image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Click on the map to update the destination location.
            </p>
            <LocationMap
              interactive
              value={
                location.lat !== null && location.lng !== null
                  ? { latitude: location.lat, longitude: location.lng }
                  : null
              }
              onSelect={handleMapLocationSelect}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Latitude
                </p>
                <input
                  type="number"
                  step="any"
                  value={location.lat ?? ""}
                  onChange={(e) =>
                    setLocation((prev) => ({
                      ...prev,
                      lat: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 12.769262"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Longitude
                </p>
                <input
                  type="number"
                  step="any"
                  value={location.lng ?? ""}
                  onChange={(e) =>
                    setLocation((prev) => ({
                      ...prev,
                      lng: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 124.140175"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Purok
                </label>
                <input
                  type="text"
                  value={address.purok}
                  onChange={(e) => setAddress((prev) => ({ ...prev, purok: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  value={address.barangay}
                  onChange={(e) => setAddress((prev) => ({ ...prev, barangay: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Municipality
                </label>
                <input
                  type="text"
                  value={address.municipality}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, municipality: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Province
                </label>
                <input
                  type="text"
                  value={address.province}
                  onChange={(e) => setAddress((prev) => ({ ...prev, province: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Full Address (optional)
              </label>
              <input
                type="text"
                value={address.fullAddress}
                onChange={(e) => setAddress((prev) => ({ ...prev, fullAddress: e.target.value }))}
                placeholder={isResolvingAddress ? "Resolving address..." : ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Save className="size-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
