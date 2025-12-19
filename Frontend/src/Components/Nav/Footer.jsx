import React from "react";
import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Ne pas afficher le Footer sur les pages login et dashboard
  if (location.pathname === "/login" || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <footer className="bg-[#47403B] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="md:text-center md:justify-center md:items-center flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col md:flex-row text-center md:items-center md:justify-end gap-4 md:gap-6">
            <Link
              to="/mentions-legales"
              className="text-sm md:text-base text-white/80 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline"
            >
              Mentions légales
            </Link>
            <Link
              to="/politique-confidentialite"
              className="text-sm md:text-base text-white/80 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>

        <div className="border-t border-white/20 my-2"></div>

        <div className="text-center">
          <p className="text-sm md:text-base mb-2">
            © {currentYear} Le cocon de Laura – Tous droits réservés
          </p>
          <p className="text-xs md:text-sm text-white/60">
            Site réalisé par{" "}
            <a
              href="https://florentindev.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline"
            >
              Florentin Fallon
            </a>{" "}
            – Développeur web
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
