import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Route,
  DollarSign,
  Star,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/destinations", label: "Destinations", icon: MapPin },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/itineraries", label: "Itineraries", icon: Route },
  { path: "/admin/budget", label: "Budget & Cost", icon: DollarSign },
  { path: "/admin/feedback", label: "Ratings & Feedback", icon: Star },
  { path: "/admin/analytics", label: "Reports & Analytics", icon: BarChart3 },
  { path: "/admin/logs", label: "System Logs", icon: FileText },
  { path: "/admin/content", label: "Content", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-teal-700 to-teal-900 text-white shadow-xl">
      <div className="flex items-center gap-3 p-6 border-b border-teal-600">
        <div className="p-2 bg-white/10 rounded-lg">
          <MapPin className="size-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Travel Admin</h1>
          <p className="text-xs text-teal-200">Tourism Dashboard</p>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-teal-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
