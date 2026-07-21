import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  STYLE_LABELS,
  MONTH_LABELS,
  Icon,
  AdminSidebar,
  AdminTopbar,
  DashboardFooter,
  StatCard,
  ArtistsTable,
  fullName,
  initials,
  euros,
  toISODate,
  sameMonth,
  estimatePrice,
  formatTimeRange,
} from './adminUi';

// ---------------------------------------------------------------------------
// Constantes & helpers propres au Tableau de bord
// ---------------------------------------------------------------------------

// Capacité mensuelle de référence utilisée pour estimer le taux d'occupation
// d'un artiste (nb de séances confirmées / SESSIONS_PAR_MOIS_CIBLE).
const SESSIONS_PAR_MOIS_CIBLE = 20;

const ACTIVE_STATUSES = ['confirmed', 'completed'];
const UPCOMING_STATUSES = ['pending', 'confirmed'];

// ---------------------------------------------------------------------------
// Sessions du jour
// ---------------------------------------------------------------------------

function SessionCard({ booking }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#C9A24B]">{formatTimeRange(booking.startTime, booking.durationMinutes)}</span>
        <Icon name="calendar" className="h-3.5 w-3.5 text-[#6b6357]" />
      </div>
      <p className="mt-2 text-sm text-[#F4EDE2]">{fullName(booking.client)}</p>
      {booking.description && (
        <p className="mt-0.5 truncate text-xs italic text-[#B8AF9F]">« {booking.description} »</p>
      )}
      <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#6b6357]">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#C9A24B]/20 text-[8px] font-semibold text-[#C9A24B]">
          {initials(booking.artist?.user?.firstName, booking.artist?.user?.lastName)}
        </div>
        Artiste : {fullName(booking.artist?.user)}
      </div>
    </div>
  );
}

