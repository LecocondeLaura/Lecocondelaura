import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

const ALL_SLOT_TIMES = ["09:00", "11:00", "14:00", "16:00", "18:00"];
const MORNING_SLOTS = ["09:00", "11:00"];
const AFTERNOON_SLOTS = ["14:00", "16:00", "18:00"];

function slotsForTimeScope(timeScope) {
  if (timeScope === "morning") return MORNING_SLOTS;
  if (timeScope === "afternoon") return AFTERNOON_SLOTS;
  return ALL_SLOT_TIMES;
}

// endDate doit être >= startDate ; hors mode custom, ne pas garder blockedSlots
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
  const dateStr =
    typeof dateInput === "string"
      ? dateInput.split("T")[0]
      : new Date(dateInput).toISOString().split("T")[0];

  const closures = await this.find({}).lean();
  const blocked = new Set();
  for (const c of closures) {
    const startStr = new Date(c.startDate).toISOString().split("T")[0];
    const endStr = new Date(c.endDate).toISOString().split("T")[0];
    if (dateStr >= startStr && dateStr <= endStr) {
      const scope = c.timeScope || "full";
      let slots;
      if (scope === "custom") {
        slots = (c.blockedSlots || []).filter((t) =>
          ALL_SLOT_TIMES.includes(t)
        );
      } else {
        slots = slotsForTimeScope(scope);
      }
      slots.forEach((t) => blocked.add(t));
    }
  }
  return blocked;
};

const Closure = mongoose.model("Closure", closureSchema);

export default Closure;
