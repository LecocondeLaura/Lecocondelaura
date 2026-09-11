/** Noms de soins pour réservation / dashboard / cartes cadeaux */
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

/** Retrouve le libellé de réservation à partir d’un soin (Service.json) */
export function getBookingNameForService(service) {
  if (!service?.title) return "";
  return (
    BOOKING_SERVICES.find((name) => name.includes(service.title)) || ""
  );
}
