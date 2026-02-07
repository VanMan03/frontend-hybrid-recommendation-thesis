import { Users, MapPin, Route, CheckCircle, Activity, Clock } from 'lucide-react';
import { useAdminData } from '@/app/context/AdminDataContext';

export const mostRecommendedDestinations: any[] = [];

export const recentActivity: any[] = [];

export function Dashboard() {
  const { destinations } = useAdminData();

const stats = [
  {
    label: 'Total Destinations',
    value: destinations?.length ?? 0,
    icon: MapPin,
    color: 'bg-teal-500',
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
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Most Recommended Destinations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Most Recommended Destinations</h2>
        <div className="grid grid-cols-4 gap-4">
          {mostRecommendedDestinations.map((dest) => (
            <div key={dest.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-3">
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                />
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
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user || activity.admin} <span className="text-gray-600">{activity.action}</span>
                </p>
                <p className="text-xs text-teal-600">{activity.destination}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="size-3" />
                {activity.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
