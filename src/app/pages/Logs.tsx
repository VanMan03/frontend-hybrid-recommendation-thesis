import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { apiRequest } from "@/services/api";

type Severity = "Error" | "Warning" | "Info" | "Success";
type Status = "Success" | "Warning" | "Failed";

type SystemLog = {
  id: string;
  severity: Severity;
  event: string;
  description: string;
  timestamp: string;
  status: Status;
};

const FILTERS = ["All", "Error", "Warning", "Info", "Success"] as const;

const normalizeSeverity = (value: unknown): Severity => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("error") || normalized.includes("fail")) return "Error";
  if (normalized.includes("warn")) return "Warning";
  if (normalized.includes("success") || normalized.includes("ok")) return "Success";
  return "Info";
};

const normalizeStatus = (value: unknown, fallbackSeverity: Severity): Status => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("warn")) return "Warning";
  if (
    normalized.includes("fail") ||
    normalized.includes("error") ||
    normalized.includes("denied")
  ) {
    return "Failed";
  }
  if (normalized.includes("success") || normalized.includes("ok")) return "Success";
  if (fallbackSeverity === "Error") return "Failed";
  if (fallbackSeverity === "Warning") return "Warning";
  return "Success";
};

const formatTimestamp = (value: unknown): string => {
  if (!value) return "N/A";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const normalizeLogs = (raw: unknown): SystemLog[] => {
  if (!Array.isArray(raw)) return [];

  return raw.map((entry: any, index: number) => {
    const severity = normalizeSeverity(
      entry?.severity ?? entry?.level ?? entry?.type ?? entry?.status
    );

    const event =
      entry?.event ??
      entry?.action ??
      entry?.title ??
      entry?.message ??
      "System Event";

    const description =
      entry?.description ??
      entry?.details ??
      entry?.message ??
      entry?.event ??
      "No description available";

    const timestamp =
      entry?.timestamp ??
      entry?.createdAt ??
      entry?.updatedAt ??
      entry?.time ??
      null;

    return {
      id: String(entry?._id ?? entry?.id ?? `${Date.now()}-${index}`),
      severity,
      event: String(event),
      description: String(description),
      timestamp: formatTimestamp(timestamp),
      status: normalizeStatus(entry?.status, severity),
    };
  });
};

const fetchLogs = async (): Promise<SystemLog[]> => {
  const endpoints = [
    "/admin/logs",
    "/logs",
    "/admin/system-logs",
    "/admin/activities",
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

      const normalized = normalizeLogs(list);
      if (normalized.length > 0 || Array.isArray(list)) return normalized;
    } catch {
      continue;
    }
  }

  return [];
};

export function Logs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");

  const loadLogs = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const data = await fetchLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load system logs.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadLogs();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        // Keep rows fresh without full page reload.
        void loadLogs(true);
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadLogs]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadLogs(true);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesFilter = activeFilter === "All" || log.severity === activeFilter;
      if (!matchesFilter) return false;

      const q = query.trim().toLowerCase();
      if (!q) return true;

      return (
        log.event.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.severity.toLowerCase().includes(q) ||
        log.status.toLowerCase().includes(q)
      );
    });
  }, [logs, activeFilter, query]);

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "Error":
        return <AlertCircle className="size-4 text-red-600" />;
      case "Warning":
        return <AlertTriangle className="size-4 text-yellow-600" />;
      case "Info":
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-teal-100 text-teal-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

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
            {loading && (
              <tr>
                <td className="px-6 py-8 text-sm text-gray-600" colSpan={5}>
                  Loading logs...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td className="px-6 py-8 text-sm text-red-700" colSpan={5}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && filteredLogs.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-sm text-gray-600" colSpan={5}>
                  No logs found.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      <span
                        className={`text-sm font-medium ${
                          log.severity === "Error"
                            ? "text-red-700"
                            : log.severity === "Warning"
                              ? "text-yellow-700"
                              : log.severity === "Info"
                                ? "text-blue-700"
                                : "text-green-700"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{log.event}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md">{log.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.status === "Success"
                          ? "bg-green-100 text-green-700"
                          : log.status === "Warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
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
