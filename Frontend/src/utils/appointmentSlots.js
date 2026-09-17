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

/** Matin : 9h → 12h30 */
export const MORNING_SLOTS = ALL_SLOT_TIMES.filter((t) => t < "14:00");

/** Après-midi : 14h → 18h */
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

export const minutesToTime = (total) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Plage du soin seul */
export const getCareRange = (startTime, serviceName) => {
  const start = timeToMinutes(startTime);
  const duration = getServiceDuration(serviceName);
  return { start, end: start + duration };
};

/** Plage bloquée = soin + 30 min après */
export const getOccupiedRange = (startTime, serviceName) => {
  const start = timeToMinutes(startTime);
  const duration = getServiceDuration(serviceName);
  return { start, end: start + duration + BUFFER_MINUTES };
};

export const rangesOverlap = (a, b) => a.start < b.end && b.start < a.end;

/** Nouveau RDV vs existant : les deux plages (soin + 30 min) ne doivent pas se croiser */
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

export const getBlockedSlots = (
  startTime,
  serviceName,
  allTimes = ALL_SLOT_TIMES,
) => {
  const occupied = getOccupiedRange(startTime, serviceName);
  return allTimes.filter((time) => {
    const slotStart = timeToMinutes(time);
    return slotStart >= occupied.start && slotStart < occupied.end;
  });
};

/** Filtre les créneaux libres selon la durée du soin choisi */
export const filterSlotsForService = ({
  allTimes = ALL_SLOT_TIMES,
  service,
  reservedAppointments = [],
  closureBlockedTimes = [],
}) => {
  const closureBlockedSet = new Set(closureBlockedTimes);
  const candidateService = service || "";

  return allTimes.filter((time) => {
    if (closureBlockedSet.has(time)) return false;
    return !reservedAppointments.some((apt) => {
      if (!apt?.heure) return false;
      return appointmentsConflict(
        time,
        candidateService,
        apt.heure,
        apt.service,
      );
    });
  });
};
