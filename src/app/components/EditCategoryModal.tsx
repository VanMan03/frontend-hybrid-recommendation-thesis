import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { tourismCategories, getCategoryColor, type MainCategory, type SubCategory } from '@/app/data/tourismCategories';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    id: number;
    name: string;
    mainCategory: MainCategory;
    subCategory: SubCategory;
  };
  onSave: (destinationId: number, mainCategory: MainCategory, subCategory: SubCategory) => void;
}

export function EditCategoryModal({ isOpen, onClose, destination, onSave }: EditCategoryModalProps) {
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>(destination.mainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory>(destination.subCategory);

  if (!isOpen) return null;

  const handleMainCategoryChange = (category: MainCategory) => {
    setSelectedMainCategory(category);
    // Auto-select first subcategory when main category changes
    setSelectedSubCategory(tourismCategories[category][0] as SubCategory);
  };

  const handleSave = () => {
    onSave(destination.id, selectedMainCategory, selectedSubCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Tourism Category</h2>
            <p className="text-sm text-gray-600 mt-1">{destination.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current Category Display */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Current Category</p>
            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(destination.mainCategory)}`}>
                {destination.mainCategory}
              </span>
              <p className="text-sm text-gray-700">→ {destination.subCategory}</p>
            </div>
          </div>

          {/* Main Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tourism Product Portfolio (Main Category)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(tourismCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => handleMainCategoryChange(category as MainCategory)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedMainCategory === category
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    selectedMainCategory === category ? 'text-teal-900' : 'text-gray-900'
                  }`}>
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Specific Category Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tourismCategories[selectedMainCategory].map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => setSelectedSubCategory(subCat as SubCategory)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedSubCategory === subCat
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className={`text-sm ${
                    selectedSubCategory === subCat ? 'text-teal-900 font-medium' : 'text-gray-700'
                  }`}>
                    {subCat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-teal-900 uppercase mb-2">New Category Preview</p>
            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedMainCategory)}`}>
                {selectedMainCategory}
              </span>
              <p className="text-sm text-teal-900">→ {selectedSubCategory}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Save className="size-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
