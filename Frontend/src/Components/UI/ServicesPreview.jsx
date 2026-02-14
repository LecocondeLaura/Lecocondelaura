import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import servicesData from "../../Data/Service.json";

function ServicesPreview({ showDiscoverButton = true }) {
  const services = servicesData.map((service) => ({
    ...service,
    price: `${service.price.cabinet}€`,
  }));

  return (
    <div className="max-w-7xl w-[90%] mx-auto mt-24 mb-32">
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-semibold text-[#8b6f6f]">
            Mes Soins
          </h1>
          {showDiscoverButton && (
            <Link
              to="/services"
              className="bg-[#8b6f6f] text-white px-5 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#5a524b] hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300 flex items-center gap-2 group"
            >
              Découvrir tous mes soins
              <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          )}
        </div>
        <div className="w-16 h-0.5 bg-[#8B827D]/40 mx-auto sm:mx-0 mb-6"></div>
        <p className="text-lg sm:text-xl text-[#8B827D] text-center md:text-left max-w-3xl leading-relaxed">
          Découvrez mes différentes approches de soins, toutes conçues pour vous
          accompagner vers un mieux-être profond et durable
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#f0cfcf]/50 h-full flex flex-col"
            style={{
              animationDelay: `${index * 200}ms`,
            }}
          >
            <div className="relative p-8 flex flex-col flex-1">
              <h3 className="text-xl text-center font-bold text-[#8b6f6f] mb-4 group-hover:text-[#f0cfcf] transition-colors">
                Head Spa <br />
                <span className="text-2xl text-[#8b6f6f]">
                  {service.title}
                  <br />
                  <span className="text-sm text-[#8b6f6f] group-hover:text-[#f0cfcf] transition-colors">
                    {service.age}
                  </span>
                </span>
              </h3>

              <ul className="space-y-2 mb-6 my-10 flex-1">
                {service.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm text-gray-600 "
                  >
                    <span className="text-[#f0cfcf] mr-2 my-1">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      {service.duration}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#f0cfcf]">
                      {service.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicesPreview;
