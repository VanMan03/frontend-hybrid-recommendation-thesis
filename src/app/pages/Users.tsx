import { Search, UserCheck, UserX, Eye } from 'lucide-react';
import { useAdminData } from '@/app/context/AdminDataContext';
import { useEffect } from 'react';

export function Users() {
  const { users, fetchUsers } = useAdminData();

  useEffect(() => {
    fetchUsers();
  }, []);

  const getDisplayName = (user: any) => {
    const combined = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return user?.name || user?.fullName || combined || 'Unknown User';
  };

  const getUserId = (user: any, index: number) => user?.id || user?._id || `user-${index + 1}`;

  const getJoinDate = (user: any) => {
    const dateValue = user?.joinDate || user?.createdAt;
    if (!dateValue) return 'N/A';
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? String(dateValue) : parsed.toLocaleDateString();
  };

  const getActivityLevel = (user: any) => user?.activityLevel || 'Low';
  const getAccountStatus = (user: any) => user?.accountStatus || (user?.isActive === false ? 'Suspended' : 'Active');
  const getItineraryCount = (user: any) =>
    user?.itineraryCount ?? user?.itinerariesCount ?? user?.itineraries?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage registered users and their activity</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Activity Level</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Itineraries</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Join Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => {
              const displayName = getDisplayName(user);
              const userId = getUserId(user, index);
              const activityLevel = getActivityLevel(user);
              const accountStatus = getAccountStatus(user);
              const itineraryCount = getItineraryCount(user);
              const joinDate = getJoinDate(user);
              const initial = displayName.charAt(0).toUpperCase();

              return (
              <tr key={userId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-gray-900">#{userId}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {initial}
                    </div>
                    <span className="font-medium text-gray-900">{displayName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activityLevel === 'High' ? 'bg-green-100 text-green-700' :
                    activityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activityLevel}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 font-semibold">{itineraryCount}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{joinDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    accountStatus === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {accountStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                      <Eye className="size-4 text-gray-600" />
                    </button>
                    {accountStatus === 'Active' ? (
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Suspend">
                        <UserX className="size-4 text-red-600" />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Activate">
                        <UserCheck className="size-4 text-green-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
