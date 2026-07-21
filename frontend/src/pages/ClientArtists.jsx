
import { useEffect, useState } from 'react';
import api from '../services/api';
import ArtistCard from '../components/ArtistCard';

export default function ClientArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data } = await api.get('/artists');
        setArtists(data);
      } catch (err) {
        setError('Impossible de charger les artistes pour le moment.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter((artist) => {
    const fullName = `${artist.user?.firstName} ${artist.user?.lastName}`.toLowerCase();
    const city = artist.salon?.city?.toLowerCase() || '';
    const term = search.toLowerCase();
    return fullName.includes(term) || city.includes(term);
  });

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement des artistes...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nos artistes</h1>

      <input
        type="text"
        placeholder="Rechercher par nom ou ville..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-8 p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
      />

      {filteredArtists.length === 0 ? (
        <p className="text-gray-400">Aucun artiste trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}