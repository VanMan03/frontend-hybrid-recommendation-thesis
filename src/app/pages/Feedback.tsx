import { Star, Check, X, Flag } from 'lucide-react';

type Feedback = {
  id: number;
  user: string;
  rating: number;
  feedback: string;
  destination: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected' | string;
};

const ratingsAndFeedback: Feedback[] = [];

export function Feedback() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`size-4 ${idx < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ratings & Feedback</h1>
        <p className="text-gray-600 mt-1">Monitor and moderate user reviews and ratings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Average Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">0</p>
            <div className="flex">{renderStars(0)}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Pending Moderation</p>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Flagged</p>
          <p className="text-3xl font-bold text-red-600">0</p>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Rating</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Feedback</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destination</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ratingsAndFeedback.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-900">{feedback.user}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{feedback.rating}</span>
                    <div className="flex">{renderStars(feedback.rating)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm text-gray-700 line-clamp-2">{feedback.feedback}</p>
                </td>
                <td className="px-6 py-4 text-gray-900">{feedback.destination}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{feedback.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    feedback.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {feedback.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {feedback.status === 'Pending' && (
                      <>
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                          <Check className="size-4 text-green-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                          <X className="size-4 text-red-600" />
                        </button>
                      </>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Flag">
                      <Flag className="size-4 text-gray-600" />
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
