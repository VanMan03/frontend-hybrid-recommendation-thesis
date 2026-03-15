import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { apiRequest } from '@/services/api';
import { useAdminData } from '@/app/context/AdminDataContext';

type RatingsSummary = {
  totalRatings: number;
  averageRating: number;
  lastUpdatedAt: string | null;
  distribution: { rating: number; count: number }[];
  topDestinations: {
    destinationId: string;
    destinationName: string | null;
    count: number;
    averageRating: number;
    lastUpdatedAt: string;
  }[];
};

type RatingsListRow = {
  id: string;
  destinationId: string | null;
  destinationName: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  rating: number;
  updatedAt: string;
};

type RatingsListResponse = {
  ratings: RatingsListRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type RatingsByDestination = {
  destination: {
    id: string;
    name: string;
    isActive: boolean;
  };
  totalRatings: number;
  averageRating: number;
  lastUpdatedAt: string;
  distribution: { rating: number; count: number }[];
  ratings: {
    id: string;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    rating: number;
    updatedAt: string;
  }[];
};

type CommentRow = {
  id: string;
  destinationId: string | null;
  destinationName: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  body: string;
  status: 'visible' | 'hidden';
  createdAt: string;
  updatedAt: string;
};

type CommentResponse = {
  comments: CommentRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type EventRow = {
  _id: string;
  eventType: string;
  timestamp: string;
  sessionId: string;
  userId: string | null;
  userEmail: string | null;
  destinationId: string | null;
  itineraryId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type EventResponse = {
  events: EventRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type EventSummary = {
  totalEvents: number;
  uniqueSessionCount: number;
  uniqueUserCount: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  eventsByType: { eventType: string; count: number }[];
};

const toDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: string | null) => {
  const parsed = toDate(value);
  return parsed ? parsed.toLocaleDateString() : 'N/A';
};

const formatDateTime = (value?: string | null) => {
  const parsed = toDate(value);
  return parsed ? parsed.toLocaleString() : 'N/A';
};

export function Feedback() {
  const { destinations, fetchDestinations } = useAdminData();
  const [activeTab, setActiveTab] = useState<'ratings' | 'comments' | 'events'>('ratings');
  const [ratingsView, setRatingsView] = useState<'table' | 'destination'>('table');

  const [summary, setSummary] = useState<RatingsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [ratingsLimit, setRatingsLimit] = useState(30);
  const [ratingsFrom, setRatingsFrom] = useState('');
  const [ratingsTo, setRatingsTo] = useState('');
  const [ratingsPage, setRatingsPage] = useState(1);
  const [ratingsList, setRatingsList] = useState<RatingsListResponse | null>(null);
  const [ratingsListLoading, setRatingsListLoading] = useState(false);
  const [ratingsListError, setRatingsListError] = useState<string | null>(null);
  const [ratingsData, setRatingsData] = useState<RatingsByDestination | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  const [commentDestinationId, setCommentDestinationId] = useState('');
  const [commentStatus, setCommentStatus] = useState('');
  const [commentFrom, setCommentFrom] = useState('');
  const [commentTo, setCommentTo] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [commentLimit, setCommentLimit] = useState(50);
  const [commentData, setCommentData] = useState<CommentResponse | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [eventDestinationId, setEventDestinationId] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventFrom, setEventFrom] = useState('');
  const [eventTo, setEventTo] = useState('');
  const [eventPage, setEventPage] = useState(1);
  const [eventLimit, setEventLimit] = useState(50);
  const [eventData, setEventData] = useState<EventResponse | null>(null);
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const data = (await apiRequest('/admin/ratings/summary?topLimit=10')) as RatingsSummary;
        setSummary(data);
      } catch (err: any) {
        setSummaryError(err?.message || 'Failed to load ratings summary.');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, []);

  useEffect(() => {
    const loadRatingsList = async () => {
      try {
        setRatingsListLoading(true);
        setRatingsListError(null);

        const params = new URLSearchParams();
        if (selectedDestinationId) params.set('destinationId', selectedDestinationId);
        if (ratingsFrom) params.set('from', ratingsFrom);
        if (ratingsTo) params.set('to', ratingsTo);
        params.set('page', String(ratingsPage));
        params.set('limit', String(ratingsLimit));

        const data = (await apiRequest(`/admin/ratings?${params.toString()}`)) as RatingsListResponse;
        setRatingsList(data);
      } catch (err: any) {
        setRatingsListError(err?.message || 'Failed to load ratings list.');
      } finally {
        setRatingsListLoading(false);
      }
    };

    if (ratingsView === 'table') {
      loadRatingsList();
    }
  }, [selectedDestinationId, ratingsFrom, ratingsTo, ratingsPage, ratingsLimit, ratingsView]);

  useEffect(() => {
    if (!selectedDestinationId || ratingsView !== 'destination') {
      setRatingsData(null);
      setRatingsError(null);
      return;
    }

    const loadRatings = async () => {
      try {
        setRatingsLoading(true);
        setRatingsError(null);
        const data = (await apiRequest(
          `/admin/ratings/destination/${selectedDestinationId}?limit=${ratingsLimit}`
        )) as RatingsByDestination;
        setRatingsData(data);
      } catch (err: any) {
        setRatingsError(err?.message || 'Failed to load destination ratings.');
      } finally {
        setRatingsLoading(false);
      }
    };

    loadRatings();
  }, [selectedDestinationId, ratingsLimit, ratingsView]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setCommentLoading(true);
        setCommentError(null);

        const params = new URLSearchParams();
        if (commentDestinationId) params.set('destinationId', commentDestinationId);
        if (commentStatus) params.set('status', commentStatus);
        if (commentFrom) params.set('from', commentFrom);
        if (commentTo) params.set('to', commentTo);
        params.set('page', String(commentPage));
        params.set('limit', String(commentLimit));

        const data = (await apiRequest(`/admin/comments?${params.toString()}`)) as CommentResponse;
        setCommentData(data);
      } catch (err: any) {
        setCommentError(err?.message || 'Failed to load feedback comments.');
      } finally {
        setCommentLoading(false);
      }
    };

    loadComments();
  }, [commentDestinationId, commentStatus, commentFrom, commentTo, commentPage, commentLimit]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventLoading(true);
        setEventError(null);

        const eventParams = new URLSearchParams();
        if (eventType) eventParams.set('eventType', eventType);
        if (eventDestinationId) eventParams.set('destinationId', eventDestinationId);
        if (eventFrom) eventParams.set('from', eventFrom);
        if (eventTo) eventParams.set('to', eventTo);
        eventParams.set('page', String(eventPage));
        eventParams.set('limit', String(eventLimit));

        const summaryParams = new URLSearchParams();
        if (eventDestinationId) summaryParams.set('destinationId', eventDestinationId);
        if (eventFrom) summaryParams.set('from', eventFrom);
        if (eventTo) summaryParams.set('to', eventTo);

        const [events, summaryData] = await Promise.all([
          apiRequest(`/admin/feedback/events?${eventParams.toString()}`) as Promise<EventResponse>,
          apiRequest(`/admin/feedback/summary?${summaryParams.toString()}`) as Promise<EventSummary>,
        ]);

        setEventData(events);
        setEventSummary(summaryData);
      } catch (err: any) {
        setEventError(err?.message || 'Failed to load telemetry events.');
      } finally {
        setEventLoading(false);
      }
    };

    loadEvents();
  }, [eventDestinationId, eventType, eventFrom, eventTo, eventPage, eventLimit]);

  const destinationOptions = useMemo(() => {
    return [...destinations]
      .map((destination) => ({
        id: destination._id,
        name: destination.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [destinations]);

  const distribution = ratingsData?.distribution ?? summary?.distribution ?? [];
  const maxDistribution = Math.max(1, ...distribution.map((item) => item.count));

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
        <p className="text-gray-600 mt-1">
          Separate views for ratings, feedback comments, and telemetry events
        </p>
      </div>

      {(summaryError || ratingsError || ratingsListError || commentError || eventError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {summaryError || ratingsError || ratingsListError || commentError || eventError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Total Ratings</p>
          <p className="text-3xl font-bold text-gray-900">
            {summaryLoading ? '...' : summary?.totalRatings ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Average Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {summaryLoading ? '...' : summary?.averageRating?.toFixed(2) ?? '0.00'}
            </p>
            <div className="flex">{renderStars(Math.round(summary?.averageRating || 0))}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Last Updated</p>
          <p className="text-3xl font-bold text-gray-900">
            {summaryLoading ? '...' : formatDate(summary?.lastUpdatedAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ratings', label: 'Ratings' },
          { id: 'comments', label: 'Feedback Comments' },
          { id: 'events', label: 'Telemetry Events' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ratings' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'table', label: 'Ratings Table' },
              { id: 'destination', label: 'Destination Info' },
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setRatingsView(view.id as typeof ratingsView)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  ratingsView === view.id
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Destination</label>
                <select
                  value={selectedDestinationId}
                  onChange={(event) => {
                    setSelectedDestinationId(event.target.value);
                    setRatingsPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All destinations</option>
                  {destinationOptions.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">From</label>
                <input
                  type="date"
                  value={ratingsFrom}
                  onChange={(event) => {
                    setRatingsFrom(event.target.value);
                    setRatingsPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">To</label>
                <input
                  type="date"
                  value={ratingsTo}
                  onChange={(event) => {
                    setRatingsTo(event.target.value);
                    setRatingsPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Rows</label>
                <select
                  value={ratingsLimit}
                  onChange={(event) => {
                    setRatingsLimit(Number(event.target.value));
                    setRatingsPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {[10, 20, 30, 50].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} rows
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {(ratingsLoading || ratingsListLoading) && (
                  <p className="text-sm text-gray-500">Loading ratings...</p>
                )}
              </div>
            </div>
          </div>

          {ratingsView === 'destination' && !selectedDestinationId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-sm text-gray-500">
              Select a destination to view its ratings table and distribution.
            </div>
          )}

          {selectedDestinationId && ratingsView === 'destination' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-600 mb-2">Destination</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {ratingsData?.destination?.name || 'N/A'}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Last updated {formatDate(ratingsData?.lastUpdatedAt)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Ratings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {ratingsData?.totalRatings ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {ratingsData?.averageRating?.toFixed(2) ?? '0.00'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Ratings Distribution</h3>
                {distribution.length === 0 && (
                  <p className="text-sm text-gray-500">No ratings data available.</p>
                )}
                {distribution.map((item) => (
                  <div key={item.rating} className="flex items-center gap-3 mb-2">
                    <span className="w-10 text-sm text-gray-600">{item.rating}★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${(item.count / maxDistribution) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {ratingsView === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Destination</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Rating</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!ratingsListLoading && (ratingsList?.ratings?.length || 0) === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No ratings found.
                      </td>
                    </tr>
                  )}
                  {(ratingsList?.ratings || []).map((rating) => (
                    <tr key={rating.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">
                        {rating.destinationName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <div className="font-medium">
                          {rating.userName || rating.userEmail || 'Anonymous'}
                        </div>
                        {rating.userEmail && (
                          <div className="text-xs text-gray-500">{rating.userEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{rating.rating}</span>
                          <div className="flex">{renderStars(rating.rating)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {formatDateTime(rating.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-600">
                <span>
                  Page {ratingsList?.page ?? 1} of {ratingsList?.totalPages ?? 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRatingsPage((prev) => Math.max(1, prev - 1))}
                    disabled={(ratingsList?.page ?? 1) <= 1}
                    className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRatingsPage((prev) =>
                        Math.min(ratingsList?.totalPages ?? prev + 1, prev + 1)
                      )
                    }
                    disabled={(ratingsList?.page ?? 1) >= (ratingsList?.totalPages ?? 1)}
                    className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Destination</label>
                <select
                  value={commentDestinationId}
                  onChange={(event) => {
                    setCommentDestinationId(event.target.value);
                    setCommentPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All destinations</option>
                  {destinationOptions.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                <select
                  value={commentStatus}
                  onChange={(event) => {
                    setCommentStatus(event.target.value);
                    setCommentPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">From</label>
                <input
                  type="date"
                  value={commentFrom}
                  onChange={(event) => {
                    setCommentFrom(event.target.value);
                    setCommentPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">To</label>
                <input
                  type="date"
                  value={commentTo}
                  onChange={(event) => {
                    setCommentTo(event.target.value);
                    setCommentPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Rows</label>
                <select
                  value={commentLimit}
                  onChange={(event) => {
                    setCommentLimit(Number(event.target.value));
                    setCommentPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {[25, 50, 100].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Comment</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!commentLoading && (commentData?.comments?.length || 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No feedback comments found.
                    </td>
                  </tr>
                )}
                {(commentData?.comments || []).map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">
                      {comment.destinationName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {comment.userName || comment.userEmail || 'Anonymous'}
                      </div>
                      {comment.userEmail && (
                        <div className="text-xs text-gray-500">{comment.userEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-700 line-clamp-3">{comment.body}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          comment.status === 'visible'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {comment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {formatDateTime(comment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-600">
              <span>
                Page {commentData?.page ?? 1} of {commentData?.totalPages ?? 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCommentPage((prev) => Math.max(1, prev - 1))}
                  disabled={(commentData?.page ?? 1) <= 1}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCommentPage((prev) =>
                      Math.min(commentData?.totalPages ?? prev + 1, prev + 1)
                    )
                  }
                  disabled={(commentData?.page ?? 1) >= (commentData?.totalPages ?? 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Destination</label>
                <select
                  value={eventDestinationId}
                  onChange={(event) => {
                    setEventDestinationId(event.target.value);
                    setEventPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All destinations</option>
                  {destinationOptions.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Event Type</label>
                <select
                  value={eventType}
                  onChange={(event) => {
                    setEventType(event.target.value);
                    setEventPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All types</option>
                  {(eventSummary?.eventsByType || []).map((entry) => (
                    <option key={entry.eventType} value={entry.eventType}>
                      {entry.eventType}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">From</label>
                <input
                  type="date"
                  value={eventFrom}
                  onChange={(event) => {
                    setEventFrom(event.target.value);
                    setEventPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">To</label>
                <input
                  type="date"
                  value={eventTo}
                  onChange={(event) => {
                    setEventTo(event.target.value);
                    setEventPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Rows</label>
                <select
                  value={eventLimit}
                  onChange={(event) => {
                    setEventLimit(Number(event.target.value));
                    setEventPage(1);
                  }}
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {[25, 50, 100].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {eventLoading ? '...' : eventSummary?.totalEvents ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Unique Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {eventLoading ? '...' : eventSummary?.uniqueSessionCount ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Unique Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {eventLoading ? '...' : eventSummary?.uniqueUserCount ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Last Seen</p>
              <p className="text-3xl font-bold text-gray-900">
                {eventLoading ? '...' : formatDate(eventSummary?.lastSeenAt)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Event</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!eventLoading && (eventData?.events?.length || 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No telemetry events found.
                    </td>
                  </tr>
                )}
                {(eventData?.events || []).map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{entry.eventType}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {entry.userEmail || entry.userId || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">Session {entry.sessionId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {formatDateTime(entry.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {(() => {
                        const isExpanded = expandedEventIds.has(entry._id);
                        const text = entry.metadata ? JSON.stringify(entry.metadata, null, 2) : '{}';
                        return (
                          <div>
                            <pre
                              className={`whitespace-pre-wrap break-words max-w-[28rem] ${
                                isExpanded ? '' : 'line-clamp-3'
                              }`}
                            >
                              {text}
                            </pre>
                            {text.length > 120 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedEventIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(entry._id)) {
                                      next.delete(entry._id);
                                    } else {
                                      next.add(entry._id);
                                    }
                                    return next;
                                  })
                                }
                                className="mt-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                              >
                                {isExpanded ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-600">
              <span>
                Page {eventData?.page ?? 1} of {eventData?.totalPages ?? 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEventPage((prev) => Math.max(1, prev - 1))}
                  disabled={(eventData?.page ?? 1) <= 1}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEventPage((prev) =>
                      Math.min(eventData?.totalPages ?? prev + 1, prev + 1)
                    )
                  }
                  disabled={(eventData?.page ?? 1) >= (eventData?.totalPages ?? 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
