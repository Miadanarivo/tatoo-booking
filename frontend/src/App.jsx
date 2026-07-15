import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const IMMERSIVE_PATHS = ['/', '/login'];

function App() {
  const location = useLocation();
  const isImmersive = IMMERSIVE_PATHS.includes(location.pathname);

  if (isImmersive) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
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
        </Routes>
      </main>
    </div>
  );
}

export default App;