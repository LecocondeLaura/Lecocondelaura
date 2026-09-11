import Promotion from "../models/Promotion.js";

export const BOOKING_SERVICES = [
  "Head Spa Kodomo - 60min (enfant)",
  "Head Spa Soin Découverte - 30min",
  "Head Spa Rituel Détente - 60min",
  "Head Spa Rituel Ultime - 90min",
];

export function getCatalogPrice(serviceName) {
  if (!serviceName) return null;
  if (serviceName.includes("Découverte") || serviceName.includes("Decouverte"))
    return 50;
  if (serviceName.includes("Kodomo")) return 70;
  if (serviceName.includes("Rituel Détente")) return 120;
  if (serviceName.includes("Rituel Ultime")) return 140;
  return null;
}

export function applyDiscount(catalogPrice, promo) {
  if (catalogPrice == null || !promo) return catalogPrice;
  const value = Number(promo.discountValue);
  if (!Number.isFinite(value) || value <= 0) return catalogPrice;
  if (promo.discountType === "amount") {
    return Math.max(0, Math.round(catalogPrice - value));
  }
  const pct = Math.min(100, value);
  return Math.max(0, Math.round(catalogPrice * (1 - pct / 100)));
}

export function getAppointmentAmount(apt) {
  if (apt?.montant != null && apt.montant !== "") {
    const n = Number(apt.montant);
    if (Number.isFinite(n)) return n;
  }
  return getCatalogPrice(apt?.service) || 0;
}

export function promoAppliesToService(promo, serviceName, { giftCard = false } = {}) {
  if (!promo || !serviceName) return false;
  if (giftCard && promo.applyToGiftCards === false) return false;
  return Array.isArray(promo.services) && promo.services.includes(serviceName);
}

export function isPromoLive(promo, at = new Date()) {
  if (!promo?.active) return false;
  if (promo.startsAt && new Date(promo.startsAt) > at) return false;
  if (promo.endsAt && new Date(promo.endsAt) < at) return false;
  return true;
}

export async function getLivePromotions(at = new Date()) {
  const all = await Promotion.find({ active: true }).sort({ createdAt: -1 });
  return all.filter((p) => isPromoLive(p, at));
}

export function pickBestPromo(promos, serviceName, { giftCard = false } = {}) {
  const catalog = getCatalogPrice(serviceName);
  if (catalog == null) return null;
  let best = null;
  let bestPrice = catalog;
  for (const promo of promos) {
    if (!promoAppliesToService(promo, serviceName, { giftCard })) continue;
    const price = applyDiscount(catalog, promo);
    if (price < bestPrice) {
      best = promo;
      bestPrice = price;
    }
  }
  return best ? { promo: best, catalog, price: bestPrice } : null;
}

export async function quoteService(serviceName, { giftCard = false, at = new Date() } = {}) {
  const catalog = getCatalogPrice(serviceName);
  const live = await getLivePromotions(at);
  const best = pickBestPromo(live, serviceName, { giftCard });
  if (!best) {
    return {
      catalog,
      price: catalog,
      promotionId: null,
      badge: null,
      title: null,
    };
  }
  return {
    catalog: best.catalog,
    price: best.price,
    promotionId: best.promo._id,
    badge: formatPromoBadge(best.promo),
    title: best.promo.title,
    discountType: best.promo.discountType,
    discountValue: best.promo.discountValue,
    endsAt: best.promo.endsAt,
  };
}

export function formatPromoBadge(promo) {
  if (!promo) return null;
  if (promo.discountType === "amount") return `-${promo.discountValue} €`;
  return `-${promo.discountValue} %`;
}

export function serializePromoForPublic(promo, serviceName, { giftCard = false } = {}) {
  const catalog = getCatalogPrice(serviceName);
  if (catalog == null || !promoAppliesToService(promo, serviceName, { giftCard })) {
    return null;
  }
  const price = applyDiscount(catalog, promo);
  if (price >= catalog) return null;
  return {
    id: String(promo._id),
    title: promo.title,
    badge: formatPromoBadge(promo),
    catalog,
    price,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    endsAt: promo.endsAt || null,
    applyToGiftCards: promo.applyToGiftCards !== false,
  };
}

export async function buildPublicPromoMap() {
  const live = await getLivePromotions();
  const services = {};
  for (const name of BOOKING_SERVICES) {
    const best = pickBestPromo(live, name, { giftCard: false });
    const bestGift = pickBestPromo(live, name, { giftCard: true });
    if (best) {
      services[name] = {
        ...serializePromoForPublic(best.promo, name),
        giftCard: bestGift
          ? serializePromoForPublic(bestGift.promo, name, { giftCard: true })
          : null,
      };
    } else if (bestGift) {
      services[name] = {
        catalog: getCatalogPrice(name),
        price: getCatalogPrice(name),
        giftCard: serializePromoForPublic(bestGift.promo, name, {
          giftCard: true,
        }),
      };
    }
  }
  return { services };
}
