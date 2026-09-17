/** Créneaux salon : toutes les 30 min de 9h à 18h */
export function buildHalfHourSlots(startH = 9, endH = 18) {
  const slots = [];
  for (let h = startH; h <= endH; h += 1) {
    for (const m of [0, 30]) {
      if (h === endH && m > 0) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export const ALL_SLOT_TIMES = buildHalfHourSlots(9, 18);
export const MORNING_SLOTS = ALL_SLOT_TIMES.filter((t) => t < "14:00");
export const AFTERNOON_SLOTS = ALL_SLOT_TIMES.filter((t) => t >= "14:00");

/** 30 min de préparation APRÈS le soin (pas avant) */
export const BUFFER_MINUTES = 30;

export const getServiceDuration = (serviceName) => {
  if (!serviceName) return 60;
  if (serviceName.includes("30min")) return 30;
  if (serviceName.includes("60min")) return 60;
  if (serviceName.includes("90min")) return 90;
  return 60;
};

export const timeToMinutes = (time) => {
  const [hours, minutes] = String(time || "0:0").split(":").map(Number);
  return hours * 60 + minutes;
};

/** Plage du soin seul (sans préparation) */
export const getCareRange = (startTime, serviceName) => {
  const start = timeToMinutes(startTime);
  const duration = getServiceDuration(serviceName);
  return { start, end: start + duration };
};

/**
 * Plage bloquée sur le planning = soin + 30 min après.
 * Ex. 14h / 60 min → bloque 14h → 15h30.
 */
export const getOccupiedRange = (startTime, serviceName) => {
  const start = timeToMinutes(startTime);
  const duration = getServiceDuration(serviceName);
  return { start, end: start + duration + BUFFER_MINUTES };
};

export const rangesOverlap = (a, b) => a.start < b.end && b.start < a.end;

/**
 * Deux RDV se chevauchent si leurs plages (soin + 30 min après) se croisent.
 * Ex. 13h30 / 30 min → occupe jusqu’à 14h30 → incompatible avec un RDV à 14h.
 */
export const appointmentsConflict = (
  candidateStart,
  candidateService,
  existingStart,
  existingService,
) =>
  rangesOverlap(
    getOccupiedRange(candidateStart, candidateService),
    getOccupiedRange(existingStart, existingService),
  );

export const getBlockedSlots = (startTime, serviceName) => {
  const occupied = getOccupiedRange(startTime, serviceName);
  return ALL_SLOT_TIMES.filter((time) => {
    const slotStart = timeToMinutes(time);
    return slotStart >= occupied.start && slotStart < occupied.end;
  });
};
