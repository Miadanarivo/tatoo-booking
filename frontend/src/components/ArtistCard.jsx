import { Link } from 'react-router-dom';

export default function ArtistCard({ artist }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-900/40 transition">
      <div className="h-48 bg-gray-700 flex items-center justify-center text-4xl">
        🎨
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {artist.user?.firstName} {artist.user?.lastName}
        </h3>
        <p className="text-sm text-gray-400 mb-2">
          {artist.salon?.city || 'Ville non renseignée'}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {artist.styles?.map((style) => (
            <span
              key={style}
              className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded"
            >
              {style.replace('_', ' ')}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {artist.bio || 'Aucune description disponible.'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-purple-400 font-semibold">
            {artist.hourlyRate ? `${artist.hourlyRate} €/h` : 'Tarif sur devis'}
          </span>
          <Link
            to={`/artists/${artist.id}`}
            className="bg-purple-600 hover:bg-purple-700 text-sm px-3 py-1.5 rounded"
          >
            Voir le profil
          </Link>
        </div>
      </div>
    </div>
  );
}