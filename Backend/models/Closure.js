import mongoose from "mongoose";
import {
  ALL_SLOT_TIMES,
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
} from "../services/slotTimes.js";

const closureSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
    /** Si false : les créneaux sont retirés du formulaire mais pas annoncés comme congés aux clients */
    visibleToClients: {
      type: Boolean,
      default: true,
    },
    /** Portée horaire : journée entière, matinée, après-midi ou créneaux précis (chaque jour de la plage) */
    timeScope: {
      type: String,
      enum: ["full", "morning", "afternoon", "custom"],
      default: "full",
    },
    /** Si timeScope === custom : heures retirées du formulaire (mêmes créneaux chaque jour de la plage) */
    blockedSlots: {
      type: [String],
      default: [],
    },
    /** Origine : congés salon vs Head Spa Mobile (couleur agenda) */
    kind: {
      type: String,
      enum: ["closure", "head_spa_mobile"],
      default: "closure",
    },
  },
  { timestamps: true },
);

function slotsForTimeScope(timeScope) {
  if (timeScope === "morning") return MORNING_SLOTS;
  if (timeScope === "afternoon") return AFTERNOON_SLOTS;
  return ALL_SLOT_TIMES;
}

closureSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    this.endDate = this.startDate;
  }
  if (this.timeScope !== "custom") {
    this.blockedSlots = [];
  }
  next();
});

closureSchema.statics.getBlockedSlotTimesForDate = async function (dateInput) {
  const info = await this.getBlockInfoForDate(dateInput);
  return info.blocked;
};

closureSchema.statics.getBlockInfoForDate = async function (dateInput) {
  const dateStr =
    typeof dateInput === "string"
      ? dateInput.split("T")[0]
      : new Date(dateInput).toISOString().split("T")[0];

  const closures = await this.find({}).lean();
  const blocked = new Set();
  const matching = [];

  for (const c of closures) {
    const startStr = new Date(c.startDate).toISOString().split("T")[0];
    const endStr = new Date(c.endDate).toISOString().split("T")[0];
    if (dateStr >= startStr && dateStr <= endStr) {
      matching.push(c);
      const scope = c.timeScope || "full";
      let slots;
      if (scope === "custom") {
        slots = (c.blockedSlots || []).filter((t) =>
          ALL_SLOT_TIMES.includes(t),
        );
      } else {
        slots = slotsForTimeScope(scope);
      }
      slots.forEach((t) => blocked.add(t));
    }
  }

  const hasHsm = matching.some((c) => c.kind === "head_spa_mobile");
  const hasOther = matching.some((c) => c.kind !== "head_spa_mobile");
  const allSlotsBlocked = ALL_SLOT_TIMES.every((t) => blocked.has(t));

  return {
    blocked,
    hasHeadSpaMobile: hasHsm,
    isHeadSpaMobileDay: allSlotsBlocked && hasHsm && !hasOther,
  };
};

const Closure = mongoose.model("Closure", closureSchema);

export default Closure;
