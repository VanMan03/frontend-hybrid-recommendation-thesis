import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Tag, Info } from 'lucide-react';
import { getCategoryColor, type MainCategory, type SubCategory } from '@/app/data/tourismCategories';
import { CategoryDropdown } from '@/app/components/CategoryDropdown';
import { EditCategoryModal } from '@/app/components/EditCategoryModal';
import { AddDestinationModal } from '@/app/components/AddDestinationModal';
import { useAdminData } from '@/app/context/AdminDataContext';

type Destination = {
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
};


export function Destinations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const { destinations, addDestination, updateDestinationCategory, removeDestination } = useAdminData();
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== 'All Categories') {
      matchesCategory = 
        dest.mainCategory === selectedCategory || 
        dest.subCategory === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleCategorySave = (destinationId: number, mainCategory: MainCategory, subCategory: SubCategory) => {
    updateDestinationCategory(destinationId, mainCategory, subCategory);
  };

  const handleAddDestination = (newDestination: {
    name: string;
    description: string;
    mainCategory: MainCategory;
    subCategory: SubCategory;
  }) => {
    addDestination(newDestination);
    setIsAddModalOpen(false);
  };

  const getAccessibilityColor = (accessibility: string) => {
    if (accessibility === 'Easy Access') return 'bg-green-100 text-green-700';
    if (accessibility === 'Moderate') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getMostPopularCategory = () => {
    if (destinations.length === 0) return null;
    const categoryCount: Record<string, number> = {};

    destinations.forEach(dest => {
      categoryCount[dest.mainCategory] = (categoryCount[dest.mainCategory] || 0) + 1;
    });

    const mostPopular = Object.entries(categoryCount).reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );

    return { category: mostPopular[0], count: mostPopular[1] };
  };

  const getUniqueCategoriesCount = () => {
    return new Set(destinations.map(d => d.mainCategory)).size;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destination Management</h1>
          <p className="text-gray-600 mt-1">Manage destinations based on DOT Tourism Product Portfolios</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
          <Plus className="size-5" />
          Add Destination
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">DOT Tourism Product Portfolio Classification</p>
          <p className="text-sm text-blue-700 mt-1">
            All destinations are categorized according to the nine official Tourism Product Portfolios 
            as defined by the Department of Tourism (DOT) of the Philippines.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Search */}
          <div className="col-span-8">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Search Destinations
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by destination name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-span-4">
            <CategoryDropdown
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              label="Filter by Tourism Category"
            />
          </div>
        </div>

        {/* Active Filter Display */}
        {selectedCategory !== 'All Categories' && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Active Filter:</span>
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium flex items-center gap-2">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All Categories')}
                className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
              >
                <span className="sr-only">Clear filter</span>
                ×
              </button>
            </span>
            <span className="text-xs text-gray-600">
              ({filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'} found)
            </span>
          </div>
        )}
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destination</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">DOT Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Entry Fee</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Duration</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Accessibility</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDestinations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="size-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No destinations found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={dest.image} 
                          alt={dest.name} 
                          className="w-14 h-14 rounded-lg object-cover ring-2 ring-gray-100" 
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{dest.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{dest.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dest.mainCategory)}`}>
                          {dest.mainCategory}
                        </span>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="text-gray-400">→</span>
                          {dest.subCategory}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{dest.entryFee}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{dest.duration}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccessibilityColor(dest.accessibility)}`}>
                        {dest.accessibility}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dest.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {dest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group" 
                          title="View Details"
                        >
                          <Eye className="size-4 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <button 
                          onClick={() => setEditingDestination(dest)}
                          className="p-2 hover:bg-teal-50 rounded-lg transition-colors group" 
                          title="Edit Category"
                        >
                          <Tag className="size-4 text-gray-600 group-hover:text-teal-600" />
                        </button>
                        <button 
                          className="p-2 hover:bg-amber-50 rounded-lg transition-colors group" 
                          title="Edit Destination"
                        >
                          <Edit className="size-4 text-gray-600 group-hover:text-amber-600" />
                        </button>
                        <button 
                          onClick={() => removeDestination(dest.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group" 
                          title="Delete"
                        >
                          <Trash2 className="size-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredDestinations.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredDestinations.length}</span> of{' '}
              <span className="font-semibold">{destinations.length}</span> destinations
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Most Popular Category</p>
          <p className="text-lg font-bold text-teal-600">{getMostPopularCategory()?.category || '0'}</p>
          <p className="text-xs text-gray-500 mt-1">{getMostPopularCategory()?.count || 0} destinations</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Categories Used</p>
          <p className="text-lg font-bold text-gray-900">{getUniqueCategoriesCount()} of 9</p>
          <p className="text-xs text-gray-500 mt-1">DOT portfolios covered</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Active Destinations</p>
          <p className="text-lg font-bold text-green-600">{destinations.filter(d => d.status === 'Active').length}</p>
          <p className="text-xs text-gray-500 mt-1">Ready for itineraries</p>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingDestination && (
        <EditCategoryModal
          isOpen={!!editingDestination}
          onClose={() => setEditingDestination(null)}
          destination={editingDestination}
          onSave={handleCategorySave}
        />
      )}

      {/* Add Destination Modal */}
      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDestination}
      />
    </div>
  );
}
