import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import AdminAgenda from './pages/dashboards/AdminAgenda';
import AdminPortfolio from './pages/dashboards/AdminPortfolio';
import AdminClients from './pages/dashboards/AdminClients';
import AdminSettings from './pages/dashboards/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const PAGES_WITH_OWN_HEADER = ['/', '/login', '/register', '/forgot-password'];

const ADMIN_OWN_HEADER_PATHS = [
  '/dashboard',
  '/dashboard/agenda',
  '/dashboard/portfolio',
  '/dashboard/clients',
  '/dashboard/settings',
  '/artists',
];

function App() {
  const location = useLocation();
  const { user } = useAuth();
  const isFullBleedDashboard =
    ADMIN_OWN_HEADER_PATHS.includes(location.pathname) &&
    (user?.role === 'admin' ||
      (location.pathname === '/dashboard' && (user?.role === 'client' || user?.role === 'artist')));
  const hasOwnHeader = PAGES_WITH_OWN_HEADER.includes(location.pathname) || isFullBleedDashboard;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!hasOwnHeader && <Navbar />}
      <main className={hasOwnHeader ? '' : 'max-w-6xl mx-auto px-4 py-6'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/artists"
            element={
              <ProtectedRoute>
                <Artists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artists/:id"
            element={
              <ProtectedRoute>
                <ArtistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:artistId"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agenda"
            element={
              <ProtectedRoute>
                <AdminAgenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/portfolio"
            element={
              <ProtectedRoute>
                <AdminPortfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/clients"
            element={
              <ProtectedRoute>
                <AdminClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;