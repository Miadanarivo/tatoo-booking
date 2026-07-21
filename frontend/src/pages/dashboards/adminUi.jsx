/* eslint-disable react-refresh/only-export-components -- fichier utilitaire partagé (constantes + helpers + composants UI) */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Constantes partagées (identité visuelle "Ink & Gold")
// ---------------------------------------------------------------------------

export const STYLE_LABELS = {
  old_school: 'Old School',
  realisme: 'Réalisme',
  japonais: 'Japonais',
  tribal: 'Tribal',
  minimaliste: 'Minimaliste',
  blackwork: 'Blackwork',
  aquarelle: 'Aquarelle',
  autre: 'Autre',
};

export const BODY_ZONE_LABELS = {
  bras: 'Bras',
  jambe: 'Jambe',
  dos: 'Dos',
  torse: 'Torse',
  main: 'Main',
  cou: 'Cou',
  autre: 'Zone non précisée',
};

export const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  rejected: 'Refusé',
  cancelled: 'Annulé',
  completed: 'Terminé',
};

export const STATUS_STYLES = {
  pending: 'text-[#B8AF9F] bg-white/5 border-white/10',
  confirmed: 'text-[#C9A24B] bg-[#C9A24B]/15 border-[#C9A24B]/30',
  rejected: 'text-red-300 bg-red-500/10 border-red-500/20',
  cancelled: 'text-[#6b6357] bg-white/5 border-white/10',
  completed: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

export const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
export const MONTH_LABELS_FULL = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
export const WEEKDAY_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
export const WEEKDAY_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const WORKING_DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function euros(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
}

export function fullName(user) {
  if (!user) return 'Utilisateur inconnu';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
}

export function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export function sameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function estimatePrice(booking) {
  if (booking.estimatedPrice) return Number(booking.estimatedPrice);
  const rate = Number(booking.artist?.hourlyRate) || 0;
  const hours = (booking.durationMinutes || 60) / 60;
  return rate * hours;
}

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeRange(startTime, durationMinutes = 60) {
  const start = timeToMinutes(startTime);
  const end = start + durationMinutes;
  return `${minutesToTime(start)} — ${minutesToTime(end)}`;
}

export function getWeekDates(ref) {
  const day = ref.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatWeekRangeLabel(weekDates) {
  const start = weekDates[0];
  const end = weekDates[6];
  const sameMonthAndYear = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonthAndYear) {
    return `${start.getDate()} – ${end.getDate()} ${MONTH_LABELS_FULL[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTH_LABELS_FULL[start.getMonth()]} – ${end.getDate()} ${MONTH_LABELS_FULL[end.getMonth()]} ${end.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Icônes (trait fin)
// ---------------------------------------------------------------------------

export const ICON_PATHS = {
  dashboard: 'M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 7h7v9h-7v-9zM4 14h7v6H4v-6z',
  calendar: 'M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z',
  portfolio: 'M4 7l2-3h12l2 3M4 7h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7z M9 11a3 3 0 006 0',
  clients: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16 8a3 3 0 010 6M21 20a6 6 0 00-6-5.6',
  artist: 'M12 3a9 9 0 100 18c1.5 0 1.5-1.5 0-2-1.2 0-1.5-.9-.7-1.8.8-.9.4-2.2-1-2.2H8a3 3 0 01-3-3 6 6 0 016-6 3 3 0 013 3 1.5 1.5 0 003 0A9 9 0 0012 3zM7.5 12a1 1 0 110-2 1 1 0 010 2zm3-4a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2zm3 4a1 1 0 110-2 1 1 0 010 2z',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V19a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H4a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H10a1.7 1.7 0 001-1.55V4a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V10a1.7 1.7 0 001.55 1H20a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  user: 'M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z',
  plus: 'M12 5v14M5 12h14',
  dots: 'M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  trash: 'M4 7h16M9 7V4h6v3m-8 0l1 13a2 2 0 002 2h4a2 2 0 002-2l1-13',
  grid: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
  list: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  image: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM8 11a2 2 0 100-4 2 2 0 000 4zM3 16l5-5 4 4 3-3 6 6',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  filter: 'M4 5h16l-6.5 7.5v6l-3 1.5v-7.5L4 5z',
  sort: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  heart: 'M12 21s-7-4.35-9.5-8.5C.8 9 2 5.5 5.5 5c2-.3 3.5.8 4.5 2.2C11 5.8 12.5 4.7 14.5 5c3.5.5 4.7 4 3 7.5C19 16.65 12 21 12 21z',
};

export function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d={ICON_PATHS[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Titres façon "Playfair Display"
// ---------------------------------------------------------------------------

export function SerifTitle({ as: Tag = 'h2', className = '', children }) {
  return (
    <Tag className={className} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Composants de données réutilisables (StatCard, ArtistsTable)
// Partagés entre AdminDashboard.jsx et AdminArtists.jsx
// ---------------------------------------------------------------------------

export function Sparkline({ points }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const w = 120;
  const h = 36;
  const step = w / (points.length - 1);
  const coords = points
    .map((p, i) => `${i * step},${h - (p / max) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-28 shrink-0">
      <polyline points={coords} fill="none" stroke="#C9A24B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({ label, value, sub, subTone = 'muted', sparkline }) {
  const toneClass = subTone === 'positive' ? 'text-emerald-400' : subTone === 'negative' ? 'text-red-400' : 'text-[#6b6357]';
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8AF9F]">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className="text-3xl text-[#F4EDE2]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {value}
        </p>
        {sparkline && <Sparkline points={sparkline} />}
      </div>
      {sub && <p className={`mt-2 text-xs ${toneClass}`}>{sub}</p>}
    </div>
  );
}

export function ArtistsTable({ artists, navigate }) {
  const [openMenu, setOpenMenu] = useState(null);

  if (artists.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1a1512] p-10 text-center text-sm text-[#6b6357]">
        Aucun artiste ne correspond à votre recherche.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#1a1512]">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">
            <th className="px-5 py-3 font-normal">Artiste</th>
            <th className="px-5 py-3 font-normal">Style</th>
            <th className="px-5 py-3 font-normal">Occupation</th>
            <th className="px-5 py-3 font-normal">Statut</th>
            <th className="px-5 py-3 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((a) => (
            <tr key={a.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/15 text-xs font-semibold text-[#C9A24B]">
                    {initials(a.user?.firstName, a.user?.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[#F4EDE2]">{fullName(a.user)}</p>
                    <p className="truncate text-xs text-[#6b6357]">{a.user?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-[#B8AF9F]">
                  {STYLE_LABELS[a.styles?.[0]] || 'Non renseigné'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#C9A24B]"
                      style={{ width: `${a.occupation}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#B8AF9F]">{a.occupation}%</span>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <span className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wide ${a.isAvailable ? 'text-emerald-400' : 'text-[#6b6357]'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${a.isAvailable ? 'bg-emerald-400' : 'bg-[#6b6357]'}`} />
                  {a.isAvailable ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="relative px-5 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                  className="rounded p-1 text-[#B8AF9F] hover:bg-white/5 hover:text-[#C9A24B]"
                  aria-label="Actions"
                >
                  <Icon name="dots" className="h-4 w-4" />
                </button>
                {openMenu === a.id && (
                  <div className="absolute right-5 z-10 mt-1 w-40 rounded border border-white/10 bg-[#0c0a09] py-1 text-left shadow-lg">
                    <button
                      type="button"
                      onClick={() => navigate(`/artists/${a.id}`)}
                      className="block w-full px-3 py-2 text-xs text-[#B8AF9F] hover:bg-white/5 hover:text-[#F4EDE2]"
                    >
                      Voir le profil
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar (nav admin) — partagée entre Tableau de bord et Agenda
// ---------------------------------------------------------------------------

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard', path: '/dashboard', available: true },
  { key: 'agenda', label: 'Agenda', icon: 'calendar', path: '/dashboard/agenda', available: true },
  { key: 'artistes', label: 'Artistes', icon: 'artist', path: '/artists', available: true },
  { key: 'portfolio', label: 'Portfolio', icon: 'portfolio', path: '/dashboard/portfolio', available: true },
  { key: 'clients', label: 'Clients', icon: 'clients', path: '/dashboard/clients', available: true },
  { key: 'parametres', label: 'Paramètres', icon: 'settings', path: '/dashboard/settings', available: true },
];

export function AdminSidebar({ active, salonName, adminName, onLogout }) {
  const navigate = useNavigate();

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-[#0c0a09] px-5 py-6 lg:flex">
      <div>
        <div
          className="text-xl text-[#F4EDE2]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          INK <span className="text-[#C9A24B]">&amp;</span> GOLD
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#6b6357]">
          Manager Dashboard
        </p>

        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.available ? (
              <button
                key={item.key}
                type="button"
                onClick={() => item.path && navigate(item.path)}
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

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A24B]/20 text-xs font-semibold text-[#C9A24B]">
            {initials(adminName?.split(' ')[0], adminName?.split(' ')[1])}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-[#F4EDE2]">{salonName || 'Mon Salon'}</p>
            <p className="truncate text-[11px] text-[#6b6357]">Compte Administrateur</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-[#B8AF9F] transition-colors hover:bg-white/5 hover:text-[#C9A24B]"
        >
          <Icon name="logout" className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Topbar générique
// ---------------------------------------------------------------------------

export function AdminTopbar({ title, query, setQuery, searchPlaceholder = 'Rechercher...' }) {
  const navigate = useNavigate();
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#14110F] px-6 py-5 sm:px-10">
      <h1
        className="text-lg uppercase tracking-[0.2em] text-[#F4EDE2]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {title}
      </h1>

      <div className="flex flex-1 items-center gap-4 sm:justify-end">
        {setQuery && (
          <div className="relative w-full max-w-xs">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6357]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none transition-colors focus:border-[#C9A24B]/60"
            />
          </div>
        )}

        <button type="button" aria-label="Notifications" className="text-[#B8AF9F] hover:text-[#C9A24B]">
          <Icon name="bell" className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Profil" className="text-[#B8AF9F] hover:text-[#C9A24B]">
          <Icon name="user" className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/artists')}
          className="whitespace-nowrap rounded bg-[#C9A24B] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14110F] transition-colors hover:bg-[#dcb864]"
        >
          Réserver
        </button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export function DashboardFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0c0a09] px-6 py-10 text-center sm:px-10">
      <p
        className="text-lg text-[#F4EDE2]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        INK <span className="text-[#C9A24B]">&amp;</span> GOLD
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#B8AF9F]">
        <span className="cursor-default hover:text-[#C9A24B]">Mentions légales</span>
        <span className="cursor-default hover:text-[#C9A24B]">Confidentialité</span>
        <span className="cursor-default hover:text-[#C9A24B]">Contact</span>
        <span className="cursor-default hover:text-[#C9A24B]">FAQ</span>
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#6b6357]">
        © {new Date().getFullYear()} Ink &amp; Gold — Haute Couture du Tatouage
      </p>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Composants pour la page "Gestion des Artistes" (design résidents/performance)
// ---------------------------------------------------------------------------

export function occupationBadge(occupation) {
  if (occupation >= 80) return { label: 'Excellent', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' };
  if (occupation >= 50) return { label: 'Bon', tone: 'text-[#C9A24B] bg-[#C9A24B]/10 border-[#C9A24B]/25' };
  return { label: 'À surveiller', tone: 'text-red-300 bg-red-500/10 border-red-500/20' };
}

export function formatRelativeDate(dateStr, now) {
  const d = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target - today) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  return `${WEEKDAY_FULL[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
}

export function TopArtistCard({ artist, sessionsCount }) {
  if (!artist) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-white/10 bg-[#1a1512] p-5 text-xs text-[#6b6357]">
        Pas encore assez de données ce mois-ci.
      </div>
    );
  }
  const topStyle = STYLE_LABELS[artist.styles?.[0]] || 'Style non renseigné';
  return (
    <div className="rounded-lg border border-[#C9A24B]/30 bg-[#1a1512] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8AF9F]">Artiste le plus sollicité</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/15 text-base font-semibold text-[#C9A24B]">
          {initials(artist.user?.firstName, artist.user?.lastName)}
        </div>
        <div className="min-w-0">
          <p
            className="truncate text-lg text-[#F4EDE2]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            {fullName(artist.user)}
          </p>
          <p className="truncate text-xs text-[#C9A24B]">Spécialité : {topStyle}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#6b6357]">{sessionsCount} session{sessionsCount > 1 ? 's' : ''} ce mois-ci</p>
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPrev, onNext, itemLabel = 'éléments' }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-xs text-[#6b6357]">
      <span>
        Affichage de {start}-{end} sur {total} {itemLabel}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className="rounded border border-white/10 px-3 py-1.5 text-[#B8AF9F] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Précédent
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded border border-[#C9A24B]/40 bg-[#C9A24B]/10 px-3 py-1.5 text-[#C9A24B] transition-colors hover:bg-[#C9A24B]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export function ResidentsTable({ artists, navigate, now }) {
  const [openMenu, setOpenMenu] = useState(null);

  if (artists.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1a1512] p-10 text-center text-sm text-[#6b6357]">
        Aucun artiste ne correspond à votre recherche.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#1a1512]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">
            <th className="px-5 py-3 font-normal">Artiste</th>
            <th className="px-5 py-3 font-normal">Spécialités</th>
            <th className="px-5 py-3 font-normal">Statut</th>
            <th className="px-5 py-3 font-normal">Prochain RDV</th>
            <th className="px-5 py-3 font-normal">Performance</th>
            <th className="px-5 py-3 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((a) => (
            <tr key={a.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/15 text-xs font-semibold text-[#C9A24B]">
                    {initials(a.user?.firstName, a.user?.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[#F4EDE2]">{fullName(a.user)}</p>
                    <p className="truncate text-xs text-[#6b6357]">{a.user?.email}</p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {(a.styles?.length ? a.styles.slice(0, 2) : ['autre']).map((s) => (
                    <span
                      key={s}
                      className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-[#B8AF9F]"
                    >
                      {STYLE_LABELS[s] || 'Non renseigné'}
                    </span>
                  ))}
                </div>
              </td>

              <td className="px-5 py-3.5">
                <span className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wide ${a.liveStatus.tone}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${a.liveStatus.dot}`} />
                  {a.liveStatus.label}
                </span>
              </td>

              <td className="px-5 py-3.5">
                {a.nextBooking ? (
                  <div className="text-xs">
                    <p className="text-[#F4EDE2]">
                      {formatRelativeDate(a.nextBooking.date, now)}, {a.nextBooking.startTime?.slice(0, 5)}
                    </p>
                    <p className="text-[#6b6357]">{BODY_ZONE_LABELS[a.nextBooking.bodyZone] || a.nextBooking.bodyZone}</p>
                  </div>
                ) : (
                  <span className="text-xs text-[#6b6357]">Aucun RDV prévu</span>
                )}
              </td>

              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#C9A24B]" style={{ width: `${a.occupation}%` }} />
                  </div>
                  <span className="text-xs text-[#B8AF9F]">{a.occupation}%</span>
                </div>
              </td>

              <td className="relative px-5 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                  className="rounded p-1 text-[#B8AF9F] hover:bg-white/5 hover:text-[#C9A24B]"
                  aria-label="Actions"
                >
                  <Icon name="dots" className="h-4 w-4" />
                </button>
                {openMenu === a.id && (
                  <div className="absolute right-5 z-10 mt-1 w-40 rounded border border-white/10 bg-[#0c0a09] py-1 text-left shadow-lg">
                    <button
                      type="button"
                      onClick={() => navigate(`/artists/${a.id}`)}
                      className="block w-full px-3 py-2 text-xs text-[#B8AF9F] hover:bg-white/5 hover:text-[#F4EDE2]"
                    >
                      Voir le profil
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}