import React from "react";

function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0cfcf] via-[#f5d9d9] to-[#faf0f0] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Titre */}
        <h1 className="text-6xl md:text-8xl font-alex-brush text-[#8b6f6f] mb-8 animate-fade-in">
          Le cocon de Laura
        </h1>

        {/* Message principal */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-white/50">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#8b6f6f] mb-6">
            Ouverture prochainement
          </h2>
          <p className="text-xl md:text-2xl text-[#6b5b5b] mb-4 leading-relaxed">
            Nous préparons quelque chose de merveilleux pour vous.
          </p>
          <p className="text-lg md:text-xl text-[#8b6f6f] leading-relaxed">
            Revenez bientôt pour découvrir notre univers de bien-être et de
            détente.
          </p>
        </div>

        {/* Icône décorative */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/50">
            <svg
              className="w-12 h-12 md:w-16 md:h-16 text-[#8b6f6f]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Message de contact optionnel */}
        <div className="text-center">
          <p className="text-[#8b6f6f] text-lg">
            En attendant, suivez-nous sur nos réseaux sociaux
          </p>
        </div>
      </div>

      {/* Animation de particules décoratives */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#8b6f6f]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#8b6f6f]/20 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-[#8b6f6f]/30 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-[#8b6f6f]/20 rounded-full animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}

export default ComingSoon;