function TodaySessions({ todayBookings, navigate }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
      <h2
        className="text-lg text-[#F4EDE2]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        Sessions du jour
      </h2>

      <div className="mt-4 flex flex-col gap-3">
        {todayBookings.length === 0 ? (
          <p className="rounded-md border border-dashed border-white/10 p-4 text-center text-xs text-[#6b6357]">
            Aucune séance prévue aujourd'hui.
          </p>
        ) : (
          todayBookings.slice(0, 4).map((b) => <SessionCard key={b.id} booking={b} />)
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/dashboard/agenda')}
        className="mt-4 w-full rounded border border-[#C9A24B]/40 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[#C9A24B] transition-colors hover:bg-[#C9A24B]/10"
      >
        Voir l'agenda complet
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analytique globale
// ---------------------------------------------------------------------------

function AnalyticsChart({ monthly, yearly }) {
  const [mode, setMode] = useState('mois');
  const data = mode === 'mois' ? monthly : yearly;
  const max = Math.max(...data.map((d) => d.value), 1);

  const w = 760;
  const h = 200;
  const padX = 24;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const coords = data.map((d, i) => {
    const x = padX + i * step;
    const y = padY + innerH - (d.value / max) * innerH;
    return [x, y];
  });
  const linePoints = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const areaPoints = `${padX},${padY + innerH} ${linePoints} ${padX + innerW},${padY + innerH}`;

  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1512] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className="text-xl text-[#F4EDE2]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Analytique Global
          </h2>
          <p className="mt-1 text-sm text-[#6b6357]">
            {mode === 'mois' ? 'Évolution des réservations sur les 6 derniers mois' : 'Évolution des réservations sur les dernières années'}
          </p>
        </div>
        <div className="flex overflow-hidden rounded border border-white/10 text-[11px] uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMode('mois')}
            className={`px-3 py-1.5 transition-colors ${mode === 'mois' ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'}`}
          >
            Mois
          </button>
          <button
            type="button"
            onClick={() => setMode('annee')}
            className={`px-3 py-1.5 transition-colors ${mode === 'annee' ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'}`}
          >
            Année
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full min-w-[560px]">
          <defs>
            <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#C9A24B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={padX}
              x2={w - padX}
              y1={padY + (innerH / 3) * i}
              y2={padY + (innerH / 3) * i}
              stroke="#ffffff"
              strokeOpacity="0.06"
            />
          ))}

          <polygon points={areaPoints} fill="url(#goldFade)" />
          <polyline points={linePoints} fill="none" stroke="#C9A24B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#14110F" stroke="#C9A24B" strokeWidth="2" />
          ))}

          {data.map((d, i) => (
            <text
              key={d.label}
              x={padX + i * step}
              y={h + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#6b6357"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [clientsCount, setClientsCount] = useState(null);
  const [newClientsThisMonth, setNewClientsThisMonth] = useState(0);
  const [salonName, setSalonName] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Cette page a son propre header/sidebar en plein écran, comme /login.
  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const [bookingsRes, artistsRes, clientsRes, salonsRes] = await Promise.allSettled([
        api.get('/bookings'),
        api.get('/artists'),
        api.get('/users', { params: { role: 'client' } }),
        api.get('/salons'),
      ]);

      if (!isMounted) return;

      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (artistsRes.status === 'fulfilled') setArtists(artistsRes.value.data);

      if (clientsRes.status === 'fulfilled') {
        const clients = clientsRes.value.data;
        const now = new Date();
        setClientsCount(clients.length);
        setNewClientsThisMonth(clients.filter((c) => sameMonth(c.createdAt, now)).length);
      }

      if (salonsRes.status === 'fulfilled' && salonsRes.value.data?.length > 0) {
        setSalonName(salonsRes.value.data[0].name);
      }

      if (bookingsRes.status === 'rejected' && artistsRes.status === 'rejected') {
        setErrorMsg("Impossible de charger les données du dashboard. Vérifiez que l'API est bien lancée.");
      }

      setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Calculs dérivés -----------------------------------------------------

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => toISODate(now), [now]);

  const monthlyRevenue = useMemo(() => {
    return bookings
      .filter((b) => ACTIVE_STATUSES.includes(b.status) && sameMonth(b.date, now))
      .reduce((sum, b) => sum + estimatePrice(b), 0);
  }, [bookings, now]);

  const lastMonthRevenue = useMemo(() => {
    const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return bookings
      .filter((b) => ACTIVE_STATUSES.includes(b.status) && sameMonth(b.date, lastMonthRef))
      .reduce((sum, b) => sum + estimatePrice(b), 0);
  }, [bookings, now]);

  const revenueTrend = useMemo(() => {
    if (lastMonthRevenue === 0) return null;
    return Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
  }, [monthlyRevenue, lastMonthRevenue]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => UPCOMING_STATUSES.includes(b.status) && b.date >= today)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [bookings, today]);

  const todayBookings = useMemo(
    () => upcomingBookings.filter((b) => b.date === today),
    [upcomingBookings, today],
  );

  const last6MonthsRevenue = useMemo(() => {
    const points = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = bookings
        .filter((b) => ACTIVE_STATUSES.includes(b.status) && sameMonth(b.date, ref))
        .reduce((sum, b) => sum + estimatePrice(b), 0);
      points.push(total);
    }
    return points;
  }, [bookings, now]);

  const monthlyAnalytics = useMemo(() => {
    return Array.from({ length: 6 }, (_, idx) => {
      const i = 5 - idx;
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = bookings.filter((b) => sameMonth(b.date, ref)).length;
      return { label: MONTH_LABELS[ref.getMonth()], value: count };
    });
  }, [bookings, now]);

  const yearlyAnalytics = useMemo(() => {
    return Array.from({ length: 5 }, (_, idx) => {
      const year = now.getFullYear() - (4 - idx);
      const count = bookings.filter((b) => new Date(b.date).getFullYear() === year).length;
      return { label: String(year), value: count };
    });
  }, [bookings, now]);

  const artistsWithStats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artists
      .map((a) => {
        const artistBookingsThisMonth = bookings.filter(
          (b) =>
            b.artist?.id === a.id &&
            ACTIVE_STATUSES.includes(b.status) &&
            sameMonth(b.date, now),
        ).length;
        const occupation = Math.min(100, Math.round((artistBookingsThisMonth / SESSIONS_PAR_MOIS_CIBLE) * 100));
        return { ...a, occupation };
      })
      .filter((a) => {
        if (!q) return true;
        const style = STYLE_LABELS[a.styles?.[0]] || '';
        return fullName(a.user).toLowerCase().includes(q) || style.toLowerCase().includes(q);
      });
  }, [artists, bookings, now, query]);

  const filteredTodayBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todayBookings;
    return todayBookings.filter(
      (b) => fullName(b.client).toLowerCase().includes(q) || fullName(b.artist?.user).toLowerCase().includes(q),
    );
  }, [todayBookings, query]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- Rendu -----------------------------------------------------------

  return (
    <div
      className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AdminSidebar active="dashboard" salonName={salonName} adminName={fullName(user)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title="Administration" query={query} setQuery={setQuery} searchPlaceholder="Rechercher session, artiste..." />

        <main className="flex-1 px-6 py-8 sm:px-10">
          {loading ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement du tableau de bord…</p>
          ) : (
            <>
              {errorMsg && (
                <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </p>
              )}

              <h1
                className="mb-1 text-2xl text-[#F4EDE2]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                Bonjour {user?.firstName} 👋
              </h1>
              <p className="mb-6 text-sm text-[#6b6357]">Voici un aperçu de l'activité du salon.</p>

              {/* Cartes de statistiques */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Chiffre d'affaires mensuel"
                  value={euros(monthlyRevenue)}
                  sub={revenueTrend === null ? 'Pas de données le mois dernier' : `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}% vs mois dernier`}
                  subTone={revenueTrend === null ? 'muted' : revenueTrend >= 0 ? 'positive' : 'negative'}
                  sparkline={last6MonthsRevenue}
                />
                <StatCard
                  label="Sessions prévues"
                  value={upcomingBookings.length}
                  sub={`dont ${todayBookings.length} aujourd'hui`}
                />
                <StatCard
                  label="Nouveaux clients"
                  value={newClientsThisMonth}
                  sub={clientsCount !== null ? `${clientsCount} client(s) au total` : 'Ce mois-ci'}
                />
              </div>

              {/* Contenu principal : artistes + sessions du jour */}
              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2
                      className="text-xl text-[#F4EDE2]"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                    >
                      Gestion des Artistes
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/artists')}
                      className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#C9A24B] hover:text-[#dcb864]"
                    >
                      <Icon name="plus" className="h-3.5 w-3.5" />
                      Ajouter
                    </button>
                  </div>
                  <ArtistsTable artists={artistsWithStats} navigate={navigate} />
                </div>

                <TodaySessions todayBookings={filteredTodayBookings} navigate={navigate} />
              </div>

              {/* Analytique globale */}
              <div className="mt-8">
                <AnalyticsChart monthly={monthlyAnalytics} yearly={yearlyAnalytics} />
              </div>
            </>
          )}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
