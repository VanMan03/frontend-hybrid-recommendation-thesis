import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { tourismCategories, getCategoryColor, type MainCategory, type SubCategory } from '@/app/data/tourismCategories';

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destination: {
    name: string;
    description: string;
    mainCategory: MainCategory;
    subCategory: SubCategory;
  }) => void;
}

export function AddDestinationModal({ isOpen, onClose, onSave }: AddDestinationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mainCategory: 'Nature Tourism' as MainCategory,
    subCategory: tourismCategories['Nature Tourism'][0] as SubCategory,
  });

  if (!isOpen) return null;

  const handleMainCategoryChange = (category: MainCategory) => {
    setFormData({
      ...formData,
      mainCategory: category,
      subCategory: tourismCategories[category][0] as SubCategory,
    });
  };

  const handleSubCategoryChange = (subCategory: SubCategory) => {
    setFormData({
      ...formData,
      subCategory,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSave(formData);

    // Reset form
    setFormData({
      name: '',
      description: '',
      mainCategory: 'Nature Tourism' as MainCategory,
      subCategory: tourismCategories['Nature Tourism'][0] as SubCategory,
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      mainCategory: 'Nature Tourism' as MainCategory,
      subCategory: tourismCategories['Nature Tourism'][0] as SubCategory,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Destination</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new tourism destination with specifications</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter destination name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter a detailed description of the destination"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-2 gap-6">
            {/* Main Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tourism Product Portfolio (Main Category) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {Object.keys(tourismCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleMainCategoryChange(category as MainCategory)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left transition-all text-sm ${
                      formData.mainCategory === category
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className={`font-medium ${
                      formData.mainCategory === category ? 'text-teal-900' : 'text-gray-900'
                    }`}>
                      {category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Specific Category Type <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {tourismCategories[formData.mainCategory].map((subCat) => (
                  <button
                    key={subCat}
                    onClick={() => handleSubCategoryChange(subCat as SubCategory)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left transition-all text-sm ${
                      formData.subCategory === subCat
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className={`${
                      formData.subCategory === subCat ? 'text-teal-900 font-medium' : 'text-gray-700'
                    }`}>
                      {subCat}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Preview */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-teal-900 uppercase mb-2">Selected Category</p>
            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(formData.mainCategory)}`}>
                {formData.mainCategory}
              </span>
              <p className="text-sm text-teal-900">→ {formData.subCategory}</p>
            </div>
          </div>


        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Save className="size-4" />
            Create Destination
          </button>
        </div>
      </div>
    </div>
  );
}
