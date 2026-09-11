import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api.config.js";

export function useActivePromotions() {
  const [services, setServices] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/promotions/active`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setServices(data.data?.services || {});
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return services;
}

export function getPromoForService(servicesMap, bookingName, { giftCard = false } = {}) {
  if (!bookingName || !servicesMap) return null;
  const entry = servicesMap[bookingName];
  if (!entry) return null;
  if (giftCard) return entry.giftCard || null;
  if (entry.price != null && entry.catalog != null && entry.price < entry.catalog) {
    return entry;
  }
  return null;
}
