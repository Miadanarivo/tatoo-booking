import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import EyeIcon from '../components/EyeIcon';
import heroImg from '../assets/gallery/hero-studio.jpg';
import codeImg from '../assets/gallery/machine-closeup.jpg';
import passImg from '../assets/gallery/oeuvre-portrait.jpg';

const GOLD = 'text-yellow-500';
const GOLD_BG = 'bg-yellow-500';

const ICON_PATHS = {
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c1.5-4 5-6 8-6s6.5 2 8 6',
  mail: 'M4 6h16v12H4z M4 6l8 7 8-7',
  phone:
    'M6.5 3h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.2 2 2 0 016.5 3z',
};

function FieldIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path d={ICON_PATHS[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInput({ icon, className = '', ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8375]">
        <FieldIcon name={icon} />
      </span>
      <input
        {...props}
        className={`w-full rounded bg-[#F4EDE2] py-3 pl-10 pr-3 text-sm tracking-wide text-[#14110F] placeholder-[#8b8375] focus:outline-none focus:ring-2 focus:ring-yellow-500 ${className}`}
      />
    </div>
  );
}

function RegisterNavbar() {
  return (
    <header className="flex items-center justify-between border-b border-[#C9A24B]/20 bg-[#0c0a09] px-6 py-4 sm:px-10">
      <Link
        to="/"
        className="text-lg text-[#F4EDE2] tracking-wide"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        INK <span className="text-[#C9A24B]">&amp;</span> GOLD
      </Link>

      <Link
        to="/"
        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#C9A24B] hover:text-[#e0bd6b] transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour à l'accueil
      </Link>
    </header>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [role, setRole] = useState('client');

  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));
  const codeRefs = useRef([]);
  const [timer, setTimer] = useState(59);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // This page opts out of the app's boxed shell for a full-bleed layout,
  // matching /login and /.
  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleInit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/init', { ...form, role });
      setStep(2);
      setTimer(59);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value;
    setCodeDigits(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/verify-code', {
        email: form.email,
        code: codeDigits.join(''),
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return;
    setError('');
    try {
      await api.post('/auth/register/resend-code', { email: form.email });
      setTimer(59);
      setCodeDigits(Array(6).fill(''));
      codeRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi du code');
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const canSubmit = hasMinLength && hasUpper && hasSymbol && passwordsMatch;

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/set-password', {
        email: form.email,
        password,
        confirmPassword,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const bgImage = step === 1 ? heroImg : step === 2 ? codeImg : passImg;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <RegisterNavbar />

      <div className="flex flex-1 flex-col md:flex-row">
      {/* Panneau image plein écran */}
      <div
        className="hidden md:block md:w-1/2 relative bg-cover bg-center bg-neutral-900"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="relative z-10 h-full flex flex-col justify-between p-10">
          <span className={`text-lg font-serif font-bold ${GOLD} tracking-wide`}>
            INK &amp; GOLD
          </span>
          <div>
            <p className={`text-xs tracking-[0.3em] ${GOLD} mb-3`}>ART DE L'INSTANT</p>
            <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-4">
              INK &amp; GOLD
            </h1>
            <p className="text-gray-300 text-sm max-w-sm">
              Le sanctuaire de l'élégance éternelle. Entrez dans un monde où
              chaque trait est un héritage.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="w-full md:w-1/2 flex justify-center px-6 sm:px-12">
        <div className="w-full max-w-md my-auto py-12 text-left">
          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-950/40 border border-red-900 rounded px-3 py-2">
              {error}
            </p>
          )}

          {step === 1 && (
            <form onSubmit={handleInit} className="space-y-5 text-left">
              <div className="text-left">
                <div className={`w-10 h-0.5 ${GOLD_BG} mb-4`} />
                <h2 className="text-3xl font-serif font-bold mb-2 text-left">Créer un compte</h2>
                <p className="text-sm text-gray-400 text-left">
                  Inscrivez-vous pour accéder à nos galeries privées et
                  réserver votre session exclusive.
                </p>
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-400 block mb-2">
                  JE M'INSCRIS EN TANT QUE
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`py-3 rounded border text-sm tracking-wide transition ${
                      role === 'client'
                        ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    CLIENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('artist')}
                    className={`py-3 rounded border text-sm tracking-wide transition ${
                      role === 'artist'
                        ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    ARTISTE TATOUEUR
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <IconInput
                  icon="user"
                  name="firstName"
                  placeholder="PRÉNOM"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-1/2"
                />
                <IconInput
                  icon="user"
                  name="lastName"
                  placeholder="NOM"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-1/2"
                />
              </div>

              <IconInput
                icon="mail"
                type="email"
                name="email"
                placeholder="EMAIL PROFESSIONNEL"
                value={form.email}
                onChange={handleChange}
                required
              />

              <IconInput
                icon="phone"
                type="tel"
                name="phone"
                placeholder="TÉLÉPHONE"
                value={form.phone}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${GOLD_BG} text-black font-semibold tracking-widest text-sm py-3 rounded hover:bg-yellow-400 transition disabled:opacity-50`}
              >
                {loading ? 'ENVOI...' : 'VÉRIFIER'}
              </button>

              <p className="text-center text-sm text-gray-400">
                Déjà membre de la guilde ?{' '}
                <Link to="/login" className={`${GOLD} hover:underline`}>
                  Connexion
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6 text-left">
              <div className="text-left">
                <h2 className="text-3xl font-serif font-bold mb-2 text-yellow-500 text-left">
                  Vérification du compte
                </h2>
                <p className="text-sm text-gray-400 text-left">
                  Saisissez le code à 6 chiffres envoyé à{' '}
                  <span className="text-gray-200">{form.email}</span> pour
                  finaliser votre accès à l'expérience INK &amp; GOLD.
                </p>
              </div>

              <div className="flex gap-2 justify-between">
                {codeDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (codeRefs.current[i] = el)}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    maxLength={1}
                    inputMode="numeric"
                    className="w-12 h-14 text-center text-xl bg-neutral-900 border border-gray-700 rounded focus:outline-none focus:border-yellow-500"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || codeDigits.join('').length !== 6}
                className={`w-full ${GOLD_BG} text-black font-semibold tracking-widest text-sm py-3 rounded hover:bg-yellow-400 transition disabled:opacity-50`}
              >
                {loading ? 'VÉRIFICATION...' : 'VÉRIFIER LE CODE'}
              </button>

              <p className="text-center text-xs text-gray-500">
                {timer > 0 ? (
                  <>RENVOYER LE CODE ({String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')})</>
                ) : (
                  <button type="button" onClick={handleResendCode} className={`${GOLD} hover:underline`}>
                    RENVOYER LE CODE
                  </button>
                )}
              </p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCreateAccount} className="space-y-5 text-left">
              <div className="text-left">
                <h2 className="text-3xl font-serif font-bold mb-2 text-left">
                  Définir votre mot de passe
                </h2>
                <p className="text-sm text-gray-400 text-left">
                  Créez un mot de passe sécurisé pour finaliser votre compte.
                </p>
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-400">
                  NOUVEAU MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-gray-700 focus:outline-none focus:border-yellow-500 py-2 pr-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 top-2 text-gray-400 hover:text-yellow-500"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs tracking-widest text-gray-400">
                  CONFIRMER LE MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-gray-700 focus:outline-none focus:border-yellow-500 py-2 pr-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-0 top-2 text-gray-400 hover:text-yellow-500"
                    aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-red-400 text-xs mt-1">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded ${hasMinLength ? 'bg-yellow-900/50 text-yellow-400' : 'bg-neutral-800 text-gray-500'}`}>
                  8+ CARACTÈRES
                </span>
                <span className={`text-xs px-2 py-1 rounded ${hasUpper ? 'bg-yellow-900/50 text-yellow-400' : 'bg-neutral-800 text-gray-500'}`}>
                  MAJUSCULE
                </span>
                <span className={`text-xs px-2 py-1 rounded ${hasSymbol ? 'bg-yellow-900/50 text-yellow-400' : 'bg-neutral-800 text-gray-500'}`}>
                  SYMBOLE
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className={`w-full ${GOLD_BG} text-black font-semibold tracking-widest text-sm py-3 rounded hover:bg-yellow-400 transition disabled:opacity-50`}
              >
                {loading ? 'CRÉATION...' : 'CRÉER MON COMPTE'}
              </button>
            </form>
          )}
        </div>
      </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/10 px-6 py-4 text-[11px] uppercase tracking-[0.15em] text-gray-500 sm:flex-row sm:px-10">
        <span>© {new Date().getFullYear()} Ink &amp; Gold — Atelier de luxe.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-yellow-500">
            Mentions légales
          </a>
          <a href="#" className="hover:text-yellow-500">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}