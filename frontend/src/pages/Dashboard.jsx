import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_LABELS = {
  pending: { label: 'En attente', color: 'bg-yellow-900/50 text-yellow-300' },
  confirmed: { label: 'Confirmée', color: 'bg-green-900/50 text-green-300' },
  rejected: { label: 'Refusée', color: 'bg-red-900/50 text-red-300' },
  cancelled: { label: 'Annulée', color: 'bg-gray-700 text-gray-300' },
  completed: { label: 'Terminée', color: 'bg-blue-900/50 text-blue-300' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/me');
        setBookings(data);
      } catch (err) {
        setError('Impossible de charger vos réservations.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b,
        ),
      );
    } catch (err) {
      alert("Erreur lors de l'annulation");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        Bonjour {user?.firstName} 👋
      </h1>
      <p className="text-gray-400 mb-8">Voici l'historique de vos réservations.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {bookings.length === 0 ? (
        <p className="text-gray-400">Vous n'avez aucune réservation pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold">
                  {booking.artist?.user?.firstName} {booking.artist?.user?.lastName}
                </p>
                <p className="text-sm text-gray-400">
                  {booking.date} à {booking.startTime} — {booking.bodyZone}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {booking.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    STATUS_LABELS[booking.status]?.color || 'bg-gray-700'
                  }`}
                >
                  {STATUS_LABELS[booking.status]?.label || booking.status}
                </span>
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}