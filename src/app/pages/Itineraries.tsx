import { useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useAdminData } from '@/app/context/AdminDataContext';

export function Itineraries() {
  const { itineraries } = useAdminData();
  const [selectedItinerary, setSelectedItinerary] = useState<number | null>(null);

  const selected = itineraries.find(it => it.id === selectedItinerary) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Itinerary Monitoring</h1>
        <p className="text-gray-600 mt-1">Track and manage generated travel itineraries</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search itineraries..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Itineraries Table */}
        <div className={`${selected ? 'col-span-2' : 'col-span-3'} bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Budget Range</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destinations</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itineraries.map((itinerary) => (
                <tr key={itinerary.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{itinerary.id}</td>
                  <td className="px-6 py-4 text-gray-900">{itinerary.user}</td>
                  <td className="px-6 py-4 text-gray-900 text-sm">{itinerary.budgetRange}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{itinerary.destinations}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{itinerary.dateGenerated}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      itinerary.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      itinerary.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {itinerary.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedItinerary(itinerary.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="size-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side Panel - Itinerary Details */}
        {selected && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Itinerary Details</h3>
              <button 
                onClick={() => setSelectedItinerary(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Itinerary ID</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selected.id}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">User</label>
                <p className="mt-1 text-sm text-gray-900">{selected.user}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Budget Range</label>
                <p className="mt-1 text-sm text-gray-900">{selected.budgetRange}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Included Destinations</label>
                <div className="mt-2 space-y-2">
                  {selected.destinations.split(', ').map((dest, idx) => (
                    <div key={idx} className="px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm">
                      {dest}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Date Generated</label>
                <p className="mt-1 text-sm text-gray-900">{selected.dateGenerated}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                <p className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selected.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    selected.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selected.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
