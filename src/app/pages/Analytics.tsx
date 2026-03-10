import { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAdminData, type Destination } from '@/app/context/AdminDataContext';

type PopularDestination = { name: string; visits: number };
type LeastVisited = { name: string; visits: number };
type TourismTrend = { month: string; beach?: number; cultural?: number; nature?: number; adventure?: number };

type CategoryKey = 'beach' | 'cultural' | 'nature' | 'adventure';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  beach: 'Beach',
  cultural: 'Cultural',
  nature: 'Nature',
  adventure: 'Adventure',
};

export function Analytics() {
  const { destinations, itineraries, fetchDestinations, fetchItineraries, loading, error } = useAdminData();

  useEffect(() => {
    fetchDestinations();
    fetchItineraries();
  }, []);

  const normalizeId = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'object') {
      if (val.$oid) return String(val.$oid).trim();
      if (val._id) return String(val._id).trim();
      if (val.id) return String(val.id).trim();
    }
    return String(val).trim();
  };

  const destinationIndex = useMemo(() => {
    const byId = new Map<string, Destination>();
    const byName = new Map<string, Destination>();

    destinations.forEach((dest) => {
      const id = normalizeId(dest._id || (dest as any).id);
      if (id) byId.set(id, dest);
      if (dest.name) byName.set(dest.name.toLowerCase(), dest);
    });

    return { byId, byName };
  }, [destinations]);

  const extractDestinationItems = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') {
      return (
        value.destinations ||
        value.destinationIds ||
        value.destination_ids ||
        value.destinationNames ||
        value.places ||
        []
      );
    }
    return [value];
  };

  const flattenDestinations = (items: any[]): any[] => {
    return items.flatMap((item) => {
      if (!item) return [];
      if (Array.isArray(item)) return flattenDestinations(item);
      if (typeof item === 'object') {
        if (
          item.destinations ||
          item.destinationIds ||
          item.destination_ids ||
          item.destinationNames ||
          item.places
        ) {
          return flattenDestinations(extractDestinationItems(item));
        }
        if (item.destination || item.destinationId || item.destination_id || item.place) {
          return [item.destination ?? item.destinationId ?? item.destination_id ?? item.place ?? item];
        }
      }
      return [item];
    });
  };

  const resolveDestinationKey = (value: any): { key: string; name: string } | null => {
    if (!value) return null;

    if (typeof value === 'object') {
      if (value.name) {
        return { key: `name:${String(value.name).toLowerCase()}`, name: String(value.name) };
      }
      if (value.destination?.name) {
        return { key: `name:${String(value.destination.name).toLowerCase()}`, name: String(value.destination.name) };
      }
      if (value.place?.name) {
        return { key: `name:${String(value.place.name).toLowerCase()}`, name: String(value.place.name) };
      }
      const id = normalizeId(value._id || value.id || value.destinationId || value.destination_id);
      if (id) {
        const dest = destinationIndex.byId.get(id);
        return { key: id, name: dest?.name || id };
      }
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      const id = normalizeId(text);
      if (destinationIndex.byId.has(id)) {
        const dest = destinationIndex.byId.get(id)!;
        return { key: id, name: dest.name };
      }
      const byName = destinationIndex.byName.get(text.toLowerCase());
      if (byName) {
        const idFromName = normalizeId(byName._id || (byName as any).id);
        return { key: idFromName || `name:${text.toLowerCase()}`, name: byName.name };
      }
      return { key: `name:${text.toLowerCase()}`, name: text };
    }

    return null;
  };

  const getItineraryDestinations = (itinerary: any): { key: string; name: string }[] => {
    const raw =
      itinerary?.destinations ||
      itinerary?.destinationIds ||
      itinerary?.destination_ids ||
      itinerary?.destinationNames ||
      itinerary?.places ||
      itinerary?.itinerary ||
      itinerary?.plan ||
      itinerary?.schedule ||
      [];
    const items = flattenDestinations(extractDestinationItems(raw));
    return items
      .map((item) => resolveDestinationKey(item))
      .filter((value): value is { key: string; name: string } => Boolean(value));
  };

  const getDateValue = (itinerary: any): Date | null => {
    const value = itinerary?.dateGenerated || itinerary?.createdAt || itinerary?.updatedAt;
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getDurationDays = (itinerary: any): number | null => {
    const direct =
      itinerary?.durationDays ??
      itinerary?.duration ??
      itinerary?.tripDuration ??
      itinerary?.totalDays ??
      itinerary?.numberOfDays ??
      itinerary?.days ??
      itinerary?.lengthOfStay ??
      itinerary?.tripLength ??
      itinerary?.itineraryDays;

    if (typeof direct === 'number' && Number.isFinite(direct)) return direct;
    if (Array.isArray(direct)) return direct.length;
    if (typeof direct === 'object' && Array.isArray(direct?.days)) return direct.days.length;
    if (Array.isArray(itinerary?.days)) return itinerary.days.length;
    if (Array.isArray(itinerary?.plan)) return itinerary.plan.length;
    if (Array.isArray(itinerary?.schedule)) return itinerary.schedule.length;
    if (Array.isArray(itinerary?.itinerary)) return itinerary.itinerary.length;
    return null;
  };

  const categorize = (category: string): CategoryKey | null => {
    const normalized = category.toLowerCase();
    if (normalized.includes('beach')) return 'beach';
    if (normalized.includes('cultural') || normalized.includes('heritage')) return 'cultural';
    if (normalized.includes('nature')) return 'nature';
    if (normalized.includes('adventure')) return 'adventure';
    return null;
  };

  const popularDestinationsData = useMemo<PopularDestination[]>(() => {
    const counts = new Map<string, { name: string; count: number }>();

    destinations.forEach((dest) => {
      const id = normalizeId(dest._id || (dest as any).id);
      if (!id) return;
      counts.set(id, { name: dest.name, count: 0 });
    });

    itineraries.forEach((itinerary) => {
      const dests = getItineraryDestinations(itinerary);
      dests.forEach((dest) => {
        const existing = counts.get(dest.key) ?? { name: dest.name, count: 0 };
        counts.set(dest.key, { name: existing.name || dest.name, count: existing.count + 1 });
      });
    });

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((item) => ({ name: item.name, visits: item.count }));
  }, [destinations, itineraries, destinationIndex]);

  const leastVisitedData = useMemo<LeastVisited[]>(() => {
    const counts = new Map<string, { name: string; count: number }>();

    destinations.forEach((dest) => {
      const id = normalizeId(dest._id || (dest as any).id);
      if (!id) return;
      counts.set(id, { name: dest.name, count: 0 });
    });

    itineraries.forEach((itinerary) => {
      const dests = getItineraryDestinations(itinerary);
      dests.forEach((dest) => {
        const existing = counts.get(dest.key) ?? { name: dest.name, count: 0 };
        counts.set(dest.key, { name: existing.name || dest.name, count: existing.count + 1 });
      });
    });

    return Array.from(counts.values())
      .sort((a, b) => a.count - b.count)
      .slice(0, 6)
      .map((item) => ({ name: item.name, visits: item.count }));
  }, [destinations, itineraries, destinationIndex]);

  const tourismTrendsData = useMemo<TourismTrend[]>(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString(undefined, { month: 'short' });
      months.push({ key, label });
    }

    const monthIndex = new Map(months.map((month) => [month.key, month.label]));
    const baseCounts = new Map<string, Record<CategoryKey, number>>();

    months.forEach((month) => {
      baseCounts.set(month.key, {
        beach: 0,
        cultural: 0,
        nature: 0,
        adventure: 0,
      });
    });

    itineraries.forEach((itinerary) => {
      const date = getDateValue(itinerary);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!baseCounts.has(key)) return;

      const categories: CategoryKey[] = [];
      const dests = getItineraryDestinations(itinerary);
      dests.forEach((dest) => {
        const destination =
          destinationIndex.byId.get(dest.key) ??
          destinationIndex.byName.get(dest.name.toLowerCase());

        const categoryValues = Array.isArray(destination?.category)
          ? destination?.category
          : destination?.category
            ? [destination.category]
            : [];

        categoryValues
          .map((value) => String(value))
          .forEach((value) => {
            const mapped = categorize(value);
            if (mapped) categories.push(mapped);
          });
      });

      const counts = baseCounts.get(key)!;
      categories.forEach((category) => {
        counts[category] += 1;
      });
    });

    return months.map((month) => {
      const counts = baseCounts.get(month.key)!;
      return {
        month: monthIndex.get(month.key) ?? month.label,
        beach: counts.beach,
        cultural: counts.cultural,
        nature: counts.nature,
        adventure: counts.adventure,
      };
    });
  }, [itineraries, destinationIndex]);

  const mostPopularCategory = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      beach: 0,
      cultural: 0,
      nature: 0,
      adventure: 0,
    };

    tourismTrendsData.forEach((row) => {
      (Object.keys(counts) as CategoryKey[]).forEach((key) => {
        counts[key] += row[key] ?? 0;
      });
    });

    const sorted = (Object.keys(counts) as CategoryKey[])
      .map((key) => ({ key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);

    const top = sorted[0];
    if (!top || top.value === 0) return 'N/A';
    return `${CATEGORY_LABELS[top.key]} (${top.value})`;
  }, [tourismTrendsData]);

  const averageTripDuration = useMemo(() => {
    const durations = itineraries
      .map((itinerary) => getDurationDays(itinerary))
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (durations.length === 0) return 'N/A';
    const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;
    return `${avg.toFixed(1)} days`;
  }, [itineraries]);

  const peakSeason = useMemo(() => {
    const counts = new Map<number, number>();
    itineraries.forEach((itinerary) => {
      const date = getDateValue(itinerary);
      if (!date) return;
      const month = date.getMonth();
      counts.set(month, (counts.get(month) ?? 0) + 1);
    });

    if (counts.size === 0) return 'None';
    const [bestMonth] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    const labelDate = new Date(2020, bestMonth, 1);
    return labelDate.toLocaleString(undefined, { month: 'long' });
  }, [itineraries]);

  const userSatisfaction = useMemo(() => {
    const ratings = itineraries
      .map((itinerary: any) => itinerary?.rating ?? itinerary?.userRating ?? itinerary?.averageRating ?? itinerary?.feedback?.rating)
      .filter((value: any) => typeof value === 'number' && Number.isFinite(value));
    if (ratings.length === 0) return 'N/A';
    const avg = ratings.reduce((sum: number, value: number) => sum + value, 0) / ratings.length;
    return avg.toFixed(1);
  }, [itineraries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Visual insights into tourism trends and destination popularity</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Popular Destinations Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Most Popular Destinations</h2>
        {popularDestinationsData.length === 0 ? (
          <div className="h-[300px] grid place-items-center text-sm text-gray-500">
            {loading ? 'Loading popular destinations...' : 'No destination visit data available.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularDestinationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Least Visited Destinations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Least Visited Destinations</h2>
          {leastVisitedData.length === 0 ? (
            <div className="text-sm text-gray-500">
              {loading ? 'Loading destinations...' : 'No destination visit data available.'}
            </div>
          ) : (
            <div className="space-y-3">
              {leastVisitedData.map((dest, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{dest.name}</span>
                  <span className="text-sm text-gray-600">{dest.visits} visits</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-l-4 border-teal-600 bg-teal-50 rounded">
              <span className="text-sm font-medium text-gray-700">Most Popular Category</span>
              <span className="font-bold text-teal-700">{mostPopularCategory}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
              <span className="text-sm font-medium text-gray-700">Average Trip Duration</span>
              <span className="font-bold text-blue-700">{averageTripDuration}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-purple-600 bg-purple-50 rounded">
              <span className="text-sm font-medium text-gray-700">Peak Season</span>
              <span className="font-bold text-purple-700">{peakSeason}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-600 bg-green-50 rounded">
              <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
              <span className="font-bold text-green-700">{userSatisfaction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tourism Preference Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tourism Preference Trends (Last 7 Months)</h2>
        {tourismTrendsData.length === 0 ? (
          <div className="h-[350px] grid place-items-center text-sm text-gray-500">
            {loading ? 'Loading trend data...' : 'No trend data available.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={tourismTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="beach" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="cultural" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="nature" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="adventure" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
