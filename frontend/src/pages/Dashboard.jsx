import { useAuth } from '../context/AuthContext';
import ClientDashboard from './dashboards/ClientDashboard';
import ArtistDashboard from './dashboards/ArtistDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  }

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'artist') return <ArtistDashboard />;
  return <ClientDashboard />;
}