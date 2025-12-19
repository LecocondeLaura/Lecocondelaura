import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Ne pas afficher le Header sur les pages login et dashboard
  if (location.pathname === "/login" || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-4 mt-4 bg-[#f0cfcf] backdrop-blur-md rounded-2xl border border-transparent shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-white font-semibold text-xl">
              <Link
                to="/"
                className="text-[#8b6f6f] text-4xl font-alex-brush ml-4"
              >
                Le cocon de Laura
              </Link>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-white text-xl font-semibold hover:text-white transition-colors ${
                isActive("/") ? "border-b-2 border-white" : ""
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/about"
              className={`text-white text-xl font-semibold hover:text-white transition-colors ${
                isActive("/about") ? "border-b-2 border-white" : ""
              }`}
            >
              À propos
            </Link>
            <Link
              to="/services"
              className={`text-white text-xl font-semibold hover:text-white transition-colors ${
                isActive("/services") ? "border-b-2 border-white" : ""
              }`}
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="text-white text-xl font-semibold hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-2 rounded-full bg-[#8b6f6f] shadow-md"
            >
              Réserver
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-white/80 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-3 border-t border-white/30 mt-4 pt-4">
            <Link
              to="/"
              className={`block py-2 text-xl font-semibold text-white hover:text-white transition-colors ${
                isActive("/") ? "border-l-4 border-white pl-2" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/about"
              className={`block py-2 text-xl font-semibold text-white hover:text-white transition-colors ${
                isActive("/about") ? "border-l-4 border-white pl-2" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              to="/services"
              className={`block py-2 text-xl font-semibold text-white hover:text-white transition-colors ${
                isActive("/services") ? "border-l-4 border-white pl-2" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="block text-white text-xl font-semibold hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-2 rounded-full bg-[#e0bfbf] hover:bg-[#d9b3b3] shadow-md text-center"
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
