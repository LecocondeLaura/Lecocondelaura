import React from "react";
import { Link } from "react-router-dom";
import ServicesPreview from "../Components/UI/ServicesPreview";

function Services() {
  return (
    <div className="relative min-h-screen bg-[#faf6f4] pt-28 pb-20 sm:pb-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[280px] opacity-60 sm:h-[360px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(248,213,218,0.5), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 sm:px-5 lg:px-6 xl:px-8">
        <header className="mb-10 text-center sm:mb-12">
          <p className="mb-3 font-display text-sm tracking-[0.25em] text-[#c97886] uppercase">
            Les rituels
          </p>
          <h1 className="font-display text-3xl font-medium text-[#6e5656] sm:text-4xl md:text-5xl lg:text-6xl">
            Head Spa japonais
          </h1>
          <div className="mx-auto mt-5 h-px w-16 bg-[#e8a8b2]/80" />
          <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-[#6e5656]/65 sm:text-lg">
            Quatre rituels autour du cuir chevelu — du soin découverte au rituel
            ultime — pour une détente profonde, à votre rythme.
          </p>
        </header>

        <ServicesPreview showDiscoverButton={false} hideHeader />

        <div className="relative z-10 mx-auto mt-14 max-w-3xl rounded-[2rem] sm:mt-16">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#6e5656] via-[#5a4343] to-[#c97886]/70" />
          <div className="relative px-6 py-12 text-center text-white sm:px-12 sm:py-14">
            <p className="mb-2 font-display text-sm tracking-[0.2em] text-[#f8d5da] uppercase">
              Réservation
            </p>
            <h2 className="font-display text-2xl font-medium sm:text-3xl md:text-4xl">
              Offrez-vous un moment de douceur
            </h2>
            <p className="mx-auto mt-4 max-w-md font-body text-sm text-white/70 sm:text-base">
              Choisissez votre soin et réservez en quelques minutes.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-[#6e5656] shadow-lg transition-all hover:scale-105"
            >
              Réserver maintenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
