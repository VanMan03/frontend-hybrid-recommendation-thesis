import { X } from 'lucide-react';
import { getCategoryColor, type MainCategory, type SubCategory } from '@/app/data/tourismCategories';

interface ViewDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    id: number;
    name: string;
    description: string;
    mainCategory: MainCategory;
    subCategory: SubCategory;
    image: string;
    status: string;
    entryFee: string;
    duration: string;
    accessibility: string;
  } | null;
}

export function ViewDestinationModal({ isOpen, onClose, destination }: ViewDestinationModalProps) {
  if (!isOpen || !destination) return null;

  const getAccessibilityColor = (accessibility: string) => {
    if (accessibility === 'Easy Access') return 'bg-green-100 text-green-700';
    if (accessibility === 'Moderate') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={destination.image} 
            alt={destination.name}
            className="w-full h-full object-cover"
          />
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

          {/* Categories */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Tourism Categories</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Main Category:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(destination.mainCategory)}`}>
                  {destination.mainCategory}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Sub Category:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {destination.subCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Entry Fee */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Entry Fee</p>
              <p className="text-xl font-bold text-blue-600">{destination.entryFee}</p>
            </div>

            {/* Duration */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 uppercase mb-2">Duration</p>
              <p className="text-xl font-bold text-purple-600">{destination.duration}</p>
            </div>

            {/* Accessibility */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <p className="text-xs font-semibold text-teal-900 uppercase mb-2">Accessibility</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getAccessibilityColor(destination.accessibility)}`}>
                {destination.accessibility}
              </span>
            </div>

            {/* Status */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-900 uppercase mb-2">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(destination.status)}`}>
                {destination.status}
              </span>
            </div>
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
