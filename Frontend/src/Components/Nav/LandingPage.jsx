import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FallingPetals } from "../UI/SakuraBranches";
import API_BASE_URL from "../../config/api.config.js";

function StarRow({ rating }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
            i <= full ? "fill-[#c97886]" : "fill-[#e8a8b2]/35"
          }`}
        >
          <path d="M10 1.5l2.35 4.76 5.25.76-3.8 3.7.9 5.24L10 13.77 5.3 15.96l.9-5.24-3.8-3.7 5.25-.76L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function LandingPage() {
  const [google, setGoogle] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/google-reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success && data.data?.rating != null) {
          setGoogle(data.data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-x-hidden">
      {/* Fond */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 0%, #fff9f8 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 0% 60%, rgba(248,213,218,0.45) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 100% 55%, rgba(232,168,178,0.3) 0%, transparent 55%),
            linear-gradient(180deg, #fdf8f6 0%, #f5ebe8 55%, #efe4e0 100%)
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-30 spa-mist sm:opacity-40"
        style={{
          background:
            "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.55) 45%, transparent 70%)",
        }}
        aria-hidden
      />

      <FallingPetals />

      {/* Contenu */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:px-8 sm:pb-24 sm:pt-32">
        <p className="hero-fade-up font-display text-[11px] tracking-[0.35em] text-[#c97886]/90 uppercase sm:text-sm sm:tracking-[0.45em] md:text-base">
          Head Spa japonais · Jonzac
        </p>

        <p className="hero-fade-up hero-fade-up-delay mt-5 font-display text-lg font-light italic tracking-wide text-[#6e5656]/55 sm:mt-8 sm:text-2xl md:text-3xl">
          Bienvenue dans
        </p>

        <h1 className="hero-fade-up hero-fade-up-delay mt-1 w-full font-alex-brush text-[clamp(3rem,13vw,9.5rem)] leading-[0.95] text-[#6e5656] sm:mt-2">
          Le cocon de Laura
        </h1>

        <div className="hero-fade-up hero-fade-up-delay-2 mt-5 flex items-center gap-2.5 sm:mt-8 sm:gap-3">
          <span className="h-px w-8 bg-[#e8a8b2]/70 sm:w-14" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#e8a8b2]/80" aria-hidden />
          <span className="h-px w-8 bg-[#e8a8b2]/70 sm:w-14" />
        </div>

        <p className="hero-fade-up hero-fade-up-delay-2 mx-auto mt-5 max-w-2xl px-1 font-body text-base font-light leading-relaxed text-[#6e5656]/70 sm:mt-8 sm:text-lg md:text-xl">
          Un rituel de douceur pour le cuir chevelu.
          <br className="hidden sm:block" />
          Laissez le calme revenir, pétale après pétale.
        </p>

        {google && (
          <a
            href={google.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-fade-up hero-fade-up-delay-2 mt-6 inline-flex items-center gap-2.5 rounded-full border border-[#e8a8b2]/45 bg-white/55 px-5 py-2.5 backdrop-blur-sm transition hover:bg-white/80 sm:mt-8"
          >
            <StarRow rating={google.rating} />
            <span className="font-body text-sm font-medium text-[#6e5656]">
              {Number(google.rating).toFixed(1).replace(".", ",")}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#e8a8b2]" aria-hidden />
            <span className="font-body text-sm text-[#6e5656]/65">
              {google.reviewCount} avis Google
            </span>
          </a>
        )}

        <div className="hero-fade-up hero-fade-up-delay-3 mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-5">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[#6e5656] px-8 py-3.5 font-body text-sm font-medium tracking-[0.1em] text-white shadow-[0_16px_40px_-12px_rgba(110,86,86,0.55)] transition-colors hover:bg-[#5a4343] sm:min-w-[200px] sm:px-10 sm:py-4"
          >
            Réserver un soin
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center rounded-full border border-[#6e5656]/25 bg-white/50 px-8 py-3.5 font-body text-sm font-medium tracking-[0.1em] text-[#6e5656] backdrop-blur-sm transition-colors hover:border-[#c97886] hover:bg-white/80 sm:min-w-[200px] sm:px-10 sm:py-4"
          >
            Découvrir les rituels
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
