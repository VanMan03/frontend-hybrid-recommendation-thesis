import { useCallback, useEffect, useState, useRef } from "react";
import { X, Save } from "lucide-react";
import { getCategoryColor, tourismCategories } from "@/app/data/tourismCategories";
import { useAdminData } from "@/app/context/AdminDataContext";
import { LocationMap } from "@/app/components/LocationMap";
import { useDestinationTaxonomy } from "@/app/hooks/useDestinationTaxonomy";

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
const CLOUDINARY_WIDGET_SRC = "https://upload-widget.cloudinary.com/latest/global/all.js";
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddressFormState = {
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
  fullAddress: string;
};

export function AddDestinationModal({
  isOpen,
  onClose,
}: AddDestinationModalProps) {
  const { createDestination } = useAdminData();
  const { taxonomy, categories, refetch } = useDestinationTaxonomy();
  const defaultCategory = categories[0] ?? "Nature Tourism";

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isWidgetLoading, setIsWidgetLoading] = useState(false);
  const [widgetLoadError, setWidgetLoadError] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ place_name: string; center: [number, number] }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [categoryValidationError, setCategoryValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    activeCategory: defaultCategory,
    selectedFeaturesByCategory: {} as Record<string, string[]>,
    entryFeeValue: null as number | null,
    accessibility: "Moderate",
    location: {
      lat: null as number | null,
      lng: null as number | null,
    },
    address: {
      purok: "",
      barangay: "",
      municipality: "",
      province: "",
      fullAddress: "",
    } as AddressFormState,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void refetch();
  }, [isOpen, refetch]);

  useEffect(() => {
    if (typeof window === "undefined" || window.cloudinary) {
      return;
    }

    const existingScript = document.getElementById(CLOUDINARY_SCRIPT_ID);
    if (existingScript) {
      const cloudinaryReady = Boolean(window.cloudinary?.createUploadWidget);
      if (cloudinaryReady) {
        setIsWidgetLoading(false);
        setWidgetLoadError(null);
      } else {
        const scriptStatus = existingScript.getAttribute("data-status");
        const scriptAlreadyFinished = scriptStatus === "loaded" || scriptStatus === "error";

        if (scriptAlreadyFinished) {
          setIsWidgetLoading(false);
          setWidgetLoadError(
            scriptStatus === "error"
              ? "Failed to load Cloudinary widget script."
              : "Cloudinary widget did not initialize."
          );
          return;
        }

        setIsWidgetLoading(true);
        const onLoad = () => {
          setIsWidgetLoading(false);
          existingScript.setAttribute("data-status", "loaded");
          if (!window.cloudinary?.createUploadWidget) {
            setWidgetLoadError("Cloudinary widget did not initialize.");
            return;
          }
          setWidgetLoadError(null);
        };
        const onError = () => {
          setIsWidgetLoading(false);
          existingScript.setAttribute("data-status", "error");
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
    script.setAttribute("data-status", "loading");
    script.src = CLOUDINARY_WIDGET_SRC;
    script.async = true;
    script.onload = () => {
      setIsWidgetLoading(false);
      script.setAttribute("data-status", "loaded");
      if (!window.cloudinary?.createUploadWidget) {
        setWidgetLoadError("Cloudinary widget did not initialize.");
        return;
      }
      setWidgetLoadError(null);
    };
    script.onerror = () => {
      setIsWidgetLoading(false);
      script.setAttribute("data-status", "error");
      setWidgetLoadError("Failed to load Cloudinary widget script.");
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    setFormData((prev) => {
      const nextActiveCategory = categories.includes(prev.activeCategory)
        ? prev.activeCategory
        : categories[0];
      const nextSelectedFeaturesByCategory = Object.fromEntries(
        Object.entries(prev.selectedFeaturesByCategory)
          .filter(([category]) => categories.includes(category))
          .map(([category, features]) => [
            category,
            features.filter((feature) => (taxonomy[category] ?? []).includes(feature)),
          ])
          .filter(([, features]) => features.length > 0)
      );

      return {
        ...prev,
        activeCategory: nextActiveCategory,
        selectedFeaturesByCategory: nextSelectedFeaturesByCategory,
      };
    });
  }, [categories, taxonomy]);

  const handleMainCategoryChange = (category: string) => {
    setCategoryValidationError(null);
    setFormData((prev) => ({
      ...prev,
      activeCategory: category,
    }));
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setCategoryValidationError(null);
    setFormData((prev) => {
      const currentFeatures = prev.selectedFeaturesByCategory[prev.activeCategory] ?? [];
      const isSelected = currentFeatures.includes(subCategory);
      const nextFeatures = isSelected
        ? currentFeatures.filter((item) => item !== subCategory)
        : [...currentFeatures, subCategory];

      const nextSelectedFeaturesByCategory = { ...prev.selectedFeaturesByCategory };
      if (nextFeatures.length === 0) {
        delete nextSelectedFeaturesByCategory[prev.activeCategory];
      } else {
        nextSelectedFeaturesByCategory[prev.activeCategory] = nextFeatures;
      }

      return {
        ...prev,
        selectedFeaturesByCategory: nextSelectedFeaturesByCategory,
      };
    });
  };

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

    if (!window.cloudinary || typeof window.cloudinary.createUploadWidget !== "function") {
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

          const data = (await res.json()) as { signature?: string; timestamp?: number };
          if (!data.signature || !data.timestamp) {
            throw new Error("Cloudinary signature response is invalid");
          }

          callback(data.signature, data.timestamp);
        },
        apiKey: "712265452497626",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          return;
        }

        if (result?.event !== "success") {
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
    setImages(images.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    const nextDefaultCategory = categories[0] ?? "Nature Tourism";
    setFormData({
      name: "",
      description: "",
      activeCategory: nextDefaultCategory,
      selectedFeaturesByCategory: {},
      entryFeeValue: null,
      accessibility: "Moderate",
      location: {
        lat: null,
        lng: null,
      },
      address: {
        purok: "",
        barangay: "",
        municipality: "",
        province: "",
        fullAddress: "",
      },
    });
    setImages([]);
    setIsResolvingAddress(false);
    setCategoryValidationError(null);
  };

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setIsResolvingAddress(true);
    try {
      // Using Mapbox Geocoding API for reverse geocoding
      const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_ACCESS_TOKEN) {
        console.error("Mapbox access token is missing. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file.");
        return "";
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      if (!response.ok) {
        return "";
      }

      const data = (await response.json()) as { features: Array<{ place_name: string }> };
      return data.features?.[0]?.place_name ?? "";
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
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        lat: next.latitude,
        lng: next.longitude,
      },
    }));

    const resolvedAddress = await reverseGeocode(next.latitude, next.longitude);

    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        lat: next.latitude,
        lng: next.longitude,
      },
      address: {
        ...prev.address,
        fullAddress: resolvedAddress || prev.address.fullAddress,
      },
    }));
  }, [reverseGeocode]);

  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Using Mapbox Geocoding API for forward geocoding
      const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!MAPBOX_ACCESS_TOKEN) {
        console.error("Mapbox access token is missing. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file.");
        setSearchResults([]);
        return;
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`
      );
      if (!response.ok) {
        setSearchResults([]);
        return;
      }

      const data = (await response.json()) as { 
        features: Array<{ 
          place_name: string; 
          center: [number, number];
        }> 
      };
      setSearchResults(data.features || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Failed to search location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchResultSelect = useCallback((result: { place_name: string; center: [number, number] }) => {
    const [longitude, latitude] = result.center;
    handleMapLocationSelect({ latitude, longitude });
    setSearchQuery(result.place_name);
    setShowSearchResults(false);
    setSearchResults([]);
  }, [handleMapLocationSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const normalizedSelections = Object.fromEntries(
      Object.entries(formData.selectedFeaturesByCategory)
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
    const selectedCategories = Object.keys(featuresByCategory);

    if (selectedCategories.length === 0) {
      setCategoryValidationError("Please select at least one sub-category before saving.");
      return;
    }
    setCategoryValidationError(null);
    if (formData.entryFeeValue === null || Number.isNaN(formData.entryFeeValue)) {
      alert("Please enter an entry fee");
      return;
    }
    if (formData.entryFeeValue < 0) {
      alert("Entry fee cannot be negative");
      return;
    }
    if (
      formData.location.lat === null ||
      formData.location.lng === null
    ) {
      alert("Please select a destination location on the map");
      return;
    }
    if (isResolvingAddress) {
      alert("Address is still resolving. Please wait a moment and try again.");
      return;
    }

    try {
      const trimOptional = (value: string) => {
        const trimmed = value.trim();
        return trimmed ? trimmed : undefined;
      };

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: selectedCategories,
        categories: selectedCategories,
        features: featuresByCategory,
        estimatedCost: formData.entryFeeValue,
        lat: Number(formData.location.lat),
        lng: Number(formData.location.lng),
        latitude: Number(formData.location.lat),
        longitude: Number(formData.location.lng),
        images,
        location: {
          lat: Number(formData.location.lat),
          lng: Number(formData.location.lng),
          latitude: Number(formData.location.lat),
          longitude: Number(formData.location.lng),
        },
        address: {
          purok: trimOptional(formData.address.purok),
          barangay: trimOptional(formData.address.barangay),
          municipality: trimOptional(formData.address.municipality),
          province: trimOptional(formData.address.province),
          fullAddress: trimOptional(formData.address.fullAddress),
        },
      };

      await createDestination(payload);

      resetForm();
      onClose();
    } catch (error) {
      console.error("Create destination failed:", error);
      alert("Failed to create destination");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add New Destination
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new tourism destination
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Entry Fee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.entryFeeValue ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  entryFeeValue:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Click on the map to pin the destination location or search for a location by name.
            </p>
            
            {/* Search Input */}
            <div className="relative mb-3" ref={searchDropdownRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchLocation(e.target.value);
                }}
                onFocus={() => setShowSearchResults(searchResults.length > 0)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearchResults(false);
                  }
                }}
                placeholder="Search for a location..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                </div>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onMouseDown={() => handleSearchResultSelect(result)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm text-gray-900">{result.place_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <LocationMap
              interactive
              value={
                formData.location.lat !== null &&
                formData.location.lng !== null
                  ? {
                      latitude: formData.location.lat,
                      longitude: formData.location.lng,
                    }
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
                  value={formData.location.lat ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        lat: e.target.value === "" ? null : Number(e.target.value),
                      },
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
                  value={formData.location.lng ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        lng: e.target.value === "" ? null : Number(e.target.value),
                      },
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
                  value={formData.address.purok}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, purok: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  value={formData.address.barangay}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, barangay: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Municipality
                </label>
                <input
                  type="text"
                  value={formData.address.municipality}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, municipality: e.target.value },
                    }))
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
                  value={formData.address.province}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, province: e.target.value },
                    }))
                  }
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
                value={formData.address.fullAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, fullAddress: e.target.value },
                  }))
                }
                placeholder={isResolvingAddress ? "Resolving address..." : ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
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
                <div key={index} className="relative">
                  <img
                    src={img.url}
                    alt={`Destination image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Main Category
              </label>
              <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleMainCategoryChange(category)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left ${
                      formData.activeCategory === category
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-xs text-gray-500">
                        {(formData.selectedFeaturesByCategory[category] ?? []).length}
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
                {(taxonomy[formData.activeCategory] ?? []).length === 0 ? (
                  <p className="text-sm text-red-700">
                    This category has no sub-categories yet. Add at least one in Taxonomy Manager.
                  </p>
                ) : (
                  (taxonomy[formData.activeCategory] ?? []).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubCategoryChange(sub)}
                      className={`w-full p-2.5 rounded-lg border-2 text-left ${
                        (formData.selectedFeaturesByCategory[formData.activeCategory] ?? []).includes(sub)
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200"
                      }`}
                    >
                      {sub}
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
              Selected Categories and Features
            </p>
            <div className="space-y-2">
              {Object.entries(formData.selectedFeaturesByCategory).length === 0 ? (
                <p className="text-sm text-gray-700">No features selected</p>
              ) : (
                Object.entries(formData.selectedFeaturesByCategory).map(
                  ([category, features]) => (
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
                      <p className="text-sm mt-1">{"->"} {features.join(", ")}</p>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Save className="size-4" />
            Create Destination
          </button>
        </div>
      </div>
    </div>
  );
}
