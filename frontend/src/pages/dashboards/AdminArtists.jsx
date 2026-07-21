import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  STYLE_LABELS,
  Icon,
  AdminSidebar,
  AdminTopbar,
  DashboardFooter,
  StatCard,
  fullName,
  sameMonth,
  occupationBadge,
  TopArtistCard,
  Pagination,
  ResidentsTable,
} from './adminUi';

// Capacité mensuelle de référence utilisée pour estimer le taux d'occupation
// d'un artiste (même logique que sur le Tableau de bord).
const SESSIONS_PAR_MOIS_CIBLE = 20;
const ACTIVE_STATUSES = ['confirmed', 'completed'];
const PAGE_SIZE = 5;

export default function AdminArtists() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [salonName, setSalonName] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const [artistsRes, bookingsRes, salonsRes] = await Promise.allSettled([
        api.get('/artists'),
        api.get('/bookings'),
        api.get('/salons'),
      ]);

      if (!isMounted) return;

      if (artistsRes.status === 'fulfilled') setArtists(artistsRes.value.data);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (salonsRes.status === 'fulfilled' && salonsRes.value.data?.length > 0) {
        setSalonName(salonsRes.value.data[0].name);
      }
      if (artistsRes.status === 'rejected') {
        setErrorMsg("Impossible de charger la liste des artistes. Vérifiez que l'API est bien lancée.");
      }

      if (isMounted) setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);

  // --- Statut temps réel + prochain RDV + occupation, par artiste ---------

  const artistsWithStats = useMemo(() => {
    const q = query.trim().toLowerCase();

    return artists
      .map((a) => {
        const artistBookings = bookings.filter((b) => b.artist?.id === a.id);

        const sessionsThisMonth = artistBookings.filter(
          (b) => ACTIVE_STATUSES.includes(b.status) && sameMonth(b.date, now),
        ).length;
        const occupation = Math.min(100, Math.round((sessionsThisMonth / SESSIONS_PAR_MOIS_CIBLE) * 100));

        // Prochain RDV confirmé à venir
        const nextBooking = artistBookings
          .filter((b) => b.status === 'confirmed' && new Date(`${b.date}T${b.startTime}`) >= now)
          .sort((x, y) => new Date(`${x.date}T${x.startTime}`) - new Date(`${y.date}T${y.startTime}`))[0] || null;

        // Statut en direct : en session maintenant / disponible / absent
        const inSessionNow = artistBookings.some((b) => {
          if (b.status !== 'confirmed' || b.date !== now.toISOString().slice(0, 10)) return false;
          const start = new Date(`${b.date}T${b.startTime}`);
          const end = new Date(start.getTime() + (b.durationMinutes || 60) * 60000);
          return now >= start && now <= end;
        });

        const liveStatus = inSessionNow
          ? { label: 'En Session', tone: 'text-red-300', dot: 'bg-red-400' }
          : a.isAvailable
            ? { label: 'Disponible', tone: 'text-emerald-400', dot: 'bg-emerald-400' }
            : { label: 'Absent', tone: 'text-[#6b6357]', dot: 'bg-[#6b6357]' };

        return { ...a, occupation, nextBooking, liveStatus, sessionsThisMonth };
      })
      .filter((a) => {
        if (!q) return true;
        const styleMatch = (a.styles || []).some((s) => (STYLE_LABELS[s] || '').toLowerCase().includes(q));
        return fullName(a.user).toLowerCase().includes(q) || styleMatch;
      });
  }, [artists, bookings, now, query]);

  // --- Carte 1 : sessions ce mois + tendance vs mois dernier ---------------

  const sessionsThisMonthTotal = useMemo(
    () => bookings.filter((b) => ACTIVE_STATUSES.includes(b.status) && sameMonth(b.date, now)).length,
    [bookings, now],
  );

  const sessionsLastMonthTotal = useMemo(() => {
    const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return bookings.filter((b) => ACTIVE_STATUSES.includes(b.status) && sameMonth(b.date, lastMonthRef)).length;
  }, [bookings, now]);

  const sessionsTrend =
    sessionsLastMonthTotal === 0 ? null : Math.round(((sessionsThisMonthTotal - sessionsLastMonthTotal) / sessionsLastMonthTotal) * 100);

  // --- Carte 2 : occupation moyenne (badge qualitatif, pas de note fictive) -

  const averageOccupation = useMemo(() => {
    if (artistsWithStats.length === 0) return 0;
    const total = artistsWithStats.reduce((sum, a) => sum + a.occupation, 0);
    return Math.round(total / artistsWithStats.length);
  }, [artistsWithStats]);

  const badge = occupationBadge(averageOccupation);

  // --- Carte 3 : artiste le plus sollicité ce mois-ci ----------------------

  const topArtist = useMemo(() => {
    if (artistsWithStats.length === 0) return null;
    return [...artistsWithStats].sort((x, y) => y.sessionsThisMonth - x.sessionsThisMonth)[0];
  }, [artistsWithStats]);

  // --- Pagination -----------------------------------------------------------

  const paginatedArtists = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return artistsWithStats.slice(start, start + PAGE_SIZE);
  }, [artistsWithStats, page]);

  useEffect(() => setPage(1), [query]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="artistes" salonName={salonName} adminName={fullName(user)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title="Administration" />

        <main className="flex-1 px-6 py-8 sm:px-10">
          {loading ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement des artistes…</p>
          ) : (
            <>
              {errorMsg && (
                <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </p>
              )}

              {/* En-tête de page : titre + recherche + action */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl text-[#F4EDE2]"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                  >
                    Gestion des <span className="text-[#C9A24B]">Artistes</span>
                  </h1>
                  <p className="mt-1 text-sm text-[#6b6357]">Gérez vos talents résidents et leurs performances.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full max-w-xs">
                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6357]" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher un artiste..."
                      className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none transition-colors focus:border-[#C9A24B]/60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/artists')}
                    className="flex items-center gap-2 whitespace-nowrap rounded bg-[#C9A24B] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14110F] transition-colors hover:bg-[#dcb864]"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Ajouter un Artiste
                  </button>
                </div>
              </div>

              {/* Cartes de statistiques */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Sessions ce mois"
                  value={sessionsThisMonthTotal}
                  sub={
                    sessionsTrend === null
                      ? 'Pas de données le mois dernier'
                      : `${sessionsTrend >= 0 ? '+' : ''}${sessionsTrend}% vs mois dernier`
                  }
                  subTone={sessionsTrend === null ? 'muted' : sessionsTrend >= 0 ? 'positive' : 'negative'}
                />

                <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8AF9F]">Occupation Moyenne</p>
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-3xl text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                      {averageOccupation}%
                    </p>
                    <span className={`rounded border px-2 py-1 text-[10px] uppercase tracking-wider ${badge.tone}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#C9A24B]" style={{ width: `${averageOccupation}%` }} />
                  </div>
                </div>

                <TopArtistCard artist={topArtist} sessionsCount={topArtist?.sessionsThisMonth || 0} />
              </div>

              {/* Liste des résidents */}
              <div className="mt-8">
                <h2
                  className="mb-4 text-xl text-[#F4EDE2]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                >
                  Liste des <span className="text-[#C9A24B]">Résidents</span>
                </h2>

                <ResidentsTable artists={paginatedArtists} navigate={navigate} now={now} />

                <div className="rounded-b-lg border border-t-0 border-white/10 bg-[#1a1512]">
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={artistsWithStats.length}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(Math.ceil(artistsWithStats.length / PAGE_SIZE), p + 1))}
                    itemLabel="artistes résidents"
                  />
                </div>
              </div>
            </>
          )}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}