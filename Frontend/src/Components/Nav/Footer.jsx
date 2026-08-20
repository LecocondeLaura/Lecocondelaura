import React from "react";
import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  if (
    location.pathname === "/login" ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-washi">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-8">
          <Link
            to="/mentions-legales"
            className="font-body text-sm text-washi/70 transition-colors hover:text-washi"
          >
            Mentions légales
          </Link>
          <Link
            to="/politique-confidentialite"
            className="font-body text-sm text-washi/70 transition-colors hover:text-washi"
          >
            Politique de confidentialité
          </Link>
        </div>
        <div className="border-t border-washi/15 pt-6 text-center">
          <p className="font-alex-brush text-2xl text-sakura-soft">
            Le cocon de Laura
          </p>
          <p className="mt-2 font-body text-sm text-washi/60">
            © {currentYear} — Tous droits réservés
          </p>
          <p className="mt-2 font-body text-xs text-washi/40">
            Site réalisé par{" "}
            <a
              href="https://florentindev.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:text-washi/70 hover:underline"
            >
              Florentin Fallon
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
