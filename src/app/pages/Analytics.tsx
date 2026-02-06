import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

type PopularDestination = { name: string; visits: number };
type LeastVisited = { name: string; visits: number };
type TourismTrend = { month: string; beach?: number; cultural?: number; nature?: number; adventure?: number };

const popularDestinationsData: PopularDestination[] = [];
const leastVisitedData: LeastVisited[] = [];
const tourismTrendsData: TourismTrend[] = [];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Visual insights into tourism trends and destination popularity</p>
      </div>

      {/* Popular Destinations Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Most Popular Destinations</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={popularDestinationsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="visits" fill="#14b8a6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Least Visited Destinations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Least Visited Destinations</h2>
          <div className="space-y-3">
            {leastVisitedData.map((dest, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{dest.name}</span>
                <span className="text-sm text-gray-600">{dest.visits} visits</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-l-4 border-teal-600 bg-teal-50 rounded">
              <span className="text-sm font-medium text-gray-700">Most Popular Category</span>
              <span className="font-bold text-teal-700">0</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
              <span className="text-sm font-medium text-gray-700">Average Trip Duration</span>
              <span className="font-bold text-blue-700">0</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-purple-600 bg-purple-50 rounded">
              <span className="text-sm font-medium text-gray-700">Peak Season</span>
              <span className="font-bold text-purple-700">None</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-600 bg-green-50 rounded">
              <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
              <span className="font-bold text-green-700">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tourism Preference Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tourism Preference Trends (Last 7 Months)</h2>
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
      </div>
    </div>
  );
}
