import React, { useState } from "react";
import { Link } from "react-router-dom";
import lauraPhoto from "../assets/Laura.jpg";
import { SakuraBranch } from "../Components/UI/SakuraBranches";

/** Photos à déposer dans Frontend/public/galerie/ */
const LOCAL_PHOTOS = [
  { src: "/galerie/local/1.jpg", alt: "Le salon — espace d’accueil", label: "Accueil" },
  { src: "/galerie/local/2.jpg", alt: "Le salon — espace de soin", label: "Espace soin" },
  { src: "/galerie/local/3.jpg", alt: "Le salon — ambiance détente", label: "Ambiance" },
];

const SOINS_PHOTOS = [
  { src: "/galerie/soins/1.jpg", alt: "Soin Head Spa — gestes et brosses", label: "Les gestes" },
  { src: "/galerie/soins/2.jpg", alt: "Soin Head Spa — moment de détente", label: "La détente" },
  { src: "/galerie/soins/3.jpg", alt: "Soin Head Spa — rituel japonais", label: "Le rituel" },
];

function GalleryImage({ src, alt, label, tall = false }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={`group relative overflow-hidden rounded-[1.25rem] shadow-[0_20px_50px_-24px_rgba(110,86,86,0.4)] ${
        tall ? "aspect-[3/4] sm:aspect-[3/4]" : "aspect-[4/3] sm:aspect-[4/3]"
      }`}
    >
      {failed ? (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center bg-gradient-to-br from-[#fdf6f5] via-[#f8e4e6] to-[#f0cfcf] text-[#6e5656]/45">
          <span className="mb-2 text-3xl opacity-50" aria-hidden>
            🌸
          </span>
          <p className="font-body text-xs tracking-wide uppercase">Photo à venir</p>
          {label && (
            <p className="mt-1 font-display text-lg text-[#6e5656]/55">{label}</p>
          )}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#6e5656]/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      {label && (
        <figcaption className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <span className="font-display text-lg text-white sm:text-xl">{label}</span>
        </figcaption>
      )}
    </figure>
  );
}

