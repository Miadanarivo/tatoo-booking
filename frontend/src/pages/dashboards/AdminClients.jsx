import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  STYLE_LABELS,
  BODY_ZONE_LABELS,
  Icon,
  AdminSidebar,
  AdminTopbar,
  DashboardFooter,
  fullName,
  initials,
} from './adminUi';

const PAGE_SIZE = 8;

function ClientRow({ client, expanded, onToggleHistory, onCopyEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lastBooking, totalBookings, styleLabel, bookings } = client;

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/15 text-xs font-semibold text-[#C9A24B]">
            {initials(client.firstName, client.lastName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-[#F4EDE2]">{fullName(client)}</p>
            <p className="truncate text-[10px] uppercase tracking-wider text-[#C9A24B]/80">
              {styleLabel}
            </p>
          </div>
        </div>

        <div className="min-w-[180px] flex-1 text-xs">
          <p className="truncate text-[#F4EDE2]">{client.email}</p>
          {client.phone && <p className="text-[#6b6357]">{client.phone}</p>}
        </div>

        <div className="min-w-[150px] flex-1 text-xs">
          {lastBooking ? (
            <>
              <p className="text-[#F4EDE2]">
                {new Date(lastBooking.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider text-[#6b6357]">
                {BODY_ZONE_LABELS[lastBooking.bodyZone] || lastBooking.bodyZone}
              </p>
            </>
          ) : (
            <p className="text-[#6b6357]">Aucune réservation</p>
          )}
        </div>

        <div className="min-w-[110px]">
          <span className="rounded border border-[#C9A24B]/30 bg-[#C9A24B]/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#C9A24B]">
            {String(totalBookings).padStart(2, '0')} session{totalBookings > 1 ? 's' : ''}
          </span>
        </div>

        <div className="relative flex items-center gap-3 text-[#B8AF9F]">
          <button
            type="button"
            title="Modifier — bientôt disponible"
            className="cursor-not-allowed opacity-40 hover:text-[#C9A24B]"
          >
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleHistory(client.id)}
            title="Voir l'historique"
            className="hover:text-[#C9A24B]"
          >
            <Icon name="clock" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Actions"
            className="hover:text-[#C9A24B]"
          >
            <Icon name="dots" className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-10 w-44 rounded border border-white/10 bg-[#0c0a09] py-1 text-left shadow-lg">
              <button
                type="button"
                onClick={() => {
                  onCopyEmail(client.email);
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-xs text-[#B8AF9F] hover:bg-white/5 hover:text-[#F4EDE2]"
              >
                Copier l'email
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4">
          {bookings.length === 0 ? (
            <p className="text-xs text-[#6b6357]">Aucune réservation pour ce client.</p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#F4EDE2]">
                    {new Date(b.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[#B8AF9F]">
                    Avec {fullName(b.artist?.user)} · {BODY_ZONE_LABELS[b.bodyZone] || b.bodyZone}
                  </span>
                  <span className="italic text-[#6b6357]">« {b.description}»</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onCopyEmail }) {
  const { lastBooking, totalBookings, styleLabel } = client;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1512] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C9A24B]/15 text-sm font-semibold text-[#C9A24B]">
          {initials(client.firstName, client.lastName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-[#F4EDE2]">{fullName(client)}</p>
          <p className="truncate text-[10px] uppercase tracking-wider text-[#C9A24B]/80">{styleLabel}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-xs text-[#B8AF9F]">
        <p className="truncate">{client.email}</p>
        {client.phone && <p>{client.phone}</p>}
        <p className="text-[#6b6357]">
          {lastBooking
            ? `Dernière session : ${new Date(lastBooking.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'Aucune réservation'}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded border border-[#C9A24B]/30 bg-[#C9A24B]/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#C9A24B]">
          {String(totalBookings).padStart(2, '0')} session{totalBookings > 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={() => onCopyEmail(client.email)}
          className="text-[11px] uppercase tracking-wider text-[#B8AF9F] hover:text-[#C9A24B]"
        >
          Copier l'email
        </button>
      </div>
    </div>
  );
}

export default function AdminClients() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [salonName, setSalonName] = useState('');
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [sortDir, setSortDir] = useState('desc'); // 'desc' = récent -> ancien
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
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
      const [clientsRes, bookingsRes, salonsRes] = await Promise.allSettled([
        api.get('/users', { params: { role: 'client' } }),
        api.get('/bookings'),
        api.get('/salons'),
      ]);
      if (!isMounted) return;

      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data);
      else setErrorMsg("Impossible de charger la base de données clients. Vérifiez que l'API est bien lancée.");

      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (salonsRes.status === 'fulfilled' && salonsRes.value.data?.length > 0) {
        setSalonName(salonsRes.value.data[0].name);
      }
      setLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Enrichit chaque client avec ses réservations, sa dernière session,
  //     son "style" (déduit de son artiste le plus récent) et son total ---
  const enrichedClients = useMemo(() => {
    return clients.map((client) => {
      const clientBookings = bookings
        .filter((b) => b.client?.id === client.id)
        .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
      const lastBooking = clientBookings[0] || null;
      const styleKey = lastBooking?.artist?.styles?.[0];
      return {
        ...client,
        bookings: clientBookings,
        lastBooking,
        totalBookings: clientBookings.length,
        styleLabel: styleKey ? STYLE_LABELS[styleKey] : 'Style non renseigné',
        styleKey,
      };
    });
  }, [clients, bookings]);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = enrichedClients.filter((c) => {
      const matchesQuery =
        !q || fullName(c).toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchesStyle = !styleFilter || c.styleKey === styleFilter;
      return matchesQuery && matchesStyle;
    });
    list = [...list].sort((a, b) => {
      const dateA = a.lastBooking?.date || '0000-00-00';
      const dateB = b.lastBooking?.date || '0000-00-00';
      return sortDir === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });
    return list;
  }, [enrichedClients, query, styleFilter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(1);
  };

  const handleStyleFilterChange = (value) => {
    setStyleFilter(value);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard?.writeText(email);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const rangeStart = filteredClients.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredClients.length);

  return (
    <div
      className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AdminSidebar active="clients" salonName={salonName} adminName={fullName(user)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title="" query={query} setQuery={handleQueryChange} searchPlaceholder="Rechercher un client..." />

        <main className="flex-1 px-6 py-8 sm:px-10">
          <h1 className="mb-6 text-3xl text-[#F4EDE2]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Base de données <span className="text-[#C9A24B]">Clients</span>
          </h1>

          {errorMsg && (
            <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMsg}
            </p>
          )}

          {loading ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement des clients…</p>
          ) : (
            <>
              {/* Filtres */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <select
                      value={styleFilter}
                      onChange={(e) => handleStyleFilterChange(e.target.value)}
                      className="appearance-none rounded border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-xs uppercase tracking-wider text-[#B8AF9F] outline-none focus:border-[#C9A24B]/60"
                    >
                      <option value="">Filtrer par style</option>
                      {Object.entries(STYLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <Icon name="filter" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b6357]" />
                  </div>

                  <button
                    type="button"
                    onClick={handleSortToggle}
                    className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-wider text-[#B8AF9F] hover:border-[#C9A24B]/60 hover:text-[#F4EDE2]"
                  >
                    <Icon name="sort" className="h-3.5 w-3.5" />
                    Trier par date ({sortDir === 'desc' ? 'récent → ancien' : 'ancien → récent'})
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#6b6357]">
                    Affichage : {rangeStart}-{rangeEnd} sur {filteredClients.length} clients
                  </span>
                  <div className="flex overflow-hidden rounded border border-white/10">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'}`}
                      aria-label="Vue liste"
                    >
                      <Icon name="list" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'}`}
                      aria-label="Vue grille"
                    >
                      <Icon name="grid" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              {filteredClients.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-[#1a1512] p-10 text-center text-sm text-[#6b6357]">
                  Aucun client ne correspond à votre recherche.
                </div>
              ) : viewMode === 'list' ? (
                <div className="overflow-hidden rounded-lg border border-white/10 bg-[#1a1512]">
                  <div className="hidden border-b border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-[#6b6357] sm:flex">
                    <span className="min-w-[220px] flex-1">Client</span>
                    <span className="min-w-[180px] flex-1">Contact</span>
                    <span className="min-w-[150px] flex-1">Dernière session</span>
                    <span className="min-w-[110px]">Total réservations</span>
                    <span className="w-[84px] text-right">Actions</span>
                  </div>
                  {paginatedClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      expanded={expandedId === client.id}
                      onToggleHistory={(id) => setExpandedId((cur) => (cur === id ? null : id))}
                      onCopyEmail={handleCopyEmail}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedClients.map((client) => (
                    <ClientCard key={client.id} client={client} onCopyEmail={handleCopyEmail} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded border border-white/10 px-3 py-1.5 text-xs uppercase tracking-wider text-[#B8AF9F] disabled:opacity-30 hover:enabled:border-[#C9A24B]/60 hover:enabled:text-[#F4EDE2]"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded text-xs ${
                        p === currentPage ? 'bg-[#C9A24B] text-[#14110F]' : 'text-[#B8AF9F] hover:bg-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded border border-white/10 px-3 py-1.5 text-xs uppercase tracking-wider text-[#B8AF9F] disabled:opacity-30 hover:enabled:border-[#C9A24B]/60 hover:enabled:text-[#F4EDE2]"
                  >
                    Suivant
                  </button>
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