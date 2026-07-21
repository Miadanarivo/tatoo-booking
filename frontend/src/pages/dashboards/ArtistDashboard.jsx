import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_LABELS = {
  pending: { label: 'En attente', color: 'bg-yellow-900/50 text-yellow-300' },
  confirmed: { label: 'Confirmée', color: 'bg-green-900/50 text-green-300' },
  rejected: { label: 'Refusée', color: 'bg-red-900/50 text-red-300' },
  cancelled: { label: 'Annulée', color: 'bg-gray-700 text-gray-300' },
  completed: { label: 'Terminée', color: 'bg-blue-900/50 text-blue-300' },
};

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/artist/me');
      setBookings(data);
    } catch (err) {
      setError('Impossible de charger vos demandes de réservation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        Espace artiste — {user?.firstName} 🎨
      </h1>
      <p className="text-gray-400 mb-8">
        Voici les demandes de réservation que vous avez reçues.
      </p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {bookings.length === 0 ? (
        <p className="text-gray-400">Aucune demande de réservation pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {booking.client?.firstName} {booking.client?.lastName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {booking.date} à {booking.startTime} — {booking.bodyZone}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{booking.description}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full self-start ${
                    STATUS_LABELS[booking.status]?.color || 'bg-gray-700'
                  }`}
                >
                  {STATUS_LABELS[booking.status]?.label || booking.status}
                </span>
              </div>

              {booking.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleStatusChange(booking.id, 'confirmed')}
                    className="bg-green-700 hover:bg-green-800 text-xs px-4 py-2 rounded"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, 'rejected')}
                    className="bg-red-700 hover:bg-red-800 text-xs px-4 py-2 rounded"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}