import React from "react";

function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/landing.png')",
          backgroundPosition: "center 60%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl font-light text-white mb-6 tracking-wide">
            Bienvenue dans
          </h1>
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-7xl font-extrabold text-[#f0cfcf] mb-8 drop-shadow-2xl">
            Le cocon de Laura
          </h2>
          <div className="w-24 h-1 bg-[#f0cfcf] mx-auto mb-8 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
