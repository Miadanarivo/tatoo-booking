import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import machineCloseup from '../assets/gallery/machine-closeup.jpg';
import oeuvreManche from '../assets/gallery/oeuvre-manche.jpg';
import oeuvreProcessus from '../assets/gallery/oeuvre-processus.jpg';
import oeuvreDos from '../assets/gallery/oeuvre-dos.jpg';

const TILE_ICON_PATHS = {
  machine:
    'M4 15l4-4 3 3-4 4-3-3zm5-6l4-4 4 4-4 4-4-4zm7 1l3-3 3 3M6 18l-2 2',
  chair:
    'M6 4h8v6a4 4 0 01-4 4H8a2 2 0 00-2 2v4M14 10h4l2 8h-6',
};

function TileIcon({ variant }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      className="h-16 w-16"
    >
      <path d={TILE_ICON_PATHS[variant]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StudioTile({ variant, label, src, alt = '' }) {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#2a2420_0%,#0c0a09_70%)]">
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#C9A24B]/15">
          <TileIcon variant={variant} />
        </div>
      )}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#C9A24B]/60">
        <span>{label}</span>
        <span className="flex items-center gap-2 text-[#C9A24B]/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div className="h-full min-h-[220px]" />
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.36 5.16A10.9 10.9 0 0112 5c7 0 10.5 7 10.5 7a13.2 13.2 0 01-3.17 4.13M6.5 6.68C3.6 8.42 1.5 12 1.5 12a13 13 0 003.32 4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // This page opts out of the app's boxed shell for a full-bleed layout.
  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiant ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left: studio showcase */}
      <div className="hidden lg:grid lg:w-[58%] grid-cols-2 grid-rows-[1fr_auto_auto_1fr] gap-px bg-black/60">
        <StudioTile variant="machine" src={machineCloseup} alt="Machine à tatouer en séance" label="Connexion · Ink & Gold" />
        <StudioTile variant="chair" src={oeuvreManche} alt="Manche tatouée sur fauteuil" label="Connexion · Ink & Gold" />

        <div className="col-span-2 flex flex-col items-center justify-center gap-4 bg-[#0c0a09] px-10 py-14 text-center">
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#C9A24B]">L'excellence</span>
          <h1
            className="max-w-lg text-4xl leading-tight text-[#F4EDE2] xl:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            L'art de la peau revisité
          </h1>
          <span className="h-px w-16 bg-[#C9A24B]" />
        </div>

        <div className="col-span-2 flex items-center justify-center border-t border-[#C9A24B]/20 bg-[#0c0a09] px-10 py-10 text-center">
          <p
            className="max-w-sm text-lg italic text-[#C9A24B]/80"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "Plus qu'un tatouage, une acquisition artistique privée."
          </p>
        </div>

        <StudioTile variant="chair" src={oeuvreProcessus} alt="Artiste en pleine séance de tatouage" label="Connexion · Ink & Gold" />
        <StudioTile variant="machine" src={oeuvreDos} alt="Tatouage complet du dos" label="Connexion · Ink & Gold" />
      </div>

      {/* Right: login form */}
      <div className="relative flex w-full flex-col justify-center px-8 py-16 sm:px-16 lg:w-[42%]">
        <div className="mx-auto w-full max-w-sm">
          <h2
            className="text-5xl text-[#F4EDE2]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Connexion
          </h2>
          <p className="mt-3 text-sm text-[#B8AF9F]">Accédez à votre espace privé.</p>

          {error && (
            <p className="mt-6 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] uppercase tracking-[0.25em] text-[#B8AF9F]"
              >
                Identifiant
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                placeholder="Email ou nom d'utilisateur"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-3 w-full border-b border-white/15 bg-transparent pb-2 text-[#F4EDE2] placeholder-[#6b6357] outline-none transition-colors focus:border-[#C9A24B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-[0.25em] text-[#B8AF9F]"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.15em] text-[#C9A24B] hover:text-[#e0bd6b]"
                  onClick={() => navigate('/forgot-password')}
                >
                  Oublié ?
                </button>
              </div>
              <div className="mt-3 flex items-center border-b border-white/15 focus-within:border-[#C9A24B]">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent pb-2 text-[#F4EDE2] placeholder-[#6b6357] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pb-2 pl-2 text-[#B8AF9F] hover:text-[#C9A24B]"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#B8AF9F]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 border border-[#C9A24B]/50 bg-transparent accent-[#C9A24B]"
              />
              Se souvenir de moi
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C9A24B] py-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#14110F] transition-colors hover:bg-[#dcb864] disabled:opacity-50"
              >
                {loading ? 'Connexion…' : 'Entrer dans l\u2019atelier'}
              </button>
            </div>
          </form>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-[#B8AF9F]">
            Pas encore membre ?{' '}
            <Link to="/register" className="text-[#C9A24B] hover:text-[#e0bd6b]">
              Créer un profil
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-[#B8AF9F]">
            <button type="button" aria-label="Partager" className="hover:text-[#C9A24B]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" aria-label="Aide" className="hover:text-[#C9A24B]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 114.2 1.8c-.7.6-1.2 1-1.2 2.2M12 17h.01" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] uppercase tracking-[0.25em] text-[#6b6357]">
          Ink & Gold © {new Date().getFullYear()} — Art privé
        </p>
      </div>
    </div>
  );
}
