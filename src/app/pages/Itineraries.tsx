import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useAdminData } from '@/app/context/AdminDataContext';

export function Itineraries() {
  const { itineraries, destinations, fetchItineraries, fetchDestinations, loading, error } = useAdminData();
  const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);
  const [expandedDestinationsId, setExpandedDestinationsId] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
    fetchItineraries();
  }, []);

  const destinationNameById = useMemo(() => {
  const lookup = new Map<string, string>();

  const normalizeId = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'object') {
      if (val.$oid) return val.$oid;
      if (val._id) return String(val._id);
      if (val.id) return String(val.id);
    }
    return String(val);
  };

  destinations.forEach((d: any) => {
    const id = normalizeId(d._id || d.id);
    if (id && d.name) {
      lookup.set(id, d.name);
    }
  });

  return lookup;
}, [destinations]);


  const mappedItineraries = useMemo(
    () =>
      itineraries.map((itinerary: any, index: number) => {
        const id = String(itinerary?.id || itinerary?._id || `itinerary-${index + 1}`);
        const user =
          itinerary?.user?.name ||
          itinerary?.user?.fullName ||
          itinerary?.user?.email ||
          itinerary?.userName ||
          itinerary?.user ||
          'Unknown User';
        const budgetRange = itinerary?.budgetRange || itinerary?.budget || itinerary?.budgetTier || 'N/A';
        const rawDestinations =
          itinerary?.destinations ||
          itinerary?.destinationIds ||
          itinerary?.destination_ids ||
          itinerary?.destinationNames ||
          itinerary?.places ||
          [];

        const isObjectId = (value: string) => /^[a-f0-9]{24}$/i.test(value);
        const toId = (value: any): string => {
          if (!value) return '';
          if (typeof value === 'string') return value.trim();
          if (typeof value === 'object') {
            if (typeof value.$oid === 'string') return value.$oid.trim();
            if (typeof value._id === 'string') return value._id.trim();
            if (typeof value.id === 'string') return value.id.trim();
            if (typeof value.destinationId === 'string') return value.destinationId.trim();
            if (typeof value.destination_id === 'string') return value.destination_id.trim();
            if (value.destination) return toId(value.destination);
          }
          return String(value).trim();
        };

        const resolveDestinationName = (value: any): string => {
  if (!value) return '';

  // ✅ CASE 1: Full destination object
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.destination?.name) return value.destination.name;
    if (value.place?.name) return value.place.name;
  }

  // ✅ CASE 2: ID string
  const id = typeof value === 'string' ? value.trim() : String(value);
  return destinationNameById.get(id) || '';
};



       const destinationList = Array.isArray(rawDestinations)
  ? rawDestinations
      .map((d: any) => resolveDestinationName(d))
      .filter(name => typeof name === 'string' && name.length > 0)
      .join(', ')
  : resolveDestinationName(rawDestinations);

        const dateValue = itinerary?.dateGenerated || itinerary?.createdAt || itinerary?.updatedAt;
        const parsedDate = dateValue ? new Date(dateValue) : null;
        const dateGenerated =
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString()
            : dateValue
              ? String(dateValue)
              : 'N/A';

        return {
          id,
          user,
          budgetRange,
          destinations: destinationList || 'N/A',
          dateGenerated,
        };
      }),
    [itineraries, destinationNameById]
  );

  const selected = mappedItineraries.find((itinerary) => itinerary.id === selectedItinerary) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Itinerary Monitoring</h1>
        <p className="text-gray-600 mt-1">Track and manage generated travel itineraries</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
        <div className={`${selected ? 'col-span-2' : 'col-span-3'} bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-visible`}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Budget Range</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destinations</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading && mappedItineraries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No itineraries found.
                  </td>
                </tr>
              )}
              {mappedItineraries.map((itinerary) => (
                <tr key={itinerary.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{itinerary.id}</td>
                  <td className="px-6 py-4 text-gray-900">{itinerary.user}</td>
                  <td className="px-6 py-4 text-gray-900 text-sm">{itinerary.budgetRange}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm w-64 max-w-64">
                    {(() => {
                      const destinationItems = String(itinerary.destinations || '')
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean);
                      const visible = destinationItems.slice(0, 2);
                      const remainingCount = Math.max(destinationItems.length - visible.length, 0);
                      const isExpanded = expandedDestinationsId === itinerary.id;

                      return (
                        <div className="relative min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="block max-w-[12rem] truncate">{visible.join(', ') || 'N/A'}</span>
                            {remainingCount > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedDestinationsId(isExpanded ? null : String(itinerary.id))
                                }
                                className="text-teal-600 text-xs whitespace-nowrap hover:text-teal-700"
                              >
                                +{remainingCount} more
                              </button>
                            )}
                          </div>
                          {remainingCount > 0 && (
                            <div
                              className={`absolute left-0 top-full mt-1 z-20 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-2 ${
                                isExpanded ? 'block' : 'hidden'
                              }`}
                            >
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {destinationItems.map((destinationName, idx) => (
                                  <div key={`${itinerary.id}-${idx}`} className="text-xs text-gray-700 px-2 py-1 rounded bg-gray-50">
                                    {destinationName}
                                  </div>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedDestinationsId(null)}
                                className="mt-2 text-[11px] text-teal-600 hover:text-teal-700"
                              >
                                Show less
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{itinerary.dateGenerated}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedItinerary(String(itinerary.id))}
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
                  {selected.destinations
                    .split(', ')
                    .filter(Boolean)
                    .map((dest, idx) => (
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
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
