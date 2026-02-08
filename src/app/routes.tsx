import { Navigate, createBrowserRouter } from "react-router-dom";

import AdminLogin from "./auth/AdminLogin";
import { Layout } from "./components/layout/Layout";
import { Analytics } from "./pages/Analytics";
import { Budget } from "./pages/Budget";
import { Content } from "./pages/Content";
import { Dashboard } from "./pages/Dashboard";
import { Destinations } from "./pages/Destinations";
import { Feedback } from "./pages/Feedback";
import { Itineraries } from "./pages/Itineraries";
import { Logs } from "./pages/Logs";
import { Users } from "./pages/Users";
import { AdminRoute } from "./routes/AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminRoute,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "dashboard", Component: Dashboard },
          { path: "destinations", Component: Destinations },
          { path: "users", Component: Users },
          { path: "itineraries", Component: Itineraries },
          { path: "budget", Component: Budget },
          { path: "feedback", Component: Feedback },
          { path: "analytics", Component: Analytics },
          { path: "logs", Component: Logs },
          { path: "content", Component: Content },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/admin/login" replace />,
  },
]);
