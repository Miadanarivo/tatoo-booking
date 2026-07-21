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
  euros,
  toISODate,
  estimatePrice,
  timeToMinutes,
  minutesToTime,
  formatTimeRange,
  getWeekDates,
  formatWeekRangeLabel,
  STATUS_LABELS,
  STATUS_STYLES,
  BODY_ZONE_LABELS,
  STYLE_LABELS,
  WEEKDAY_SHORT,
  WEEKDAY_FULL,
  WORKING_DAY_KEYS,
} from './adminUi';

// ---------------------------------------------------------------------------
// Config de la grille horaire
// ---------------------------------------------------------------------------

const AGENDA_START_HOUR = 8;
const AGENDA_END_HOUR = 21; // fin de grille (exclue)
const PX_PER_MIN = 1.15;
const GRID_TOTAL_MIN = (AGENDA_END_HOUR - AGENDA_START_HOUR) * 60;
const GRID_HEIGHT = GRID_TOTAL_MIN * PX_PER_MIN;
const SLOT_MINUTES = 30; // granularité minimale pour un créneau disponible

// Statuts pris en compte pour bloquer un créneau (une résa annulée/refusée libère la place)
const BLOCKING_STATUSES = ['pending', 'confirmed', 'completed'];

// Couleur de la barre latérale du bloc de session, par statut
const STATUS_BAR_COLOR = {
  pending: 'bg-[#6b6357]',
  confirmed: 'bg-[#C9A24B]',
  completed: 'bg-emerald-500',
  rejected: 'bg-red-500/60',
  cancelled: 'bg-white/15',
};

function dayIndexMonToSun(date) {
  return (date.getDay() + 6) % 7; // 0 = lundi ... 6 = dimanche
}

// Calcule le prochain créneau libre pour un artiste donné, à une date donnée
function computeNextAvailableSlot(artist, date, bookingsThatDay, now) {
  if (!artist) return { status: 'no-artist' };

  const dayKey = WORKING_DAY_KEYS[dayIndexMonToSun(date)];
  const hours = artist.workingHours?.[dayKey];
  if (!hours) return { status: 'closed', dayLabel: WEEKDAY_FULL[dayIndexMonToSun(date)] };

  const dayStart = timeToMinutes(hours.start);
  const dayEnd = timeToMinutes(hours.end);

  const isToday = toISODate(date) === toISODate(now);
  let cursor = dayStart;
  if (isToday) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const roundedUp = Math.ceil(nowMin / SLOT_MINUTES) * SLOT_MINUTES;
    cursor = Math.max(dayStart, roundedUp);
  }

  const busy = bookingsThatDay
    .filter((b) => BLOCKING_STATUSES.includes(b.status))
    .map((b) => {
      const s = timeToMinutes(b.startTime);
      return [s, s + (b.durationMinutes || 60)];
    })
    .sort((a, b) => a[0] - b[0]);

  for (const [busyStart, busyEnd] of busy) {
    if (busyStart >= cursor + SLOT_MINUTES) break; // il y a un trou avant cette résa
    if (busyEnd > cursor) cursor = busyEnd;
  }

  if (cursor + SLOT_MINUTES <= dayEnd) {
    return { status: 'available', time: minutesToTime(cursor) };
  }
  return { status: 'full' };
}

// ---------------------------------------------------------------------------
// Bloc de session dans la grille
// ---------------------------------------------------------------------------

