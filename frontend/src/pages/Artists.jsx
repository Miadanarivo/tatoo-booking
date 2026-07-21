import { useAuth } from '../context/AuthContext';
import AdminArtists from './dashboards/AdminArtists';
import ClientArtists from './ClientArtists';

export default function Artists() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  }

  if (user?.role === 'admin') return <AdminArtists />;
  return <ClientArtists />;
}