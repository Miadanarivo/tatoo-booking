import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import heroStudio from '../assets/gallery/hero-studio.jpg';
import machineCloseup from '../assets/gallery/machine-closeup.jpg';
import styleRealisme from '../assets/gallery/style-realisme.jpg';
import styleFineline from '../assets/gallery/style-fineline.jpg';
import styleBlackwork from '../assets/gallery/style-blackwork.jpg';
import oeuvreDos from '../assets/gallery/oeuvre-dos.jpg';
import oeuvreManche from '../assets/gallery/oeuvre-manche.jpg';
import oeuvrePoignet from '../assets/gallery/oeuvre-poignet.webp';
import oeuvrePortrait from '../assets/gallery/oeuvre-portrait.jpg';
import oeuvreProcessus from '../assets/gallery/oeuvre-processus.jpg';
import oeuvreAvantbras from '../assets/gallery/oeuvre-avantbras.jpg';

const SERIF = { fontFamily: "'Playfair Display', serif" };

/* ---------- small inline icon set (line-art, no stock imagery) ---------- */

function Icon({ name, className = 'h-4 w-4' }) {
  const paths = {
    bell: 'M15 17H5l1.4-1.4A2 2 0 007 14.2V11a5 5 0 0110 0v3.2c0 .5.2 1 .6 1.4L19 17h-4zM9 17a3 3 0 006 0',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c1.5-4 5-6 8-6s6.5 2 8 6',
    globe: 'M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9S9.5 5.5 12 3z',
    share: 'M18 5a2.5 2.5 0 11-2.4 3.2L9.4 11.6a2.5 2.5 0 010 1.8l6.2 3.4a2.5 2.5 0 11-1 1.7l-6.2-3.4a2.5 2.5 0 110-4.2l6.2-3.4A2.5 2.5 0 0118 5z',
    help: 'M9.5 9a2.5 2.5 0 114.2 1.8c-.7.6-1.2 1-1.2 2.2M12 17h.01M12 21a9 9 0 100-18 9 9 0 000 18z',
    arrow: 'M5 12h14M13 6l6 6-6 6',
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ART_PATHS = {
  back: 'M8 4c2 3 6 3 8 0M6 8v10a6 6 0 0012 0V8',
  sleeve: 'M5 19l6-14 3 1-5 13-4 0zM11 6l6 3-2 9',
  wrist: 'M4 12h9M9 8l4 4-4 4',
  portrait: 'M12 4a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM5 21c1.5-4.5 5-6.5 7-6.5s5.5 2 7 6.5',
  process: 'M4 16l4-4 3 3-4 4-3-3zM14 9l4-4 3 3-4 4-3-3zM7 15l7-7',
  forearm: 'M6 20l3-13 4 1-2 12M13 8l5 2-1 6',
  machine: 'M4 15l4-4 3 3-4 4-3-3zm5-6l4-4 4 4-4 4-4-4zm7 1l3-3 3 3M6 18l-2 2',
  chair: 'M6 4h8v6a4 4 0 01-4 4H8a2 2 0 00-2 2v4M14 10h4l2 8h-6',
};

function ArtTile({ variant, className = '', watermark, opacity = '15', src, alt = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#2a2420_0%,#0c0a09_75%)] ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center text-[#C9A24B]/${opacity}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" className="h-24 w-24">
            <path d={ART_PATHS[variant]} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {watermark && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-[9px] uppercase tracking-[0.25em] text-[#C9A24B]/70">
          <span>Ink &amp; Gold</span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- nav ---------------------------------- */

function HomeNav() {
  const { user } = useAuth();
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="text-lg tracking-[0.15em] text-[#C9A24B]" style={SERIF}>
          INK &amp; GOLD
        </Link>

        <div className="hidden items-center gap-8 text-[13px] uppercase tracking-[0.15em] text-[#B8AF9F] md:flex">
          <Link to="/" className="border-b border-[#C9A24B] pb-1 text-[#F4EDE2]">
            Découvrir
          </Link>
          <Link to="/artists" className="hover:text-[#F4EDE2]">
            Artistes
          </Link>
          <a href="#expertise" className="hover:text-[#F4EDE2]">
            Prestations
          </a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="hidden text-[13px] uppercase tracking-[0.15em] text-[#B8AF9F] hover:text-[#F4EDE2] sm:inline"
            >
              Mon espace
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-[13px] uppercase tracking-[0.15em] text-[#B8AF9F] hover:text-[#F4EDE2] sm:inline"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full border border-[#C9A24B]/60 px-4 py-1.5 text-[12px] uppercase tracking-[0.15em] text-[#C9A24B] hover:bg-[#C9A24B]/10 sm:inline"
              >
                S'inscrire
              </Link>
            </>
          )}
          <button aria-label="Notifications" className="text-[#B8AF9F] hover:text-[#C9A24B]">
            <Icon name="bell" />
          </button>
          <Link
            to="/artists"
            className="rounded-full bg-[#C9A24B] px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14110F] hover:bg-[#dcb864]"
          >
            Réserver
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function Home() {
  useEffect(() => {
    document.body.classList.add('fullbleed');
    return () => document.body.classList.remove('fullbleed');
  }, []);

  return (
    <div className="w-full bg-[#14110F] text-[#F4EDE2]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroStudio})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/70 via-[#0c0a09]/75 to-[#0c0a09]" />
        <div className="absolute inset-0 opacity-[0.06]">
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <path
              d="M40 380V60M120 380V20M200 380V80M280 380V30M360 380V100"
              stroke="#C9A24B"
              strokeWidth="1"
            />
          </svg>
        </div>
        <HomeNav />

        <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center sm:px-10">
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#C9A24B]">
            Maison de tatouage de prestige
          </span>
          <h1
            className="mt-6 text-5xl leading-[1.1] text-[#F4EDE2] sm:text-6xl"
            style={{ ...SERIF, fontWeight: 700 }}
          >
            L'Art de l'Encre,{' '}
            <span className="italic text-[#C9A24B]">Redéfini</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#B8AF9F]">
            Vivez l'expérience ultime du tatouage haute couture où chaque trait est une
            signature, et chaque œuvre un héritage.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/artists"
              className="rounded bg-[#C9A24B] px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#14110F] hover:bg-[#dcb864]"
            >
              Découvrir nos artistes
            </Link>
            <Link
              to="/register"
              className="rounded border border-[#F4EDE2]/25 px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#F4EDE2] hover:border-[#C9A24B] hover:text-[#C9A24B]"
            >
              Réserver une session
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Haute Couture du Tatouage ---------- */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-24 sm:px-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl text-[#C9A24B] sm:text-4xl" style={{ ...SERIF, fontWeight: 700 }}>
            Haute Couture du Tatouage
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-[#B8AF9F]">
            Chez INK &amp; GOLD, nous transcendons le concept traditionnel du studio de
            tatouage pour devenir une véritable galerie d'art vivant. Notre philosophie
            repose sur l'exclusivité, la précision chirurgicale et une esthétique
            intemporelle.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[#B8AF9F]">
            Chaque projet est traité comme une pièce unique de haute couture, conçue en
            symbiose avec l'anatomie et l'histoire personnelle de nos clients. Nous
            n'utilisons que les pigments les plus fins et les technologies les plus
            avancées pour garantir une pérennité artistique absolue.
          </p>
          <a
            href="#expertise"
            className="mt-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#C9A24B] hover:text-[#dcb864]"
          >
            En savoir plus sur notre rituel <Icon name="arrow" className="h-3.5 w-3.5" />
          </a>
        </div>
        <ArtTile
          variant="machine"
          src={machineCloseup}
          alt="Gros plan sur une machine à tatouer en pleine séance"
          className="aspect-[4/5] rounded-sm border border-[#C9A24B]/10"
          opacity="25"
        />
      </section>

      {/* ---------- Expertise & Styles ---------- */}
      <section id="expertise" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl" style={{ ...SERIF, fontWeight: 700 }}>
            Expertise &amp; Styles
          </h2>
          <span className="mt-3 block text-[11px] uppercase tracking-[0.35em] text-[#C9A24B]">
            L'excellence dans chaque discipline
          </span>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              variant: 'portrait',
              src: styleRealisme,
              eyebrow: 'Maîtrise totale',
              title: 'Réalisme',
              byline: 'Marion Voss · ★ 4.9 (312)',
              text: 'Une précision photographique captée éternellement dans le derme.',
            },
            {
              variant: 'wrist',
              src: styleFineline,
              eyebrow: 'Élégance discrète',
              title: 'Fineline',
              byline: 'Théo Aubry · ★ 4.8 (204)',
              text: "Des lignes d'une finesse absolue, pensées pour durer sans jamais s'imposer.",
            },
            {
              variant: 'forearm',
              src: styleBlackwork,
              eyebrow: 'Nextgen brut',
              title: 'Blackwork',
              byline: 'Sacha Reyes · ★ 4.9 (176)',
              text: 'Des masses d\'encre sculptées comme une armure graphique sur la peau.',
            },
          ].map((card) => (
            <article key={card.title} className="group">
              <ArtTile
                variant={card.variant}
                src={card.src}
                alt={card.title}
                className="aspect-[4/3] rounded-sm"
                opacity="20"
              />
              <span className="mt-5 block text-[10px] uppercase tracking-[0.25em] text-[#C9A24B]">
                {card.eyebrow}
              </span>
              <h3 className="mt-1 text-2xl text-[#F4EDE2]" style={SERIF}>
                {card.title}
              </h3>
              <p className="mt-1 text-[12px] text-[#8b8375]">{card.byline}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#B8AF9F]">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Œuvres d'Exception ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl sm:text-4xl" style={{ ...SERIF, fontWeight: 700 }}>
              Œuvres d'Exception
            </h2>
            <p className="mt-2 text-[14px] text-[#B8AF9F]">
              Un aperçu de nos dernières créations signatures.
            </p>
          </div>
          <Link
            to="/artists"
            className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#C9A24B] hover:text-[#dcb864]"
          >
            Voir le portfolio complet <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
          <ArtTile variant="back" src={oeuvreDos} alt="Tatouage complet du dos" className="col-span-1 row-span-2 aspect-[3/4] rounded-sm sm:aspect-auto" opacity="20" />
          <ArtTile variant="sleeve" src={oeuvreManche} alt="Manche tatouée sur le bras" className="col-span-1 aspect-[4/3] rounded-sm" watermark opacity="25" />
          <ArtTile variant="wrist" src={oeuvrePoignet} alt="Tatouage sur le poignet" className="col-span-1 aspect-[4/3] rounded-sm" opacity="15" />
          <ArtTile variant="portrait" src={oeuvrePortrait} alt="Portrait client" className="col-span-1 row-span-2 aspect-[3/4] rounded-sm sm:aspect-auto" opacity="20" />
          <ArtTile variant="process" src={oeuvreProcessus} alt="Artiste en pleine séance" className="col-span-1 aspect-[4/3] rounded-sm" opacity="20" />
          <ArtTile variant="forearm" src={oeuvreAvantbras} alt="Tatouage sur l'avant-bras" className="col-span-1 aspect-[4/3] rounded-sm" opacity="20" />
        </div>
      </section>

      {/* ---------- Rejoignez le Cercle Privé ---------- */}
      <section className="border-y border-[#C9A24B]/10 bg-[#0c0a09] px-6 py-24 text-center sm:px-10">
        <h2 className="text-3xl sm:text-4xl" style={{ ...SERIF, fontWeight: 700 }}>
          Rejoignez le <span className="italic text-[#C9A24B]">Cercle Privé</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#B8AF9F]">
          Accédez à des avant-premières sur les agendas de nos artistes résidents et
          recevez des invitations exclusives pour nos vernissages privés.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="rounded bg-[#C9A24B] px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#14110F] hover:bg-[#dcb864]"
          >
            Devenir membre
          </Link>
          <Link
            to="/login"
            className="rounded border border-[#F4EDE2]/25 px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#F4EDE2] hover:border-[#C9A24B] hover:text-[#C9A24B]"
          >
            Connexion artiste
          </Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="px-6 py-16 text-center sm:px-10">
        <span className="text-lg tracking-[0.2em] text-[#C9A24B]" style={SERIF}>
          INK &amp; GOLD
        </span>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] uppercase tracking-[0.15em] text-[#B8AF9F]">
          <a href="#" className="hover:text-[#C9A24B]">Mentions légales</a>
          <a href="#" className="hover:text-[#C9A24B]">Confidentialité</a>
          <a href="#" className="hover:text-[#C9A24B]">Contact</a>
          <a href="#" className="hover:text-[#C9A24B]">FAQ</a>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-[#B8AF9F]">
          <Icon name="globe" />
          <Icon name="share" />
          <Icon name="help" />
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-[#6b6357]">
          © {new Date().getFullYear()} Ink &amp; Gold — Haute Couture du Tatouage
        </p>
      </footer>
    </div>
  );
}
