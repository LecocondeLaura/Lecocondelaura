import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://www.lecocondelaura.fr";
const DEFAULT = {
  title: "Le Cocon de Laura | Head Spa japonais à Jonzac (17)",
  description:
    "Head Spa japonais à Jonzac : rituels en salon, Head Spa Mobile en entreprise / hôtel / EHPAD. Découvrez les soins et réservez en ligne.",
};

const PAGES = {
  "/": DEFAULT,
  "/services": {
    title: "Soins Head Spa | Le Cocon de Laura — Jonzac",
    description:
      "Soin Découverte, Kodomo, Rituel Détente et Rituel Ultime. Découvrez les rituels Head Spa japonais au Cocon de Laura à Jonzac.",
  },
  "/head-spa-mobile": {
    title: "Head Spa Mobile | Le Cocon de Laura — entreprises, hôtels, EHPAD",
    description:
      "Le salon se déplace : Head Spa Mobile pour entreprises, hôtels & spa et EHPAD. Demandez un devis au Cocon de Laura.",
  },
  "/contact": {
    title: "Réserver un Head Spa | Le Cocon de Laura — Jonzac",
    description:
      "Réservez votre soin Head Spa en ligne : 70 rue Sadi Carnot, 17500 Jonzac. Réponse rapide par email ou téléphone.",
  },
  "/about": {
    title: "À propos | Le Cocon de Laura — Head Spa à Jonzac",
    description:
      "Laura vous accueille dans son Head Spa japonais à Jonzac pour un moment de douceur et de lâcher-prise.",
  },
  "/instagram": {
    title: "Instagram | Le Cocon de Laura",
    description:
      "Coulisses et bienfaits du Head Spa — suivez Le Cocon de Laura sur Instagram.",
  },
  "/mentions-legales": {
    title: "Mentions légales | Le Cocon de Laura",
    description: "Mentions légales du site Le Cocon de Laura.",
  },
  "/politique-confidentialite": {
    title: "Politique de confidentialité | Le Cocon de Laura",
    description:
      "Politique de confidentialité et protection des données — Le Cocon de Laura.",
  },
};

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Titres / descriptions par page pour Google (sitelinks + snippets). */
function Seo() {
  const { pathname } = useLocation();
  const page = PAGES[pathname] || DEFAULT;
  const url = `${SITE}${pathname === "/" ? "/" : pathname}`;

  useEffect(() => {
    document.title = page.title;
    upsertMeta("name", "description", page.description);
    upsertMeta("property", "og:title", page.title);
    upsertMeta("property", "og:description", page.description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", page.title);
    upsertMeta("name", "twitter:description", page.description);
    upsertLink("canonical", url);
  }, [pathname, page.title, page.description, url]);

  return null;
}

export default Seo;