function About() {
  const [lauraPhotoFailed, setLauraPhotoFailed] = useState(false);

  const values = [
    {
      title: "Expertise",
      text: "Techniques japonaises authentiques maîtrisées pour un soin professionnel et efficace.",
    },
    {
      title: "Produits naturels",
      text: "Sélection de produits naturels et premium pour prendre soin de votre peau et de vos cheveux.",
    },
    {
      title: "Détente totale",
      text: "Un environnement apaisant conçu pour votre bien-être et votre relaxation complète.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#faf6f4]">
      {/* ——— Hero immersif ——— */}
      <header className="relative flex min-h-[52vh] items-center justify-center overflow-hidden px-4 pb-16 pt-32 sm:min-h-[58vh] sm:pb-20 sm:pt-36">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 50% 20%, #fff9f8 0%, transparent 55%),
              radial-gradient(ellipse 50% 50% at 0% 80%, rgba(248,213,218,0.45) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 100% 70%, rgba(232,168,178,0.3) 0%, transparent 50%),
              linear-gradient(180deg, #fdf8f6 0%, #faf6f4 100%)
            `,
          }}
        />
        <div className="pointer-events-none absolute left-0 top-20 hidden h-[70%] w-[28%] max-w-[300px] -translate-x-[25%] opacity-60 lg:block">
          <SakuraBranch side="left" className="h-full w-full opacity-80" />
        </div>
        <div className="pointer-events-none absolute right-0 top-20 hidden h-[70%] w-[28%] max-w-[300px] translate-x-[25%] opacity-60 lg:block">
          <SakuraBranch side="right" className="sakura-branch-enter-right h-full w-full opacity-80" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="font-display text-sm tracking-[0.35em] text-[#c97886] uppercase">
            À propos
          </p>
          <h1 className="mt-4 font-alex-brush text-[clamp(3.5rem,10vw,7rem)] leading-[0.95] text-[#6e5656]">
            Le cocon de Laura
          </h1>
          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#e8a8b2]/80" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#e8a8b2]" aria-hidden />
            <span className="h-px w-12 bg-[#e8a8b2]/80" />
          </div>
          <p className="mx-auto mt-7 max-w-md font-body text-base font-light leading-relaxed text-[#6e5656]/65 sm:text-lg">
            Head Spa japonais à Jonzac — un espace de douceur, de calme et de
            recentrage.
          </p>
        </div>
      </header>

      {/* ——— Univers ——— */}
      <section className="relative mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-40px_rgba(110,86,86,0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-8 sm:p-10 lg:p-14">
              <p className="font-display text-xs tracking-[0.28em] text-[#c97886] uppercase">
                L’univers
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-snug text-[#6e5656] sm:text-4xl">
                Bienvenue dans l’univers du Head Spa japonais
              </h2>
              <div className="mt-5 h-px w-14 bg-[#e8a8b2]/70" />
              <p className="mt-6 font-body text-base leading-relaxed text-[#6e5656]/70 sm:text-lg">
                Le Cocon de Laura est un espace dédié au bien-être et à la
                détente, spécialisé dans l’art du head spa japonais. Inspiré des
                traditions ancestrales du Japon, chaque soin est conçu pour vous
                offrir un moment de relaxation profonde et de régénération.
              </p>
              <p className="mt-4 font-body text-base leading-relaxed text-[#6e5656]/70 sm:text-lg">
                Notre approche combine massage du cuir chevelu avec des
                techniques de relaxation pour une expérience de bien-être
                complète. Chaque rituel est personnalisé selon vos besoins et
                vos préférences.
              </p>
            </div>
            <div className="relative flex items-center bg-gradient-to-br from-[#f8e4e6] via-[#f0cfcf] to-[#e8a8b2] p-8 sm:p-10 lg:p-12">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.7), transparent 55%)",
                }}
                aria-hidden
              />
              <blockquote className="relative">
                <p className="font-display text-xs tracking-[0.28em] text-[#6e5656]/60 uppercase">
                  Philosophie
                </p>
                <p className="mt-5 font-display text-2xl italic leading-relaxed text-[#6e5656] sm:text-[1.75rem]">
                  « Prendre soin de soi est un art. Chaque moment de détente est
                  une opportunité de se reconnecter avec son bien-être
                  intérieur. »
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Laura ——— */}
      <section className="relative mx-auto mt-16 max-w-[1200px] px-4 py-6 sm:mt-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-16">
          {/* Cadre photo organique */}
          <div className="relative mx-auto flex w-full max-w-[340px] justify-center sm:max-w-[380px] md:max-w-none">
            {/* Halo sakura */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-br from-[#f0cfcf]/50 via-[#f8d5da]/30 to-transparent blur-2xl"
              aria-hidden
            />
            {/* Anneau décoratif externe */}
            <div
              className="relative w-full max-w-[360px] p-[3px]"
              style={{
                background:
                  "linear-gradient(145deg, #f0cfcf, #e8a8b2 40%, #f8d5da 70%, #e0bfbf)",
                borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
              }}
            >
              <div
                className="bg-[#faf6f4] p-2.5 sm:p-3"
                style={{
                  borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
                }}
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-[#f3e8e8] shadow-inner"
                  style={{
                    borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
                  }}
                >
                  {!lauraPhotoFailed ? (
                    <img
                      src={lauraPhoto}
                      alt="Laura - Votre praticienne Head Spa"
                      width={1440}
                      height={1920}
                      decoding="async"
                      loading="lazy"
                      className="h-full w-full object-cover object-[center_22%]"
                      onError={() => setLauraPhotoFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-2 px-6 text-center text-[#8b6f6f]/70">
                      <span className="text-4xl" aria-hidden>
                        🌸
                      </span>
                      <p className="text-sm font-medium">Photo à venir</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Petit accent décoratif */}
            <span
              className="absolute -bottom-2 right-[12%] h-3 w-3 rotate-45 bg-[#e8a8b2]/80"
              aria-hidden
            />
          </div>

          <div className="text-center md:text-left">
            <p className="font-display text-xs tracking-[0.28em] text-[#c97886] uppercase">
              La praticienne
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium text-[#6e5656] sm:text-4xl md:text-5xl">
              Ohayō, moi c’est Laura
            </h2>
            <div className="mx-auto mt-5 h-px w-14 bg-[#e8a8b2]/70 md:mx-0" />
            <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-[#6e5656]/70 sm:text-lg md:mx-0">
              J’ai 24 ans, infirmière de métier et praticienne Head Spa. J’ai
              décidé d’apporter du bien-être aux gens d’une autre façon que par
              le paramédical.
            </p>
            <Link
              to="/contact"
              className="mt-9 inline-flex rounded-full bg-[#6e5656] px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-white transition-all hover:scale-105 hover:bg-[#5a4343]"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Valeurs ——— */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <p className="font-display text-xs tracking-[0.28em] text-[#c97886] uppercase">
            L’esprit du Cocon
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium text-[#6e5656] sm:text-4xl">
            Ce qui guide chaque soin
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {values.map((item, i) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[1.5rem] border border-[#f0cfcf]/90 bg-white p-8 shadow-[0_16px_40px_-28px_rgba(110,86,86,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(201,120,134,0.35)] sm:p-9"
            >
              <span className="font-display text-5xl font-light text-[#f0cfcf] transition-colors group-hover:text-[#e8a8b2]">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-display text-2xl text-[#6e5656]">
                {item.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#6e5656]/65 sm:text-base">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Galerie local ——— */}
      <section className="bg-gradient-to-b from-white to-[#faf6f4] py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center gap-4 text-center sm:mb-12 md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="font-display text-xs tracking-[0.28em] text-[#c97886] uppercase">
                L’écrin
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-[#6e5656] sm:text-4xl">
                Le local
              </h2>
              <p className="mt-3 max-w-md font-body text-sm text-[#6e5656]/60 sm:text-base">
                Un espace pensé pour la douceur et le calme, à Jonzac.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {LOCAL_PHOTOS.map((photo) => (
              <GalleryImage
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                label={photo.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ——— Galerie soins ——— */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-12">
            <p className="font-display text-xs tracking-[0.28em] text-[#c97886] uppercase">
              L’expérience
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-[#6e5656] sm:text-4xl">
              Les soins
            </h2>
            <p className="mx-auto mt-3 max-w-md font-body text-sm text-[#6e5656]/60 sm:text-base">
              Gestes précis, brosses et rituels inspirés du Head Spa japonais.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 sm:items-end">
            {SOINS_PHOTOS.map((photo, i) => (
              <GalleryImage
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                label={photo.label}
                tall={i === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-[#6e5656]" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 80% 20%, rgba(232,168,178,0.55), transparent 55%), radial-gradient(ellipse 60% 60% at 10% 90%, rgba(240,207,207,0.35), transparent 50%)",
            }}
          />
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <p className="font-display text-xs tracking-[0.3em] text-[#f8d5da] uppercase">
              Réservation
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium text-white sm:text-4xl md:text-5xl">
              Prêt à découvrir le Head Spa ?
            </h2>
            <p className="mx-auto mt-4 max-w-lg font-body text-base text-white/70 sm:text-lg">
              Réservez votre séance et offrez-vous un moment de bien-être unique.
            </p>
            <Link
              to="/contact"
              className="mt-9 inline-flex rounded-full bg-white px-10 py-4 font-body text-sm font-semibold tracking-wide text-[#6e5656] shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Réserver maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
