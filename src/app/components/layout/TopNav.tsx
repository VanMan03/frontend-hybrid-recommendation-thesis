import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bell,
  FileText,
  LogOut,
  Route,
  Search,
  User,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/services/api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  route: string;
  timestamp: number;
  timestampLabel: string;
  type: "log" | "user" | "itinerary";
};

const LAST_SEEN_KEY = "adminNotificationsLastSeenAt";

const parseTimestamp = (value: unknown): number | null => {
  if (!value) return null;
  const parsed = new Date(String(value)).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

const formatTimestamp = (value: number): string => {
  const date = new Date(value);
  return date.toLocaleString();
};

const normalizeLogsToNotifications = (raw: unknown): NotificationItem[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry: any, index: number) => {
      const timestamp = parseTimestamp(
        entry?.timestamp ?? entry?.createdAt ?? entry?.updatedAt ?? entry?.time
      );
      if (timestamp === null) return null;

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
        "No description available";

      return {
        id: `log-${entry?._id ?? entry?.id ?? index}-${timestamp}`,
        title: String(event),
        description: String(description),
        route: "/admin/logs",
        timestamp,
        timestampLabel: formatTimestamp(timestamp),
        type: "log" as const,
      };
    })
    .filter((item): item is NotificationItem => item !== null);
};

export function TopNav() {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationContainerRef = useRef<HTMLDivElement | null>(null);
  const profileContainerRef = useRef<HTMLDivElement | null>(null);
  const bellButtonRef = useRef<HTMLButtonElement | null>(null);
  const initialLastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || "0");
  const [lastSeenAt, setLastSeenAt] = useState(
    Number.isNaN(initialLastSeen) ? 0 : initialLastSeen
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const fetchNotificationData = useCallback(async () => {
    const [logs, users, itineraries] = await Promise.all([
      (async () => {
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
            const normalized = normalizeLogsToNotifications(list);
            if (normalized.length > 0 || Array.isArray(list)) return normalized;
          } catch {
            continue;
          }
        }
        return [] as NotificationItem[];
      })(),
      (async () => {
        try {
          const response = await apiRequest("/admin/users");
          if (!Array.isArray(response)) return [] as NotificationItem[];

          return response
            .map((user: any, index: number) => {
              const timestamp = parseTimestamp(user?.createdAt ?? user?.joinDate);
              if (timestamp === null) return null;

              const name =
                user?.name ||
                user?.fullName ||
                [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                user?.email ||
                "Unknown User";

              return {
                id: `user-${user?._id ?? user?.id ?? index}-${timestamp}`,
                title: "New User Registered",
                description: `${name} created an account`,
                route: "/admin/users",
                timestamp,
                timestampLabel: formatTimestamp(timestamp),
                type: "user" as const,
              };
            })
            .filter((item): item is NotificationItem => item !== null);
        } catch {
          return [] as NotificationItem[];
        }
      })(),
      (async () => {
        try {
          const response = await apiRequest("/admin/itineraries");
          const list = Array.isArray(response)
            ? response
            : Array.isArray(response?.itineraries)
              ? response.itineraries
              : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.results)
                  ? response.results
                  : [];

          return list
            .map((itinerary: any, index: number) => {
              const timestamp = parseTimestamp(
                itinerary?.createdAt ??
                  itinerary?.dateGenerated ??
                  itinerary?.updatedAt
              );
              if (timestamp === null) return null;

              const userName =
                itinerary?.user?.name ||
                itinerary?.user?.fullName ||
                itinerary?.user?.email ||
                itinerary?.userName ||
                itinerary?.user ||
                "A user";

              return {
                id: `itinerary-${itinerary?._id ?? itinerary?.id ?? index}-${timestamp}`,
                title: "New Itinerary Generated",
                description: `${userName} generated a new itinerary`,
                route: "/admin/itineraries",
                timestamp,
                timestampLabel: formatTimestamp(timestamp),
                type: "itinerary" as const,
              };
            })
            .filter((item): item is NotificationItem => item !== null);
        } catch {
          return [] as NotificationItem[];
        }
      })(),
    ]);

    const merged = [...logs, ...users, ...itineraries]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    setNotifications(merged);
  }, []);

  useEffect(() => {
    void fetchNotificationData();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchNotificationData();
      }
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchNotificationData]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        notificationContainerRef.current &&
        !notificationContainerRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const latestTimestamp = notifications[0]?.timestamp ?? Date.now();
    localStorage.setItem(LAST_SEEN_KEY, String(latestTimestamp));
    setLastSeenAt(latestTimestamp);
  }, [isNotificationOpen, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.timestamp > lastSeenAt).length,
    [notifications, lastSeenAt]
  );

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "user":
        return <Users className="size-4 text-blue-600" />;
      case "itinerary":
        return <Route className="size-4 text-teal-600" />;
      default:
        return <AlertCircle className="size-4 text-amber-600" />;
    }
  };

  const handleNotificationClick = (route: string) => {
    setIsNotificationOpen(false);
    navigate(route);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations, users, itineraries..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          <div className="relative" ref={notificationContainerRef}>
            <button
              ref={bellButtonRef}
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
            >
              <Bell className="size-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] leading-4 text-white text-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <button
                    type="button"
                    className="text-xs text-teal-700 hover:text-teal-800"
                    onClick={() => {
                      localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
                      setLastSeenAt(Date.now());
                    }}
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-500 text-center">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((item) => {
                      const isUnread = item.timestamp > lastSeenAt;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNotificationClick(item.route)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            isUnread ? "bg-teal-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificationIcon(item.type)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </p>
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-1">
                                {item.timestampLabel}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleNotificationClick("/admin/logs")}
                  className="w-full px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 border-t border-gray-100 inline-flex items-center justify-center gap-2"
                >
                  <FileText className="size-4" />
                  View system logs
                </button>
              </div>
            )}
          </div>

          <div className="relative pl-4 border-l border-gray-200" ref={profileContainerRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-lg hover:bg-gray-100 px-2 py-1 transition-colors"
              aria-label="Profile menu"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">LGU Tourism Office</p>
              </div>
              <div className="p-2 bg-teal-100 rounded-full">
                <User className="size-5 text-teal-700" />
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm logout</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be signed out and redirected to the admin login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
