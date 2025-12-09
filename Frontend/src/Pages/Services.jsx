import React from "react";

function Services() {
  const services = [
    {
      id: 1,
      title: "Kodomo ~ 子ども",
      description:
        "Massage du cuir chevelu, soin du visage et relaxation complète pour un moment de détente absolu.",
      duration: "45min",
      price: "50€",
      features: [
        "Massage du cuir chevelu",
        "Soin du visage",
        "Relaxation",
        "Cuir chevelu et visage",
      ],
    },
    {
      id: 2,
      title: "Nagomi ~ 和み",
      description:
        "Expérience complète avec soin profond, masque hydratant et massage aux huiles essentielles japonaises.",
      duration: "60 min",
      price: "100€",
      features: [
        "Massage du cuir chevelu",
        "Soin visage premium",
        "Masque hydratant",
        "Huiles essentielles",
      ],
    },
    {
      id: 3,
      title: "Takumi ~ 匠",
      description:
        "Soin express pour une pause bien-être rapide, idéal pour une détente en milieu de journée.",
      duration: "90 min",
      price: "120€",
      features: [
        "Massage du cuir chevelu",
        "Soin express",
        "Cuir chevelu",
        "Relaxation",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-24 pb-20 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1 className="text-9xl font-black text-[#f0cfcf]">HEAD SPA</h1>
          </div>
          <div className="relative z-10">
            <div className="inline-block mb-6">
              <span className="text-sm font-semibold text-[#f0cfcf] uppercase tracking-wider bg-[#f0cfcf]/10 px-4 py-2 rounded-full">
                Spécialité
              </span>
            </div>
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
              unique impliquant le cuir chevelu pour
              une détente totale.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#f0cfcf]/50"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="relative p-8">
                <h3 className="text-xl text-center font-bold text-[#8b6f6f] mb-4 group-hover:text-[#f0cfcf] transition-colors">
                  Head Spa <br />
                  <span className="text-2xl text-[#8b6f6f]">
                    {service.title}
                  </span>
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed min-h-[60px]">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <span className="text-[#f0cfcf] mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-gray-100">
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
