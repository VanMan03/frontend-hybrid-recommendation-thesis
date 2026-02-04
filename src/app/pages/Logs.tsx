import { Search, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type SystemLog = {
  id: number;
  severity: 'Error' | 'Warning' | 'Info' | 'Success' | string;
  event: string;
  description: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Failed' | string;
};

const systemLogs: SystemLog[] = [];

export function Logs() {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Error':
        return <AlertCircle className="size-4 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="size-4 text-yellow-600" />;
      case 'Info':
        return <Info className="size-4 text-blue-600" />;
      default:
        return <CheckCircle className="size-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600 mt-1">Monitor system events, errors, and activities</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Error', 'Warning', 'Info', 'Success'].map((filter) => (
              <button
                key={filter}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Severity</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Event</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {systemLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(log.severity)}
                    <span className={`text-sm font-medium ${
                      log.severity === 'Error' ? 'text-red-700' :
                      log.severity === 'Warning' ? 'text-yellow-700' :
                      log.severity === 'Info' ? 'text-blue-700' :
                      'text-green-700'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{log.event}</td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-md">{log.description}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    log.status === 'Success' ? 'bg-green-100 text-green-700' :
                    log.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
