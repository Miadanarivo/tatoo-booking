import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ArtistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistRes, portfolioRes] = await Promise.all([
          api.get(`/artists/${id}`),
          api.get(`/portfolio/artist/${id}`),
        ]);
        setArtist(artistRes.data);
        setPortfolio(portfolioRes.data);
      } catch (err) {
        setError("Impossible de charger le profil de l'artiste.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBookingClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  }

  if (error || !artist) {
    return <div className="text-center py-20 text-red-400">{error || 'Artiste introuvable.'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-5xl flex-shrink-0">
            🎨
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {artist.user?.firstName} {artist.user?.lastName}
            </h1>
            <p className="text-gray-400 mb-3">
              {artist.salon?.name} — {artist.salon?.city}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {artist.styles?.map((style) => (
                <span
                  key={style}
                  className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded"
                >
                  {style.replace('_', ' ')}
                </span>
              ))}
            </div>
            <p className="text-gray-300 mb-4">{artist.bio}</p>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-semibold text-lg">
                {artist.hourlyRate ? `${artist.hourlyRate} €/h` : 'Tarif sur devis'}
              </span>
              <button
                onClick={handleBookingClick}
                disabled={!artist.isAvailable}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {artist.isAvailable ? 'Réserver un créneau' : 'Indisponible'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Portfolio</h2>
      {portfolio.length === 0 ? (
        <p className="text-gray-400">Aucune image disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <img
              key={item.id}
              src={item.imageUrl}
              alt={item.caption || 'Tatouage'}
              className="w-full h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
}