import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

function HeadSpaMobilePreview() {
  return (
    <section className="relative overflow-hidden bg-[#faf6f4] py-14 sm:py-16 md:py-20">
      {/* Atmosphère douce — pas d’image full-bleed */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 60% at 12% 40%, rgba(240,207,207,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 45% 50% at 88% 70%, rgba(232,168,178,0.28) 0%, transparent 55%),
            linear-gradient(180deg, #fdf8f6 0%, #faf6f4 50%, #f5ebe8 100%)
          `,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-10">
        {/* Gauche : tag, titre, texte, CTA */}
        <div className="order-2 lg:order-1">
          <p className="font-display text-sm tracking-[0.35em] text-[#c97886] uppercase sm:text-base">
            Hors les murs
          </p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-[#6e5656] sm:text-5xl md:text-6xl">
            Head Spa{" "}
            <span className="font-alex-brush text-[#c97886]">Mobile</span>
          </h2>
          <p className="mt-5 max-w-md font-body text-base font-light leading-relaxed text-[#6e5656]/70 sm:text-lg">
            Laura se déplace en entreprise, hôtel &amp; spa ou EHPAD.
            Le même rituel japonais — là où vous êtes.
          </p>
          <div className="mt-9">
            <Link
              to="/head-spa-mobile"
              className="group inline-flex items-center gap-2 rounded-full bg-[#6e5656] px-8 py-3.5 font-body text-sm font-semibold tracking-[0.08em] text-white transition hover:bg-[#5a4343]"
            >
              Découvrir
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Droite : photo dans une forme originale */}
        <div className="order-1 lg:order-2 relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Forme d’ombre décalée */}
          <div
            className="absolute -right-3 top-6 h-[88%] w-[92%] bg-[#e8a8b2]/35 sm:-right-5 sm:top-8"
            style={{
              borderRadius: "58% 42% 38% 62% / 42% 48% 52% 58%",
            }}
            aria-hidden
          />
          {/* Conteneur photo — silhouette organique */}
          <div
            className="relative aspect-[5/5.5] max-h-[420px] sm:max-h-[460px] w-full overflow-hidden shadow-[0_28px_60px_-24px_rgba(110,86,86,0.45)] mx-auto"
            style={{
              borderRadius: "64% 36% 48% 52% / 48% 42% 58% 52%",
            }}
          >
            <img
              src="/landing.png"
              alt="Head Spa Mobile — soin hors salon"
              className="h-full w-full object-cover scale-105"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(253,248,246,0.15) 0%, transparent 40%, rgba(110,86,86,0.18) 100%)",
              }}
              aria-hidden
            />
          </div>
          {/* Accent floral léger */}
          <div
            className="pointer-events-none absolute -left-4 bottom-10 h-20 w-20 rounded-full bg-[#f0cfcf]/70 blur-xl sm:-left-6 sm:h-28 sm:w-28"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

export default HeadSpaMobilePreview;
