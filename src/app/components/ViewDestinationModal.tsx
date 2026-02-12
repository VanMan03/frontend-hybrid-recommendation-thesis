import { X } from 'lucide-react';
import { type Destination } from '@/app/context/AdminDataContext';
import { LocationMap } from "@/app/components/LocationMap";

interface ViewDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
}

export function ViewDestinationModal({ isOpen, onClose, destination }: ViewDestinationModalProps) {
  if (!isOpen || !destination) return null;

  const destinationImage = destination.images?.[0]?.url ?? destination.image?.[0]?.url;
  const featuresText = Array.isArray(destination.features)
    ? destination.features.join(', ')
    : Object.entries(destination.features ?? {})
        .filter(([, value]) => value > 0)
        .map(([feature]) => feature)
        .join(', ');
  const destinationLocation = destination.location
    ? {
        latitude: destination.location.latitude,
        longitude: destination.location.longitude,
      }
    : null;

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

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
                  {destination.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Features:</span>
                <span className="text-sm text-gray-700">
                  {featuresText || 'No features'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Entry Fee */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Entry Fee</p>
              <p className="text-xl font-bold text-blue-600">PHP {destination.estimatedCost}</p>
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
                    {destination.location?.latitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Longitude:</span>{" "}
                    {destination.location?.longitude.toFixed(6)}
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Address:</span>{" "}
                  {destination.location?.resolvedAddress || "Not available"}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No location saved for this destination.</p>
            )}
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
