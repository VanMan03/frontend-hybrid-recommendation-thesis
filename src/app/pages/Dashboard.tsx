import { Users, MapPin, Route, CheckCircle, Activity, Clock } from 'lucide-react';
import { useAdminData, type Destination } from '@/app/context/AdminDataContext';
import { apiRequest } from '@/services/api';
import { useEffect, useMemo, useState } from 'react';

export function Dashboard() {
  const { destinations, users, itineraries, fetchUsers, fetchItineraries, fetchDestinations } = useAdminData();
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchItineraries();
    fetchDestinations();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      const endpoints = [
        '/admin/logs',
        '/logs',
        '/admin/system-logs',
        '/admin/activities',
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await apiRequest(endpoint);
          const list =
            response?.logs ??
            response?.data ??
            response?.results ??
            response?.activities ??
            response;
          if (Array.isArray(list)) {
            if (isMounted) setActivityLogs(list);
            return;
          }
        } catch {
          continue;
        }
      }

      if (isMounted) setActivityLogs([]);
    };

    void fetchLogs();

    return () => {
      isMounted = false;
    };
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

  const getDestinationImage = (dest?: Destination): string => {
    const images = dest?.images ?? dest?.image ?? [];
    const first = Array.isArray(images) ? images[0] : undefined;
    return first?.url || '';
  };

  const mostRecommendedDestinations = useMemo(() => {
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

    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 4)
      .map(([key, entry], index) => {
        const dest =
          destinationIndex.byId.get(key) ??
          destinationIndex.byName.get(entry.name.toLowerCase());
        const image = getDestinationImage(dest);
        const category = Array.isArray(dest?.category) ? dest?.category.join(', ') : dest?.category || 'Uncategorized';
        return {
          id: key || `dest-${index}`,
          name: entry.name,
          category,
          image,
          recommendations: entry.count,
        };
      });
  }, [destinations, itineraries, destinationIndex]);

const stats = [
  {
    label: 'Total Destinations',
    value: destinations?.length ?? 0,
    icon: MapPin,
    color: 'bg-teal-500',
  },
  {
    label: 'Total Users',
    value: users?.length ?? 0,
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    label: 'Total Itineraries',
    value: itineraries?.length ?? 0,
    icon: Route,
    color: 'bg-amber-500',
  },
  {
    label: 'System Status',
    value: 'Operational',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'itinerary': return <Route className="size-4" />;
      case 'destination': return <MapPin className="size-4" />;
      case 'user': return <Users className="size-4" />;
      case 'admin': return <Activity className="size-4" />;
      default: return <Activity className="size-4" />;
    }
  };

  const parseTimestamp = (value: unknown): number | null => {
    if (!value) return null;
    const parsed = new Date(String(value)).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  };

  const formatTimestamp = (value: number): string => {
    const date = new Date(value);
    return date.toLocaleString();
  };

  const recentActivity = useMemo(() => {
    const logItems = Array.isArray(activityLogs)
      ? activityLogs
          .map((entry: any, index: number) => {
            const timestamp =
              parseTimestamp(entry?.timestamp ?? entry?.createdAt ?? entry?.updatedAt ?? entry?.time);
            if (timestamp === null) return null;

            const actor = entry?.actor ?? entry?.user ?? entry?.admin ?? entry?.performedBy;
            const name =
              actor?.name ||
              actor?.fullName ||
              [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
              actor?.email ||
              entry?.userName ||
              entry?.adminName ||
              'System';

            const action =
              entry?.action ??
              entry?.event ??
              entry?.title ??
              entry?.message ??
              'System event';

            const destination =
              entry?.destination?.name ??
              entry?.destinationName ??
              entry?.placeName ??
              entry?.resourceName ??
              entry?.resource ??
              '';

            return {
              id: `log-${entry?._id ?? entry?.id ?? index}-${timestamp}`,
              type: entry?.type ?? 'log',
              user: name,
              action: String(action),
              destination: destination ? String(destination) : '',
              timestamp: formatTimestamp(timestamp),
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      : [];

    const userItems = Array.isArray(users)
      ? users
          .map((user: any, index: number) => {
            const timestamp = parseTimestamp(user?.createdAt ?? user?.joinDate);
            if (timestamp === null) return null;
            const name =
              user?.name ||
              user?.fullName ||
              [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
              user?.email ||
              'Unknown User';

            return {
              id: `user-${user?._id ?? user?.id ?? index}-${timestamp}`,
              type: 'user',
              user: name,
              action: 'registered a new account',
              destination: '',
              timestamp: formatTimestamp(timestamp),
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      : [];

    const itineraryItems = Array.isArray(itineraries)
      ? itineraries
          .map((itinerary: any, index: number) => {
            const timestamp = parseTimestamp(
              itinerary?.createdAt ??
                itinerary?.dateGenerated ??
                itinerary?.updatedAt
            );
            if (timestamp === null) return null;

            const name =
              itinerary?.user?.name ||
              itinerary?.user?.fullName ||
              itinerary?.user?.email ||
              itinerary?.userName ||
              itinerary?.user ||
              'A user';

            const destinations = getItineraryDestinations(itinerary)
              .map((dest) => dest.name)
              .filter(Boolean)
              .slice(0, 2)
              .join(', ');

            return {
              id: `itinerary-${itinerary?._id ?? itinerary?.id ?? index}-${timestamp}`,
              type: 'itinerary',
              user: String(name),
              action: 'generated a new itinerary',
              destination: destinations ? `for ${destinations}` : '',
              timestamp: formatTimestamp(timestamp),
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      : [];

    return [...logItems, ...userItems, ...itineraryItems]
      .sort((a, b) => {
        const timeA = parseTimestamp(a.timestamp) ?? 0;
        const timeB = parseTimestamp(b.timestamp) ?? 0;
        return timeB - timeA;
      })
      .slice(0, 10);
  }, [activityLogs, itineraries, users, destinationIndex]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to the Travel Itinerary Admin Dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="pr-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p
                  className={`font-bold text-gray-900 mt-2 leading-tight pr-2 ${
                    typeof stat.value === "string"
                      ? "text-2xl whitespace-nowrap"
                      : "text-3xl"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg shrink-0`}>
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Most Recommended Destinations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Most Recommended Destinations</h2>
        {mostRecommendedDestinations.length === 0 ? (
          <div className="h-40 grid place-items-center text-sm text-gray-500">
            No recommendation data available.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {mostRecommendedDestinations.map((dest) => (
              <div key={dest.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
                  {dest.image ? (
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-40 grid place-items-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-semibold text-sm">{dest.name}</p>
                    <p className="text-xs text-gray-200">{dest.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-gray-600">Recommendations</span>
                  <span className="text-sm font-bold text-teal-600">{dest.recommendations}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-sm text-gray-500">No recent activity yet.</div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user || activity.admin} <span className="text-gray-600">{activity.action}</span>
                  </p>
                  {activity.destination && (
                    <p className="text-xs text-teal-600">{activity.destination}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="size-3" />
                  {activity.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
