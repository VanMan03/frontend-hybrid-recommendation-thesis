import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Destinations } from './pages/Destinations';
import { Users } from './pages/Users';
import { Itineraries } from './pages/Itineraries';
import { Budget } from './pages/Budget';
import { Feedback } from './pages/Feedback';
import { Analytics } from './pages/Analytics';
import { Logs } from './pages/Logs';
import { Content } from './pages/Content';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'destinations', Component: Destinations },
      { path: 'users', Component: Users },
      { path: 'itineraries', Component: Itineraries },
      { path: 'budget', Component: Budget },
      { path: 'feedback', Component: Feedback },
      { path: 'analytics', Component: Analytics },
      { path: 'logs', Component: Logs },
      { path: 'content', Component: Content },
    ],
  },
]);
