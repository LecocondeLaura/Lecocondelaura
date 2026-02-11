import React from "react";
import ServicesPreview from "../Components/UI/ServicesPreview";
function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-24 pb-20 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-5xl xl:max-w-[1000px] mx-auto">
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1 className="text-9xl font-black text-[#f0cfcf]">HEAD SPA</h1>
          </div>
          <div className="relative z-10">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-[#8b6f6f] mb-6 leading-tight">
              Head Spa
              <br />
              <span className="text-5xl sm:text-6xl md:text-7xl text-[#f0cfcf]">
                Japonais
              </span>
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez l'art du head spa japonais, un rituel de bien-être
              unique impliquant le cuir chevelu pour une détente totale.
            </p>
          </div>
        </div>

        <ServicesPreview showDiscoverButton={false} />

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0cfcf] via-[#e0bfbf] to-[#f0cfcf] rounded-3xl transform rotate-1"></div>
          <div className="relative bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] rounded-3xl p-12 shadow-2xl">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Prêt pour votre moment de détente ?
              </h2>
              <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
                Réservez dès maintenant votre séance de head spa et offrez-vous
                un moment de bien-être unique.
              </p>
              <a
                href="/contact"
                className="inline-block bg-white text-[#8b6f6f] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg"
              >
                Réserver maintenant
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
