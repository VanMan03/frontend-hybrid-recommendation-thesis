import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { tourismCategories } from '@/app/data/tourismCategories';

interface CategoryDropdownProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  label: string;
}

export function CategoryDropdown({ selectedCategory, onSelect, label }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
      >
        <span className={selectedCategory === 'All Categories' ? 'text-gray-500' : 'text-gray-900'}>
          {selectedCategory}
        </span>
        <ChevronDown className={`size-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {/* All Categories Option */}
          <button
            onClick={() => {
              onSelect('All Categories');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between text-sm transition-colors"
          >
            <span className="text-gray-700 font-medium">All Categories</span>
            {selectedCategory === 'All Categories' && (
              <Check className="size-4 text-teal-600" />
            )}
          </button>

          <div className="border-t border-gray-200"></div>

          {/* Main Categories */}
          {Object.entries(tourismCategories).map(([mainCat, subCats]) => (
            <div key={mainCat} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => {
                  onSelect(mainCat);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left hover:bg-teal-50 flex items-center justify-between text-sm font-semibold transition-colors ${
                  selectedCategory === mainCat ? 'bg-teal-50' : ''
                }`}
              >
                <span className="text-gray-900">{mainCat}</span>
                {selectedCategory === mainCat && (
                  <Check className="size-4 text-teal-600" />
                )}
              </button>

              {/* Sub Categories */}
              <div className="bg-gray-50">
                {subCats.map((subCat) => (
                  <button
                    key={subCat}
                    onClick={() => {
                      onSelect(subCat);
                      setIsOpen(false);
                    }}
                    className="w-full px-8 py-2 text-left hover:bg-gray-100 flex items-center justify-between text-sm transition-colors"
                  >
                    <span className="text-gray-700">{subCat}</span>
                    {selectedCategory === subCat && (
                      <Check className="size-4 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
