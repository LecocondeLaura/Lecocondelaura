import React from "react";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-24 pb-20 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1 className="text-9xl font-black text-[#f0cfcf]">LE COCON</h1>
          </div>
          <div className="relative z-10">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-[#8b6f6f] mb-6 leading-tight">
              Le cocon
              <br />
              <span className="text-5xl sm:text-6xl md:text-7xl text-[#f0cfcf]">
                de Laura
              </span>
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mx-auto mb-8 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-[#8b6f6f] mb-6">
              Bienvenue dans l'univers du Head Spa Japonais
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Le Cocon de Laura est un espace dédié au bien-être et à la
              détente, spécialisé dans l'art du head spa japonais. Inspiré des
              traditions ancestrales du Japon, chaque soin est conçu pour vous
              offrir un moment de relaxation profonde et de régénération.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Notre approche combine massage du cuir chevelu avec des techniques
              de relaxation pour une expérience de bien-être complète. Chaque
              rituel est personnalisé selon vos besoins et vos préférences.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#f0cfcf] to-[#e0bfbf] rounded-3xl p-12 shadow-2xl">
            <div className="text-center text-white">
              <div className="text-7xl mb-6">🌸</div>
              <h3 className="text-3xl font-black mb-4">Philosophie</h3>
              <p className="text-white/90 text-lg leading-relaxed">
                "Prendre soin de soi est un art. Chaque moment de détente est
                une opportunité de se reconnecter avec son bien-être intérieur."
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#f0cfcf]/50 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              ✨
            </div>
            <h3 className="text-2xl font-bold text-[#8b6f6f] mb-3">
              Expertise
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Techniques japonaises authentiques maîtrisées pour un soin
              professionnel et efficace.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#f0cfcf]/50 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              🌿
            </div>
            <h3 className="text-2xl font-bold text-[#8b6f6f] mb-3">
              Produits Naturels
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Sélection de produits naturels et premium pour prendre soin de
              votre peau et de vos cheveux.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#f0cfcf]/50 group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              💆‍♀️
            </div>
            <h3 className="text-2xl font-bold text-[#8b6f6f] mb-3">
              Détente Totale
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Un environnement apaisant conçu pour votre bien-être et votre
              relaxation complète.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0cfcf] via-[#e0bfbf] to-[#f0cfcf] rounded-3xl transform rotate-1"></div>
          <div className="relative bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] rounded-3xl p-12 shadow-2xl text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Prêt à découvrir le Head Spa ?
            </h2>
            <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
              Réservez votre séance et offrez-vous un moment de bien-être
              unique.
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
  );
}

export default About;
