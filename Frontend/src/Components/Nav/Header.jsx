import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (
    location.pathname === "/login" ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  const linkClass = (path) =>
    `font-body text-base font-medium tracking-wide transition-colors ${
      isActive(path)
        ? "text-[#6e5656] border-b-2 border-[#c97886] pb-0.5"
        : "text-[#6e5656]/80 hover:text-[#6e5656]"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-3 mt-3 rounded-2xl border border-[#e8a8b2]/35 bg-[#f0cfcf]/95 shadow-md backdrop-blur-md sm:mx-4 sm:mt-4">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            to="/"
            className="font-alex-brush text-3xl text-[#6e5656] sm:text-4xl"
          >
            Le cocon de Laura
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className={linkClass("/")}>
              Accueil
            </Link>
            <Link to="/about" className={linkClass("/about")}>
              À propos
            </Link>
            <Link to="/services" className={linkClass("/services")}>
              Soins
            </Link>
            <Link
              to="/contact"
              className="rounded-full bg-[#6e5656] px-6 py-2.5 font-body text-sm font-semibold tracking-wide text-white shadow-md transition-all hover:scale-105 hover:bg-[#5a4343] hover:shadow-lg"
            >
              Réserver
            </Link>
          </div>

          <button
            className="text-[#6e5656] md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="space-y-3 border-t border-[#6e5656]/15 px-4 pb-4 pt-3 md:hidden">
            <Link
              to="/"
              className="block py-2 font-body text-[#6e5656]"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/about"
              className="block py-2 font-body text-[#6e5656]"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              to="/services"
              className="block py-2 font-body text-[#6e5656]"
              onClick={() => setIsMenuOpen(false)}
            >
              Soins
            </Link>
            <Link
              to="/contact"
              className="block rounded-full bg-[#6e5656] px-5 py-2.5 text-center font-body text-sm font-semibold text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Réserver
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
