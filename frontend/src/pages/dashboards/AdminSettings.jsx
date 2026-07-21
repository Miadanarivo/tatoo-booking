import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AdminSidebar, AdminTopbar, DashboardFooter, Icon, fullName } from './adminUi';

const TABS = [
  { key: 'profil', label: 'Profil du Studio', available: true },
  { key: 'securite', label: 'Compte & Sécurité', available: false },
  { key: 'preferences', label: 'Préférences', available: false },
  { key: 'equipe', label: 'Équipe & Rôles', available: false },
];

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSalon() {
      setLoading(true);
      try {
        const { data } = await api.get('/salons');
        if (isMounted && data?.length > 0) {
          setSalon(data[0]);
          setForm({
            name: data[0].name || '',
            customDomain: data[0].customDomain || '',
            address: data[0].address || '',
            city: data[0].city || '',
            phone: data[0].phone || '',
            email: data[0].email || '',
            description: data[0].description || '',
            instagramUrl: data[0].instagramUrl || '',
            pinterestUrl: data[0].pinterestUrl || '',
          });
        }
      } catch {
        if (isMounted) setErrorMsg("Impossible de charger les informations du studio.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSalon();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    if (!salon) return;
    setForm({
      name: salon.name || '',
      customDomain: salon.customDomain || '',
      address: salon.address || '',
      city: salon.city || '',
      phone: salon.phone || '',
      email: salon.email || '',
      description: salon.description || '',
      instagramUrl: salon.instagramUrl || '',
      pinterestUrl: salon.pinterestUrl || '',
    });
    setLogoFile(null);
    setLogoPreview(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSave = async () => {
    if (!salon) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await api.patch(`/salons/${salon.id}`, form);
      let updated = data;

      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const logoRes = await api.post(`/salons/${salon.id}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updated = logoRes.data;
      }

      setSalon(updated);
      setLogoFile(null);
      setLogoPreview(null);
      setSuccessMsg('Paramètres enregistrés avec succès.');
    } catch {
      setErrorMsg("Impossible d'enregistrer les modifications. Vérifiez que l'API est bien lancée.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active="parametres" salonName={salon?.name} adminName={fullName(user)} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title="Administration" />

        <main className="flex-1 px-6 py-8 sm:px-10">
          {loading || !form ? (
            <p className="py-20 text-center text-sm text-[#6b6357]">Chargement des paramètres…</p>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-2xl text-[#F4EDE2]"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                  >
                    Paramètres du <span className="text-[#C9A24B]">Studio</span>
                  </h1>
                  <p className="mt-1 text-sm text-[#6b6357]">
                    Gérez l'identité de votre studio et vos préférences de sécurité.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded border border-white/15 px-5 py-2 text-[11px] uppercase tracking-[0.15em] text-[#B8AF9F] transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded bg-[#C9A24B] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14110F] transition-colors hover:bg-[#dcb864] disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </p>
              )}
              {successMsg && (
                <p className="mb-6 rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {successMsg}
                </p>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                {/* Onglets latéraux */}
                <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-[#1a1512] p-2">
                  {TABS.map((tab) =>
                    tab.available ? (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center justify-between gap-2 rounded px-3 py-2.5 text-left text-[11px] uppercase tracking-wide transition-colors ${
                          activeTab === tab.key
                            ? 'bg-[#C9A24B]/15 text-[#C9A24B]'
                            : 'text-[#B8AF9F] hover:bg-white/5 hover:text-[#F4EDE2]'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.key && <Icon name="chevronRight" className="h-3.5 w-3.5" />}
                      </button>
                    ) : (
                      <button
                        key={tab.key}
                        type="button"
                        title="Bientôt disponible"
                        className="flex items-center justify-between gap-2 rounded px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-[#6b6357]"
                      >
                        {tab.label}
                        <span className="text-[9px] tracking-wider">bientôt</span>
                      </button>
                    ),
                  )}
                </div>

                {/* Contenu de l'onglet actif */}
                {activeTab === 'profil' && (
                  <div className="rounded-lg border border-white/10 bg-[#1a1512] p-6">
                    <h2
                      className="text-xl text-[#F4EDE2]"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                    >
                      Identité Artistique
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Nom du studio</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={handleChange('name')}
                          className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Domaine personnalisé</label>
                        <input
                          type="text"
                          value={form.customDomain}
                          onChange={handleChange('customDomain')}
                          placeholder="inkandgold.com/mon-studio"
                          className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Adresse physique</label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={handleChange('address')}
                          className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Ville</label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={handleChange('city')}
                          className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Téléphone</label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={handleChange('phone')}
                          className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Email de contact</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={handleChange('email')}
                          className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Biographie du studio</label>
                        <textarea
                          rows={4}
                          value={form.description}
                          onChange={handleChange('description')}
                          className="mt-2 w-full resize-none rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#F4EDE2] outline-none transition-colors focus:border-[#C9A24B]/60"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Logo principal</label>
                        <label
                          htmlFor="logo-upload"
                          className="mt-2 flex h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed border-white/15 bg-white/5 text-center transition-colors hover:border-[#C9A24B]/50"
                        >
                          {logoPreview || salon?.logoUrl ? (
                            <img
                              src={logoPreview || salon.logoUrl}
                              alt="Logo du studio"
                              className="h-full w-full rounded object-cover"
                            />
                          ) : (
                            <>
                              <Icon name="upload" className="h-5 w-5 text-[#6b6357]" />
                              <span className="text-[9px] uppercase tracking-wider text-[#6b6357]">
                                JPG, PNG, SVG (max 5Mo)
                              </span>
                            </>
                          )}
                        </label>
                        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6357]">Réseaux sociaux</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 rounded border border-l-4 border-white/10 border-l-[#C9A24B] bg-white/5 px-3 py-2.5">
                          <Icon name="image" className="h-4 w-4 text-[#6b6357]" />
                          <input
                            type="text"
                            value={form.instagramUrl}
                            onChange={handleChange('instagramUrl')}
                            placeholder="Instagram URL"
                            className="flex-1 bg-transparent text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none"
                          />
                          {form.instagramUrl && <Icon name="dashboard" className="h-4 w-4 text-emerald-400" />}
                        </div>
                        <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2.5">
                          <Icon name="image" className="h-4 w-4 text-[#6b6357]" />
                          <input
                            type="text"
                            value={form.pinterestUrl}
                            onChange={handleChange('pinterestUrl')}
                            placeholder="Pinterest URL"
                            className="flex-1 bg-transparent text-sm text-[#F4EDE2] placeholder-[#6b6357] outline-none"
                          />
                          <Icon name="plus" className="h-4 w-4 text-[#6b6357]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}