import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Icon,
  STYLE_LABELS,
  BODY_ZONE_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
  fullName,
  initials,
  toISODate,
  formatTimeRange,
  MONTH_LABELS_FULL,
} from './adminUi';

// ---------------------------------------------------------------------------
// Nav sidebar client
// ---------------------------------------------------------------------------

const CLIENT_NAV_ITEMS = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard', available: true },
  { key: 'projets', label: 'Mes Projets', icon: 'portfolio', available: true },
  { key: 'agenda', label: 'Agenda', icon: 'calendar', available: false },
  { key: 'favoris', label: 'Favoris', icon: 'heart', available: false },
  { key: 'parametres', label: 'Paramètres', icon: 'settings', available: false },
];

function ClientSidebar({ active, onNavigate, onNewRequest }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-[#0c0a09] px-5 py-6 lg:flex">
      <div>
        <div
          className="text-xl leading-tight text-[#F4EDE2]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          INK <span className="text-[#C9A24B]">&amp;</span> GOLD
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#6b6357]">
          Excellence in Art
        </p>

        <nav className="mt-10 flex flex-col gap-1">
          {CLIENT_NAV_ITEMS.map((item) =>
            item.available ? (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                  active === item.key
                    ? 'bg-[#C9A24B]/15 text-[#F4EDE2]'
                    : 'text-[#B8AF9F] hover:bg-white/5 hover:text-[#F4EDE2]'
                }`}
              >
                <Icon name={item.icon} className={`h-4.5 w-4.5 ${active === item.key ? 'text-[#C9A24B]' : ''}`} />
                {item.label}
              </button>
            ) : (
              <button
                key={item.key}
                type="button"
                title="Bientôt disponible"
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm text-[#B8AF9F] transition-colors hover:bg-white/5 hover:text-[#F4EDE2]"
              >
                <span className="flex items-center gap-3">
                  <Icon name={item.icon} className="h-4.5 w-4.5" />
                  {item.label}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#6b6357]">bientôt</span>
              </button>
            ),
          )}
        </nav>
      </div>

      <button
        type="button"
        onClick={onNewRequest}
        className="w-full rounded bg-[#C9A24B] py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14110F] transition-colors hover:bg-[#dcb864]"
      >
        New Request
      </button>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------------

function ClientTopbar({ user, query, setQuery }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#14110F] px-6 py-5 sm:px-10">
      <div className="relative w-full max-w-md">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6357]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un projet, un artiste..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none transition-colors focus:border-[#C9A24B]/60"
        />
      </div>

      <div className="flex items-center gap-4">
        <button type="button" aria-label="Notifications" className="text-[#B8AF9F] hover:text-[#C9A24B]">
          <Icon name="bell" className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Historique" className="text-[#B8AF9F] hover:text-[#C9A24B]">
          <Icon name="clock" className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="hidden text-xs uppercase tracking-wider text-[#F4EDE2] sm:inline">
            {user?.firstName} {user?.lastName?.charAt(0)}.
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A24B]/20 text-xs font-semibold text-[#C9A24B]">
            {initials(user?.firstName, user?.lastName)}
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Carte "Prochaine séance"
// ---------------------------------------------------------------------------

function formatFrenchDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_LABELS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function NextSessionCard({ booking, navigate }) {
  if (!booking) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1a1512] p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Prochaine séance</p>
        <p className="mt-4 text-sm text-[#B8AF9F]">
          Aucune séance à venir pour le moment.
        </p>
        <button
          type="button"
          onClick={() => navigate('/artists')}
          className="mt-6 w-full rounded border border-white/15 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[#F4EDE2] transition-colors hover:border-[#C9A24B]/50 hover:text-[#C9A24B]"
        >
          Réserver une séance
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-white/10 bg-[#1a1512] p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A24B]">Prochaine séance</p>
        <Icon name="calendar" className="h-5 w-5 text-[#6b6357]" />
      </div>

      <h3
        className="mt-3 text-xl text-[#F4EDE2]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {booking.description || 'Projet de tatouage'}
      </h3>
      <p className="mt-1 text-sm text-[#B8AF9F]">
        Avec <span className="text-[#F4EDE2]">{fullName(booking.artist?.user)}</span>
      </p>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-sm text-[#F4EDE2]">
          <Icon name="calendar" className="h-4 w-4 text-[#C9A24B]" />
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#6b6357]">Date</p>
            {formatFrenchDate(booking.date)}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#F4EDE2]">
          <Icon name="clock" className="h-4 w-4 text-[#C9A24B]" />
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#6b6357]">Heure</p>
            {formatTimeRange(booking.startTime, booking.durationMinutes)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-6 w-full rounded border border-white/15 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[#F4EDE2] transition-colors hover:border-[#C9A24B]/50 hover:text-[#C9A24B]"
      >
        Voir les détails
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carte projet (liste "Mes Projets en Cours")
// ---------------------------------------------------------------------------

function ProjectRow({ booking }) {
  const styleLabel = STYLE_LABELS[booking.artist?.styles?.[0]] || 'Style non renseigné';
  const zoneLabel = BODY_ZONE_LABELS[booking.bodyZone] || booking.bodyZone;

  return (
    <div className="flex items-center gap-4 border-b border-white/5 py-4 last:border-b-0">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white/5">
        {booking.referenceImageUrl ? (
          <img src={booking.referenceImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#6b6357]">
            <Icon name="image" className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#F4EDE2]">{booking.description || 'Projet de tatouage'}</p>
        <p className="truncate text-xs text-[#6b6357]">
          Style : {styleLabel} · {zoneLabel}
        </p>
      </div>
      <span className={`shrink-0 rounded border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
        {booking.status === 'pending' ? 'En attente de validation' : STATUS_LABELS[booking.status]}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data } = await api.get('/bookings/me');
        if (isMounted) setBookings(data);
      } catch (err) {
        if (isMounted) setErrorMsg('Impossible de charger vos réservations.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const today = useMemo(() => toISODate(new Date()), []);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        (b.description || '').toLowerCase().includes(q) ||
        fullName(b.artist?.user).toLowerCase().includes(q),
    );
  }, [bookings, query]);

  const nextBooking = useMemo(() => {
    return filteredBookings
      .filter((b) => ['pending', 'confirmed'].includes(b.status) && b.date >= today)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
  }, [filteredBookings, today]);

  const activeProjects = useMemo(() => {
    return filteredBookings
      .filter((b) => ['pending', 'confirmed'].includes(b.status))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [filteredBookings]);

  const inspirations = useMemo(
    () => bookings.filter((b) => b.referenceImageUrl).slice(0, 4),
    [bookings],
  );

  const stats = useMemo(() => {
    const relevant = bookings.filter((b) => ['confirmed', 'completed'].includes(b.status));
    const inkHours = relevant.reduce((sum, b) => sum + (b.durationMinutes || 60), 0) / 60;
    const distinctArtists = new Set(bookings.map((b) => b.artist?.id).filter(Boolean));
    return {
      inkHours: Math.round(inkHours),
      sessions: relevant.length,
      artists: distinctArtists.size,
    };
  }, [bookings]);

  const handleNewRequest = () => navigate('/artists');

  return (
    <div className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ClientSidebar active="dashboard" onNavigate={() => {}} onNewRequest={handleNewRequest} />

      <div className="flex min-h-screen flex-1 flex-col">
        <ClientTopbar user={user} query={query} setQuery={setQuery} />

        <main className="flex-1 px-6 py-8 sm:px-10">
          {loading ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement de votre espace…</p>
          ) : (
            <>
              {errorMsg && (
                <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </p>
              )}

              <h1
                className="text-2xl text-[#F4EDE2] sm:text-3xl"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                Bienvenue, {user?.firstName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#B8AF9F]">
                Votre voyage artistique continue. Voici un aperçu de vos séances à venir et de vos chefs-d'œuvre en cours de création.
              </p>

              <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
                <NextSessionCard booking={nextBooking} navigate={navigate} />

                <div className="rounded-lg border border-white/10 bg-[#1a1512] p-6">
                  <div className="flex items-center justify-between">
                    <h2
                      className="text-lg text-[#F4EDE2]"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                    >
                      Mes Projets en Cours
                    </h2>
                    {activeProjects.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setShowAllProjects((v) => !v)}
                        className="text-[10px] uppercase tracking-[0.2em] text-[#C9A24B] hover:text-[#dcb864]"
                      >
                        {showAllProjects ? 'Réduire' : 'Tout voir'}
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    {activeProjects.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#6b6357]">
                        Aucun projet en cours. Lancez votre prochaine idée !
                      </p>
                    ) : (
                      (showAllProjects ? activeProjects : activeProjects.slice(0, 2)).map((b) => (
                        <ProjectRow key={b.id} booking={b} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
                  <Icon name="clock" className="h-5 w-5 text-[#C9A24B]" />
                  <p className="mt-3 text-3xl text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    {String(stats.inkHours).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#B8AF9F]">Heures d'encre</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
                  <Icon name="calendar" className="h-5 w-5 text-[#C9A24B]" />
                  <p className="mt-3 text-3xl text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    {String(stats.sessions).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#B8AF9F]">Séances</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
                  <Icon name="clients" className="h-5 w-5 text-[#C9A24B]" />
                  <p className="mt-3 text-3xl text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    {String(stats.artists).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#B8AF9F]">Artistes</p>
                </div>
              </div>

              {/* Inspirations enregistrées */}
              <div className="mt-10 border-t border-white/10 pt-6">
                <h2
                  className="mb-4 text-lg text-[#F4EDE2]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                >
                  Inspirations Enregistrées
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {inspirations.map((b) => (
                    <div key={b.id} className="aspect-square overflow-hidden rounded-md bg-white/5">
                      <img src={b.referenceImageUrl} alt={b.description || 'Inspiration'} className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleNewRequest}
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 text-[#6b6357] transition-colors hover:border-[#C9A24B]/50 hover:text-[#C9A24B]"
                  >
                    <Icon name="plus" className="h-5 w-5" />
                    <span className="text-[10px] uppercase tracking-wider">Ajouter</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}