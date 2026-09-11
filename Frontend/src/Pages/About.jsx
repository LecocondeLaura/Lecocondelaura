import React, { useState } from "react";
import { Link } from "react-router-dom";
import lauraPhoto from "../assets/Laura.jpg";
import { FallingPetals } from "../Components/UI/SakuraBranches";

/** Date de naissance Laura — l’âge s’incrémente automatiquement au 24 août */
const LAURA_BIRTHDATE = { year: 2001, month: 7, day: 24 }; // mois 0-indexé (août = 7)

function getLauraAge(now = new Date()) {
  let age = now.getFullYear() - LAURA_BIRTHDATE.year;
  const beforeBirthday =
    now.getMonth() < LAURA_BIRTHDATE.month ||
    (now.getMonth() === LAURA_BIRTHDATE.month &&
      now.getDate() < LAURA_BIRTHDATE.day);
  if (beforeBirthday) age -= 1;
  return age;
}

function About() {
  const [lauraPhotoFailed, setLauraPhotoFailed] = useState(false);
  const lauraAge = getLauraAge();

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
        <FallingPetals />

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
          <div className="relative mx-auto flex w-full max-w-[340px] justify-center sm:max-w-[380px] md:max-w-none">
            <div
              className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-br from-[#f0cfcf]/50 via-[#f8d5da]/30 to-transparent blur-2xl"
              aria-hidden
            />
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
              J’ai {lauraAge} ans, infirmière de métier et praticienne Head Spa.
              J’ai décidé d’apporter du bien-être aux gens d’une autre façon que
              par le paramédical.
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
