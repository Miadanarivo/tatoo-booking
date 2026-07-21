import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EyeIcon from '../components/EyeIcon';
import api from '../services/api';

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

function StudioTile({ variant, src, alt = '' }) {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#2a2420_0%,#0c0a09_70%)]">
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#C9A24B]/15">
          <TileIcon variant={variant} />
        </div>
      )}
      <div className="h-full min-h-[220px]" />
    </div>
  );
}

function AuthNavbar() {
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
        to="/login"
        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#C9A24B] transition-colors hover:text-[#e0bd6b]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour à la connexion
      </Link>
    </header>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');

  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));
  const codeRefs = useRef([]);
  const [timer, setTimer] = useState(59);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sort du conteneur boxé du site, comme Login/Register/Home.
  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setTimer(59);
      setTimeout(() => codeRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setTimer(59);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi du code');
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
      await api.post('/auth/forgot-password/verify-code', {
        email,
        code: codeDigits.join(''),
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = hasMinLength && hasUpper && hasSymbol && passwordsMatch && password.length > 0;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) {
      setError('Le mot de passe ne respecte pas les critères requis');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', {
        email,
        code: codeDigits.join(''),
        password,
        confirmPassword,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const badgeClass = (active) =>
    `rounded px-2 py-1 text-[11px] uppercase tracking-widest ${
      active ? 'border border-[#C9A24B]/40 bg-[#C9A24B]/10 text-[#C9A24B]' : 'border border-white/10 text-[#6b6357]'
    }`;

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-[#14110F] text-[#F4EDE2]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AuthNavbar />

      <div className="flex w-full flex-1">
        {/* Left: studio showcase — identique à Login */}
        <div className="hidden lg:grid lg:w-[58%] grid-cols-2 grid-rows-[1fr_auto_auto_1fr] gap-px bg-black/60">
          <StudioTile variant="machine" src={machineCloseup} alt="Machine à tatouer en séance" />
          <StudioTile variant="chair" src={oeuvreManche} alt="Manche tatouée sur fauteuil" />

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

          <StudioTile variant="chair" src={oeuvreProcessus} alt="Artiste en pleine séance de tatouage" />
          <StudioTile variant="machine" src={oeuvreDos} alt="Tatouage complet du dos" />
        </div>

        {/* Right: formulaire */}
        <div className="relative flex w-full flex-col justify-center px-8 py-16 sm:px-16 lg:w-[42%]">
          <div className="mx-auto w-full max-w-sm">
            {error && (
              <p className="mb-6 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            {step === 1 && (
              <>
                <h2
                  className="text-5xl text-[#F4EDE2]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                >
                  Mot de passe oublié ?
                </h2>
                <p className="mt-3 text-sm text-[#B8AF9F]">
                  Entrez votre email pour recevoir un code de vérification.
                </p>

                <form onSubmit={handleSendCode} className="mt-10 space-y-8">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] uppercase tracking-[0.25em] text-[#B8AF9F]"
                    >
                      Adresse email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-3 w-full border-b border-white/15 bg-transparent pb-2 text-[#F4EDE2] placeholder-[#6b6357] outline-none transition-colors focus:border-[#C9A24B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#C9A24B] py-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#14110F] transition-colors hover:bg-[#dcb864] disabled:opacity-50"
                  >
                    {loading ? 'Envoi…' : 'Envoyer le code de vérification'}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h2
                  className="text-5xl text-[#F4EDE2]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                >
                  Vérification
                </h2>
                <p className="mt-3 text-sm text-[#B8AF9F]">
                  Saisissez le code à 6 chiffres envoyé à{' '}
                  <span className="text-[#F4EDE2]">{email}</span>.
                </p>

                <form onSubmit={handleVerifyCode} className="mt-10 space-y-8">
                  <div>
                    <label className="mb-3 block text-[11px] uppercase tracking-[0.25em] text-[#B8AF9F]">
                      Code de vérification
                    </label>
                    <div className="flex justify-between gap-2">
                      {codeDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (codeRefs.current[i] = el)}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          maxLength={1}
                          inputMode="numeric"
                          className="h-14 w-11 rounded border border-white/15 bg-transparent text-center text-xl text-[#F4EDE2] outline-none focus:border-[#C9A24B]"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || codeDigits.join('').length !== 6}
                    className="w-full bg-[#C9A24B] py-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#14110F] transition-colors hover:bg-[#dcb864] disabled:opacity-50"
                  >
                    {loading ? 'Vérification…' : 'Vérifier le code'}
                  </button>

                  <p className="text-center text-[11px] uppercase tracking-[0.15em] text-[#6b6357]">
                    {timer > 0 ? (
                      <>Renvoyer le code ({String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')})</>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-[#C9A24B] hover:text-[#e0bd6b]"
                      >
                        Renvoyer le code
                      </button>
                    )}
                  </p>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <h2
                  className="text-5xl text-[#F4EDE2]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                >
                  Nouveau mot de passe
                </h2>
                <p className="mt-3 text-sm text-[#B8AF9F]">
                  Créez un mot de passe sécurisé pour votre compte.
                </p>

                <form onSubmit={handleResetPassword} className="mt-10 space-y-8">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.25em] text-[#B8AF9F]">
                      Nouveau mot de passe
                    </label>
                    <div className="mt-3 flex items-center border-b border-white/15 focus-within:border-[#C9A24B]">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-transparent pb-2 text-[#F4EDE2] outline-none"
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

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.25em] text-[#B8AF9F]">
                      Confirmer le mot de passe
                    </label>
                    <div className="mt-3 flex items-center border-b border-white/15 focus-within:border-[#C9A24B]">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-transparent pb-2 text-[#F4EDE2] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="pb-2 pl-2 text-[#B8AF9F] hover:text-[#C9A24B]"
                        aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="mt-2 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={badgeClass(hasMinLength)}>8+ caractères</span>
                    <span className={badgeClass(hasUpper)}>Majuscule</span>
                    <span className={badgeClass(hasSymbol)}>Symbole</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="w-full bg-[#C9A24B] py-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#14110F] transition-colors hover:bg-[#dcb864] disabled:opacity-50"
                  >
                    {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-[#B8AF9F]">
              <Link to="/login" className="text-[#C9A24B] hover:text-[#e0bd6b]">
                ← Retour à la connexion
              </Link>
            </div>
          </div>

          <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] uppercase tracking-[0.25em] text-[#6b6357]">
            Ink &amp; Gold © {new Date().getFullYear()} — Art privé
          </p>
        </div>
      </div>
    </div>
  );
}