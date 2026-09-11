import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import servicesData from "../../Data/Service.json";
import { getBookingNameForService } from "../../Data/bookingServices.js";

function ServicesPreview({ showDiscoverButton = true, hideHeader = false }) {
  const services = servicesData.map((service) => ({
    ...service,
    price: `${service.price.cabinet}€`,
    bookingName: getBookingNameForService(service),
  }));

  return (
    <section
      className={`relative w-full ${hideHeader ? "py-4" : "bg-[#faf6f4] py-16 sm:py-20 md:py-24"}`}
    >
      <div className="relative mx-auto w-full max-w-[1700px] px-4 sm:px-5 lg:px-6 xl:px-8">
        {!hideHeader && (
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-2 font-display text-sm tracking-[0.3em] text-[#c97886] uppercase">
              Les rituels
            </p>
            <h2 className="font-display text-3xl font-medium text-[#6e5656] sm:text-4xl md:text-5xl">
              Mes soins
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-base font-light leading-relaxed text-[#6e5656]/65 sm:text-lg">
              Quatre expériences Head Spa — choisissez celle qui vous appelle.
            </p>
            {showDiscoverButton && (
              <Link
                to="/services"
                className="group mt-6 inline-flex items-center gap-2 font-body text-sm font-medium text-[#6e5656] underline-offset-4 hover:text-[#c97886] hover:underline"
              >
                Voir tous les détails
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-6 sm:-mx-0 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid lg:grid-cols-4 lg:gap-5 xl:gap-6 [scrollbar-width:thin]">
          {services.map((service) => (
            <article
              key={service.id}
              className="group relative flex w-[min(82vw,340px)] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#f0cfcf] bg-white shadow-[0_20px_50px_-22px_rgba(110,86,86,0.35)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-20px_rgba(201,120,134,0.3)] sm:w-[min(60vw,380px)] lg:w-full lg:min-h-[520px]"
            >
              <div className="relative bg-gradient-to-br from-[#fdf6f5] via-[#f8e4e6] to-[#f0cfcf] px-5 pb-6 pt-8 text-center sm:px-6 sm:pt-9 lg:px-4 xl:px-6">
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.8), transparent 50%)",
                  }}
                  aria-hidden
                />
                <p className="relative font-body text-[11px] font-semibold tracking-[0.2em] text-[#c97886] uppercase">
                  Head Spa
                </p>
                <h3 className="relative mt-2 font-display text-[1.65rem] font-semibold leading-tight text-[#6e5656] transition-colors group-hover:text-[#c97886] sm:text-[1.85rem] xl:text-[1.9rem]">
                  {service.title}
                </h3>
                <p className="relative mt-1.5 font-body text-sm text-[#6e5656]/55">
                  {service.age}
                </p>
                <p className="relative mt-5 font-display text-4xl font-semibold text-[#c97886] xl:text-[2.75rem]">
                  {service.price}
                </p>
                <p className="relative mt-1 inline-flex items-center justify-center gap-1.5 font-body text-sm text-[#6e5656]/60">
                  <ClockIcon className="h-4 w-4" />
                  {service.duration}
                </p>
              </div>

              <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-4 xl:px-6">
                <ul className="flex-1 space-y-2.5">
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 font-body text-sm leading-snug text-gray-600"
                    >
                      <span className="mt-0.5 shrink-0 text-[#e8a8b2]">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={
                    service.bookingName
                      ? `/contact?service=${encodeURIComponent(service.bookingName)}`
                      : "/contact"
                  }
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#6e5656] py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-[#c97886]"
                >
                  Réserver
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesPreview;
