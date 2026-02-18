import { useEffect, useMemo } from 'react';
import { Edit, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAdminData } from '@/app/context/AdminDataContext';

type BudgetRange = {
  range: string;
  count: number;
  percentage: number;
};

type DestinationCost = {
  id: number;
  destination: string;
  entranceFee: number;
};

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'];

export function Budget() {
  const { destinations, itineraries, fetchDestinations, fetchItineraries, loading, error } = useAdminData();

  useEffect(() => {
    fetchDestinations();
    fetchItineraries();
  }, []);

  const toNumber = (value: any): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const destinationCosts = useMemo<DestinationCost[]>(
    () =>
      destinations.map((destination: any, index: number) => {
        const entranceFee = Math.round(
          toNumber(
            destination?.entranceFee ??
              destination?.entrance_fee ??
              destination?.entranceFees ??
              destination?.estimatedCost
          )
        );

        return {
          id: index + 1,
          destination: destination?.name || `Destination ${index + 1}`,
          entranceFee,
        };
      }),
    [destinations]
  );

  const budgetRanges = useMemo<BudgetRange[]>(() => {
    const counts = itineraries.reduce((acc: Record<string, number>, itinerary: any) => {
      const key = String(itinerary?.budgetRange || itinerary?.budget || itinerary?.budgetTier || 'N/A');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (totalCount === 0) return [];

    return Object.entries(counts).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / totalCount) * 100),
    }));
  }, [itineraries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget & Cost Management</h1>
        <p className="text-gray-600 mt-1">Manage destination pricing and budget analytics</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Common Budget Ranges</h2>
          {budgetRanges.length === 0 ? (
            <div className="h-[300px] grid place-items-center text-sm text-gray-500">
              {loading ? 'Loading budget ranges...' : 'No budget data available.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetRanges}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {budgetRanges.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Budget Distribution</h2>
          {budgetRanges.length === 0 ? (
            <div className="text-sm text-gray-500">
              {loading ? 'Loading distribution...' : 'No distribution to display.'}
            </div>
          ) : (
            <div className="space-y-3">
              {budgetRanges.map((range, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{range.range}</span>
                    <span className="text-gray-900 font-semibold">{range.count} users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${range.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Destination Entrance Fees</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destination</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Entrance Fee</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!loading && destinationCosts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                  No destination cost data found.
                </td>
              </tr>
            )}
            {destinationCosts.map((dest) => (
              <tr key={dest.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{dest.destination}</td>
                <td className="px-6 py-4 text-gray-900">PHP {dest.entranceFee.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit className="size-4 text-gray-600" />
                    </button>
                    <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium flex items-center gap-1">
                      <Save className="size-3" />
                      Save
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
