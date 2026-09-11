import React, { useState } from "react";
import {
  HomeIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  MapPinIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import MobileQuoteModal from "../Components/UI/MobileQuoteModal";

/** Déposer le PDF dans Frontend/public/ sous ce nom */
const PLAQUETTE_PDF_URL = "/plaquette-head-spa-mobile.pdf";
const PLAQUETTE_FILENAME = "Plaquette-Head-Spa-Mobile-Le-Cocon-de-Laura.pdf";

const HIGHLIGHTS = [
  {
    icon: HomeIcon,
    title: "Entreprises",
    text: "Proposer une véritable pause bien-être aux collaborateurs.",
  },
  {
    icon: BuildingOffice2Icon,
    title: "Hôtel & Spa",
    text: "Ajouter une expérience bien-être originale a votre établissement.",
  },
  {
    icon: SparklesIcon,
    title: "EHPAD",
    text: "Offrez un moment de détente aux résidents.",
  },
];

function HeadSpaMobile() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf6f4] pt-28 pb-20">
      <div
        className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-[#f0cfcf]/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-48 h-80 w-80 rounded-full bg-[#e8a8b2]/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center md:mb-16">
          <p className="mb-3 font-display text-sm tracking-[0.25em] text-[#c97886] uppercase">
            Le salon se déplace
          </p>
          <h1 className="font-display text-4xl font-medium text-[#6e5656] sm:text-5xl md:text-6xl">
            Head Spa{" "}
            <span className="font-alex-brush text-[#c97886]">Mobile</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-[#e8a8b2]/70" />
          <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-[#6e5656]/65 sm:text-lg">
            Le Head Spa Mobile, c&apos;est l&apos;expérience du Cocon de Laura
            qui vient à vous — Entreprises, Hôtel & Spa et EHPAD.
          </p>
        </header>

        <div className="mb-12 overflow-hidden rounded-[2rem] border border-[#f0cfcf] bg-white p-8 shadow-[0_24px_60px_-28px_rgba(110,86,86,0.3)] sm:p-10">
          <h2 className="font-display text-2xl font-medium text-[#6e5656] sm:text-3xl">
            Qu&apos;est-ce que le Head Spa Mobile ?
          </h2>
          <div className="mt-5 space-y-4 font-body text-base leading-relaxed text-[#6e5656]/70">
            <p>
              Laura apporte son expertise et son matériel professionnel pour
              vous offrir un soin Head Spa japonais hors du salon. Même douceur,
              mêmes gestes inspirés du rituel japonais — dans le lieu que vous
              choisissez.
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap gap-3">
            <li className="inline-flex items-center gap-2 rounded-full bg-[#f0cfcf]/40 px-4 py-2 font-body text-sm text-[#6e5656]">
              <MapPinIcon className="h-4 w-4 text-[#c97886]" />
              Nouvelle Aquitaine
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-[#f0cfcf]/40 px-4 py-2 font-body text-sm text-[#6e5656]">
              <DocumentTextIcon className="h-4 w-4 text-[#c97886]" />
              Devis personnalisé
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-[#f0cfcf]/40 px-4 py-2 font-body text-sm text-[#6e5656]">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#c97886]" />
              Formule adaptée à vos besoins
            </li>
          </ul>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#f0cfcf]/80 bg-white p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0cfcf]/50 text-[#c97886]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl text-[#6e5656] text-center">
                {title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-[#6e5656]/65">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Téléchargement plaquette */}
        <div className="mb-14 overflow-hidden rounded-[2rem] border border-[#f0cfcf] bg-white px-8 py-10 shadow-[0_20px_50px_-28px_rgba(110,86,86,0.28)] sm:px-10 sm:py-12">
          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:text-left">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f0cfcf]/55 text-[#c97886]">
              <DocumentTextIcon className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs tracking-[0.25em] text-[#c97886] uppercase">
                Documentation
              </p>
              <h2 className="mt-2 font-display text-2xl font-medium text-[#6e5656] sm:text-3xl">
                Télécharger la plaquette
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-[#6e5656]/65 sm:text-base">
                Découvrez l&apos;offre Head Spa Mobile en détail — formules,
                interventions hors salon et informations pratiques.
              </p>
            </div>
            <a
              href={PLAQUETTE_PDF_URL}
              download={PLAQUETTE_FILENAME}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#6e5656] px-7 py-3.5 font-body text-sm font-semibold tracking-wide text-white transition hover:bg-[#5a4343]"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Télécharger le PDF
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-[#6e5656] via-[#5a4343] to-[#c97886]/80 px-8 py-10 text-center text-white shadow-xl sm:px-12 sm:py-12">
          <h2 className="font-display text-2xl font-medium sm:text-3xl">
            Envie d&apos;un Head Spa chez vous ?
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-white/75 sm:text-base">
            Décrivez votre projet — Laura vous répond avec un devis adapté.
          </p>
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-[#6e5656] shadow-lg transition hover:scale-[1.02] hover:bg-[#fdf8f6]"
          >
            Demander un devis
          </button>
        </div>
      </div>

      <MobileQuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
    </div>
  );
}

export default HeadSpaMobile;
