import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Icon,
  AdminSidebar,
  AdminTopbar,
  DashboardFooter,
  SerifTitle,
  fullName,
  initials,
  STYLE_LABELS,
} from './adminUi';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Modale d'ajout d'une œuvre au portfolio
// ---------------------------------------------------------------------------

function UploadModal({ artists, onClose, onUploaded }) {
  const [artistId, setArtistId] = useState(artists[0]?.id || '');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artistId) {
      setError('Sélectionnez un artiste.');
      return;
    }
    if (!file) {
      setError('Sélectionnez une image à téléverser.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) formData.append('caption', caption);
      const res = await api.post(`/portfolio/${artistId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded({ ...res.data, artist: artists.find((a) => a.id === artistId) });
    } catch {
      setError("Échec de l'envoi. Vérifiez que l'API est bien lancée.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#1a1613] p-6">
        <div className="mb-5 flex items-center justify-between">
          <SerifTitle as="h2" className="text-lg text-[#F4EDE2]">Nouvelle œuvre</SerifTitle>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-[#B8AF9F] hover:text-[#C9A24B]">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Artiste</label>
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F4EDE2] outline-none focus:border-[#C9A24B]/60"
            >
              <option value="" disabled>Choisir un artiste</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#1a1613]">
                  {fullName(a.user)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Légende (optionnel)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex. Dragon japonais, avant-bras"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none focus:border-[#C9A24B]/60"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Photo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center hover:border-[#C9A24B]/50">
              {preview ? (
                <img src={preview} alt="Aperçu" className="h-32 w-full rounded object-cover" />
              ) : (
                <>
                  <Icon name="upload" className="h-6 w-6 text-[#6b6357]" />
                  <span className="text-xs text-[#B8AF9F]">Cliquez pour choisir une image</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#B8AF9F] hover:text-[#F4EDE2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#C9A24B] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14110F] transition-colors hover:bg-[#dcb864] disabled:opacity-50"
            >
              {saving ? 'Envoi…' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tuile d'une œuvre du portfolio
// ---------------------------------------------------------------------------

function PortfolioTile({ item, featured, onDelete }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 ${
        featured ? 'sm:col-span-2 sm:row-span-2' : ''
      }`}
    >
      <img
        src={item.imageUrl}
        alt={item.caption || 'Œuvre du portfolio'}
        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
          featured ? 'aspect-square sm:aspect-auto sm:h-full' : 'aspect-square'
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <button
        type="button"
        onClick={() => onDelete(item)}
        aria-label="Supprimer l'œuvre"
        className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-[#F4EDE2] opacity-0 backdrop-blur transition-opacity hover:bg-red-500/70 group-hover:opacity-100"
      >
        <Icon name="trash" className="h-4 w-4" />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-4">
        {item.caption && (
          <p
            className="text-base leading-tight text-[#F4EDE2] sm:text-lg"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            {item.caption}
          </p>
        )}
        <p className="mt-1 text-[11px] uppercase tracking-wider text-[#C9A24B]">
          {fullName(item.artist?.user)}
          {item.createdAt && <span className="text-[#B8AF9F]"> · {formatDate(item.createdAt)}</span>}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function AdminPortfolio() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [items, setItems] = useState([]);
  const [salonName, setSalonName] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [query, setQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const [artistsRes, salonsRes] = await Promise.allSettled([
        api.get('/artists'),
        api.get('/salons'),
      ]);

      if (!isMounted) return;

      if (salonsRes.status === 'fulfilled' && salonsRes.value.data?.length > 0) {
        setSalonName(salonsRes.value.data[0].name);
      }

      if (artistsRes.status === 'fulfilled') {
        const artistList = artistsRes.value.data;
        setArtists(artistList);

        const portfolioResults = await Promise.allSettled(
          artistList.map((artist) => api.get(`/portfolio/artist/${artist.id}`)),
        );

        if (!isMounted) return;

        const merged = portfolioResults.flatMap((res, idx) =>
          res.status === 'fulfilled'
            ? res.value.data.map((p) => ({ ...p, artist: artistList[idx] }))
            : [],
        );
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(merged);
      } else {
        setErrorMsg("Impossible de charger le portfolio. Vérifiez que l'API est bien lancée.");
      }

      setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableStyles = useMemo(() => {
    const set = new Set();
    artists.forEach((a) => (a.styles || []).forEach((s) => set.add(s)));
    return Array.from(set);
  }, [artists]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (artistFilter !== 'all' && item.artist?.id !== artistFilter) return false;
      if (styleFilter !== 'all' && !(item.artist?.styles || []).includes(styleFilter)) return false;
      if (q && !(item.caption || '').toLowerCase().includes(q) && !fullName(item.artist?.user).toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, artistFilter, styleFilter, query]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUploaded = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Supprimer cette œuvre du portfolio ?")) return;
    try {
      await api.delete(`/portfolio/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      window.alert("Échec de la suppression. Réessayez.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="portfolio" salonName={salonName} adminName={fullName(user)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title="Portfolio" query={query} setQuery={setQuery} searchPlaceholder="Rechercher une œuvre, un artiste..." />

        <main className="flex-1 px-6 py-8 sm:px-10">
          {loading ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement du portfolio…</p>
          ) : (
            <>
              {errorMsg && (
                <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </p>
              )}

              {/* En-tête de page */}
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <SerifTitle as="h1" className="text-3xl text-[#F4EDE2] sm:text-4xl">
                    Portfolio du Studio
                  </SerifTitle>
                  <p className="mt-2 max-w-xl text-sm text-[#B8AF9F]">
                    Rassemblez les plus belles réalisations de vos artistes et mettez en valeur leur savoir-faire auprès de vos futurs clients.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 whitespace-nowrap rounded bg-[#C9A24B] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14110F] transition-colors hover:bg-[#dcb864]"
                >
                  <Icon name="upload" className="h-4 w-4" />
                  Ajouter une œuvre
                </button>
              </div>

              {/* Filtres */}
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Artiste</label>
                    <select
                      value={artistFilter}
                      onChange={(e) => setArtistFilter(e.target.value)}
                      className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F4EDE2] outline-none focus:border-[#C9A24B]/60"
                    >
                      <option value="all" className="bg-[#1a1613]">Tous les artistes</option>
                      {artists.map((a) => (
                        <option key={a.id} value={a.id} className="bg-[#1a1613]">
                          {fullName(a.user)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Style d'art</label>
                    <select
                      value={styleFilter}
                      onChange={(e) => setStyleFilter(e.target.value)}
                      className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F4EDE2] outline-none focus:border-[#C9A24B]/60"
                    >
                      <option value="all" className="bg-[#1a1613]">Tous les styles</option>
                      {availableStyles.map((s) => (
                        <option key={s} value={s} className="bg-[#1a1613]">
                          {STYLE_LABELS[s] || s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="whitespace-nowrap text-xs uppercase tracking-[0.15em] text-[#B8AF9F]">
                    {filteredItems.length} œuvre{filteredItems.length > 1 ? 's' : ''} exposée{filteredItems.length > 1 ? 's' : ''}
                  </span>
                  <div className="flex overflow-hidden rounded border border-white/10">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      aria-label="Vue grille"
                      className={`p-2 ${viewMode === 'grid' ? 'bg-[#C9A24B]/20 text-[#C9A24B]' : 'text-[#B8AF9F] hover:text-[#F4EDE2]'}`}
                    >
                      <Icon name="grid" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      aria-label="Vue liste"
                      className={`p-2 ${viewMode === 'list' ? 'bg-[#C9A24B]/20 text-[#C9A24B]' : 'text-[#B8AF9F] hover:text-[#F4EDE2]'}`}
                    >
                      <Icon name="list" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Galerie */}
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 py-24 text-center">
                  <Icon name="image" className="h-8 w-8 text-[#6b6357]" />
                  <p className="text-sm text-[#B8AF9F]">
                    {items.length === 0
                      ? "Aucune œuvre pour le moment. Ajoutez la première réalisation du studio."
                      : 'Aucune œuvre ne correspond à ces filtres.'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:auto-rows-[180px]">
                  {filteredItems.map((item, idx) => (
                    <PortfolioTile key={item.id} item={item} featured={idx === 0} onDelete={handleDelete} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/10 rounded-lg border border-white/10">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                      <img src={item.imageUrl} alt={item.caption || 'Œuvre'} className="h-16 w-16 rounded object-cover" />
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/20 text-[10px] font-semibold text-[#C9A24B]">
                          {initials(item.artist?.user?.firstName, item.artist?.user?.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[#F4EDE2]">{item.caption || 'Sans titre'}</p>
                          <p className="truncate text-xs text-[#B8AF9F]">
                            {fullName(item.artist?.user)} · {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        aria-label="Supprimer l'œuvre"
                        className="shrink-0 rounded p-2 text-[#B8AF9F] hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <DashboardFooter />
      </div>

      {showUpload && (
        <UploadModal artists={artists} onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}
    </div>
  );
}