function BookingBlock({ booking, onSelect, isSelected }) {
  const start = timeToMinutes(booking.startTime);
  const duration = booking.durationMinutes || 60;
  const top = (start - AGENDA_START_HOUR * 60) * PX_PER_MIN;
  const height = Math.max(duration * PX_PER_MIN, 34);
  const isMuted = booking.status === 'cancelled' || booking.status === 'rejected';

  return (
    <button
      type="button"
      onClick={() => onSelect(booking)}
      style={{ top: `${top}px`, height: `${height}px` }}
      className={`absolute left-1 right-1 overflow-hidden rounded-md border border-white/10 bg-[#211b16] px-2 py-1 text-left transition-all hover:z-10 hover:border-[#C9A24B]/50 ${
        isSelected ? 'ring-1 ring-[#C9A24B]' : ''
      } ${isMuted ? 'opacity-45' : ''}`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${STATUS_BAR_COLOR[booking.status] || 'bg-white/20'}`} />
      <p className={`truncate text-[10px] font-medium ${isMuted ? 'text-[#6b6357] line-through' : 'text-[#C9A24B]'}`}>
        {formatTimeRange(booking.startTime, duration)}
      </p>
      <p className="truncate text-xs text-[#F4EDE2]">{fullName(booking.client)}</p>
      {height > 50 && (
        <p className="truncate text-[10px] text-[#B8AF9F]">
          {BODY_ZONE_LABELS[booking.bodyZone] || booking.bodyZone}
        </p>
      )}
      {height > 70 && (
        <p className="truncate text-[9px] uppercase tracking-wide text-[#6b6357]">
          Artiste : {fullName(booking.artist?.user)}
        </p>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Colonne de jour
// ---------------------------------------------------------------------------

function DayColumn({ date, bookings, isToday, isSelected, onSelectDay, selectedBooking, onSelectBooking }) {
  return (
    <div className="flex min-w-[130px] flex-1 flex-col border-r border-white/5 last:border-r-0">
      <button
        type="button"
        onClick={() => onSelectDay(date)}
        className={`flex flex-col items-center gap-0.5 border-b border-white/10 py-2.5 transition-colors ${
          isSelected ? 'bg-[#C9A24B] text-[#14110F]' : isToday ? 'text-[#C9A24B]' : 'text-[#B8AF9F] hover:bg-white/5'
        }`}
      >
        <span className="text-[10px] uppercase tracking-[0.15em]">{WEEKDAY_SHORT[dayIndexMonToSun(date)]}</span>
        <span
          className="text-base"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {date.getDate()}
        </span>
      </button>

      <div className="relative flex-1" style={{ height: `${GRID_HEIGHT}px` }}>
        {bookings.map((b) => (
          <BookingBlock
            key={b.id}
            booking={b}
            onSelect={onSelectBooking}
            isSelected={selectedBooking?.id === b.id}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panneau latéral droit
// ---------------------------------------------------------------------------

function SelectedBookingCard({ booking }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
        <Icon name="dots" className="h-4 w-4 text-[#6b6357]" />
      </div>
      <p className="mt-3 text-base text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        {fullName(booking.client)}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#B8AF9F]">
        <Icon name="clock" className="h-3.5 w-3.5" />
        {formatTimeRange(booking.startTime, booking.durationMinutes)} ({Math.round((booking.durationMinutes || 60) / 60)}h)
      </p>
      <p className="mt-1 text-xs text-[#B8AF9F]">
        {BODY_ZONE_LABELS[booking.bodyZone] || booking.bodyZone}
        {booking.description ? ` — « ${booking.description} »` : ''}
      </p>
      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A24B]/20 text-[10px] font-semibold text-[#C9A24B]">
          {initials(booking.artist?.user?.firstName, booking.artist?.user?.lastName)}
        </div>
        <span className="text-xs text-[#B8AF9F]">{fullName(booking.artist?.user)}</span>
      </div>
    </div>
  );
}

function NextSlotPanel({ selectedArtist, slot }) {
  if (!selectedArtist) {
    return (
      <div className="rounded-md border border-dashed border-white/10 p-4 text-center text-xs text-[#6b6357]">
        Sélectionnez un artiste pour voir sa prochaine disponibilité.
      </div>
    );
  }
  if (slot.status === 'available') {
    return (
      <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Prochain créneau disponible</p>
          <p className="mt-1 text-lg text-[#C9A24B]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {slot.time}
          </p>
        </div>
        <Icon name="clock" className="h-5 w-5 text-[#C9A24B]" />
      </div>
    );
  }
  const message = slot.status === 'closed' ? `${selectedArtist ? fullName(selectedArtist.user) : 'Artiste'} ne travaille pas ce jour-là.` : 'Plus aucun créneau disponible ce jour-là.';
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-xs text-[#B8AF9F]">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function AdminAgenda() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [salonName, setSalonName] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [query, setQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('all');
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewMode, setViewMode] = useState('semaine');

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
      const [bookingsRes, artistsRes, salonsRes] = await Promise.allSettled([
        api.get('/bookings'),
        api.get('/artists'),
        api.get('/salons'),
      ]);

      if (!isMounted) return;

      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (artistsRes.status === 'fulfilled') setArtists(artistsRes.value.data);
      if (salonsRes.status === 'fulfilled' && salonsRes.value.data?.length > 0) {
        setSalonName(salonsRes.value.data[0].name);
      }
      if (bookingsRes.status === 'rejected' && artistsRes.status === 'rejected') {
        setErrorMsg("Impossible de charger l'agenda. Vérifiez que l'API est bien lancée.");
      }
      setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const selectedIso = toISODate(selectedDate);
  const todayIso = toISODate(now);

  const selectedArtist = useMemo(
    () => artists.find((a) => a.id === selectedArtistId) || null,
    [artists, selectedArtistId],
  );

  const filteredArtists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter(
      (a) => fullName(a.user).toLowerCase().includes(q) || (STYLE_LABELS[a.styles?.[0]] || '').toLowerCase().includes(q),
    );
  }, [artists, query]);

  // Réservations visibles dans la semaine affichée, filtrées par artiste + recherche
  const scopedBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (selectedArtistId !== 'all' && b.artist?.id !== selectedArtistId) return false;
      if (q && !fullName(b.client).toLowerCase().includes(q) && !fullName(b.artist?.user).toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [bookings, selectedArtistId, query]);

  const bookingsByDay = useMemo(() => {
    const map = {};
    weekDates.forEach((d) => {
      const iso = toISODate(d);
      map[iso] = scopedBookings
        .filter((b) => b.date === iso)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [scopedBookings, weekDates]);

  const selectedDayBookings = useMemo(
    () => bookingsByDay[selectedIso] || [],
    [bookingsByDay, selectedIso],
  );

  const nextRelevantBooking = useMemo(() => {
    const upcoming = selectedDayBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
    if (selectedIso === todayIso) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const later = upcoming.find((b) => timeToMinutes(b.startTime) + (b.durationMinutes || 60) >= nowMin);
      return later || upcoming[0] || null;
    }
    return upcoming[0] || null;
  }, [selectedDayBookings, selectedIso, todayIso, now]);

  const nextSlot = useMemo(
    () => computeNextAvailableSlot(selectedArtist, selectedDate, selectedDayBookings, now),
    [selectedArtist, selectedDate, selectedDayBookings, now],
  );

  const dayStats = useMemo(() => {
    const confirmedOrDone = selectedDayBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    const revenue = confirmedOrDone.reduce((sum, b) => sum + estimatePrice(b), 0);
    return { sessions: selectedDayBookings.filter((b) => b.status !== 'cancelled' && b.status !== 'rejected').length, revenue };
  }, [selectedDayBookings]);

  const displayedCard = selectedBooking && selectedDayBookings.some((b) => b.id === selectedBooking.id)
    ? selectedBooking
    : nextRelevantBooking;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToWeek = (offsetWeeks) => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + offsetWeeks * 7);
    setWeekAnchor(d);
    // Garde le même jour de la semaine sélectionné si possible
    const newWeekDates = getWeekDates(d);
    const idx = dayIndexMonToSun(selectedDate);
    setSelectedDate(newWeekDates[idx]);
    setSelectedBooking(null);
  };

  const panelTitle = selectedIso === todayIso ? "Aujourd'hui" : WEEKDAY_FULL[dayIndexMonToSun(selectedDate)];

  return (
    <div className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="agenda" salonName={salonName} adminName={fullName(user)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title="Agenda Hebdomadaire" query={query} setQuery={setQuery} searchPlaceholder="Rechercher client, artiste..." />

        <main className="flex-1 px-6 py-8 sm:px-10">
          {loading ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement de l'agenda…</p>
          ) : (
            <>
              {errorMsg && (
                <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </p>
              )}

              {/* Barre de contrôle : navigation semaine + sélecteur artiste + vue */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToWeek(-1)}
                    className="rounded-full border border-white/10 p-1.5 text-[#B8AF9F] hover:border-[#C9A24B]/50 hover:text-[#C9A24B]"
                    aria-label="Semaine précédente"
                  >
                    <Icon name="chevronLeft" className="h-4 w-4" />
                  </button>
                  <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-[#F4EDE2]">
                    {formatWeekRangeLabel(weekDates)}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToWeek(1)}
                    className="rounded-full border border-white/10 p-1.5 text-[#B8AF9F] hover:border-[#C9A24B]/50 hover:text-[#C9A24B]"
                    aria-label="Semaine suivante"
                  >
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedArtistId}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#F4EDE2] outline-none focus:border-[#C9A24B]/60"
                  >
                    <option value="all">Tous les artistes</option>
                    {filteredArtists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {fullName(a.user)}
                      </option>
                    ))}
                  </select>

                  <div className="flex overflow-hidden rounded border border-white/10 text-[11px] uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => setViewMode('semaine')}
                      className={`px-3 py-2 transition-colors ${viewMode === 'semaine' ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'}`}
                    >
                      Semaine
                    </button>
                    <button
                      type="button"
                      title="Bientôt disponible"
                      onClick={() => setViewMode('mois')}
                      className={`px-3 py-2 transition-colors ${viewMode === 'mois' ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'}`}
                    >
                      Mois
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'mois' ? (
                <div className="rounded-lg border border-dashed border-white/10 bg-[#1a1512] p-12 text-center text-sm text-[#6b6357]">
                  La vue mensuelle arrive bientôt. Reste en vue « Semaine » pour le moment.
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                  {/* Grille hebdomadaire */}
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-[#1a1512]">
                    <div className="flex">
                      {/* Gouttière des heures */}
                      <div className="w-12 shrink-0 border-r border-white/5">
                        <div className="h-[54px] border-b border-white/10" />
                        <div className="relative" style={{ height: `${GRID_HEIGHT}px` }}>
                          {Array.from({ length: AGENDA_END_HOUR - AGENDA_START_HOUR + 1 }, (_, i) => AGENDA_START_HOUR + i)
                            .filter((h) => h % 2 === 0)
                            .map((h) => (
                              <span
                                key={h}
                                style={{ top: `${(h - AGENDA_START_HOUR) * 60 * PX_PER_MIN - 6}px` }}
                                className="absolute right-2 text-[10px] text-[#6b6357]"
                              >
                                {h}h
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="flex flex-1 overflow-x-auto">
                        {weekDates.map((date) => {
                          const iso = toISODate(date);
                          return (
                            <DayColumn
                              key={iso}
                              date={date}
                              bookings={bookingsByDay[iso] || []}
                              isToday={iso === todayIso}
                              isSelected={iso === selectedIso}
                              onSelectDay={(d) => {
                                setSelectedDate(d);
                                setSelectedBooking(null);
                              }}
                              selectedBooking={selectedBooking}
                              onSelectBooking={setSelectedBooking}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Panneau latéral */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <SerifTitle as="h2" className="mb-3 text-lg text-[#F4EDE2]">
                        {panelTitle}
                      </SerifTitle>
                      {displayedCard ? (
                        <SelectedBookingCard booking={displayedCard} />
                      ) : (
                        <div className="rounded-md border border-dashed border-white/10 p-4 text-center text-xs text-[#6b6357]">
                          Aucune séance ce jour-là.
                        </div>
                      )}
                    </div>

                    <NextSlotPanel selectedArtist={selectedArtist} slot={nextSlot} />

                    <div>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-[#B8AF9F]">Statistiques du jour</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md border border-white/10 bg-[#1a1512] p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-[#6b6357]">Sessions</p>
                          <p className="mt-1 text-2xl text-[#C9A24B]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                            {String(dayStats.sessions).padStart(2, '0')}
                          </p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-[#1a1512] p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-[#6b6357]">Chiffre</p>
                          <p className="mt-1 text-2xl text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                            {euros(dayStats.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#C9A24B]/20 bg-[#C9A24B]/5 p-4">
                      <p className="text-sm text-[#C9A24B]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                        Aide &amp; Support
                      </p>
                      <p className="mt-1 text-xs text-[#B8AF9F]">
                        Besoin d'aide pour gérer les réservations ?
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-xs font-semibold text-[#C9A24B] hover:text-[#dcb864]"
                      >
                        Contacter le support
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
