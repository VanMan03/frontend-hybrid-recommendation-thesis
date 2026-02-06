import { Edit, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type BudgetRange = {
  range: string;
  count: number;
  percentage: number;
};

type DestinationCost = {
  id: number;
  destination: string;
  transportation: number;
  accommodation: number;
  activities: number;
  total: number;
};

const destinationCosts: DestinationCost[] = [];
const budgetRanges: BudgetRange[] = [];

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'];

export function Budget() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget & Cost Management</h1>
        <p className="text-gray-600 mt-1">Manage destination pricing and budget analytics</p>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Common Budget Ranges</h2>
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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Budget Distribution</h2>
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
        </div>
      </div>

      {/* Destination Costs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Destination Cost Breakdown</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destination</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Transportation</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Accommodation</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Activities</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {destinationCosts.map((dest) => (
              <tr key={dest.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{dest.destination}</td>
                <td className="px-6 py-4 text-gray-900">₱{dest.transportation.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-900">₱{dest.accommodation.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-900">₱{dest.activities.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-teal-600">₱{dest.total.toLocaleString()}</span>
                </td>
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
