import mongoose from "mongoose";
import Closure from "./Closure.js";
import {
  ALL_SLOT_TIMES,
  appointmentsConflict,
} from "../services/slotTimes.js";

const appointmentSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      trim: true,
      lowercase: true,
    },
    telephone: {
      type: String,
      required: [true, "Le téléphone est requis"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Le service est requis"],
    },
    date: {
      type: Date,
      required: function () {
        return !this.carteCadeaux;
      },
    },
    heure: {
      type: String,
      required: function () {
        return !this.carteCadeaux;
      },
      validate: {
        validator: function (v) {
          // Si c'est une carte cadeaux, l'heure n'est pas requise
          if (this.carteCadeaux) return true;
          // Sinon, l'heure doit être présente et au bon format
          if (!v || v === "") return false;
          return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Format d'heure invalide (HH:MM requis pour les rendez-vous)",
      },
    },
    carteCadeaux: {
      type: Boolean,
      default: false,
    },
    paiementEffectue: {
      type: Boolean,
      default: false,
    },
    moyenPaiement: {
      type: String,
      enum: ["especes", "cheque", "virement", "carte_cadeaux"],
      default: null,
      trim: true,
    },
    carteCadeauEnvoyee: {
      type: Boolean,
      default: false,
    },
    codeCarteCadeau: {
      type: String,
      default: null,
      trim: true,
    },
    relanceEnvoyee: {
      type: Boolean,
      default: false,
    },
    dateRelance: {
      type: Date,
      default: null,
    },
    dateEnvoiCarte: {
      type: Date,
      default: null,
    },
    carteCadeauUtilisee: {
      type: Boolean,
      default: false,
    },
    suiviEmailEnvoye: {
      type: Boolean,
      default: false,
    },
    dateSuiviEmail: {
      type: Date,
      default: null,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "La note ne peut pas dépasser 2000 caractères"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    montant: {
      type: Number,
      default: null,
    },
    montantCatalogue: {
      type: Number,
      default: null,
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      default: null,
    },
    remisePourcent: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour éviter les doublons (même date + même heure)
appointmentSchema.index({ date: 1, heure: 1, status: 1 });

const isDateOnlyString = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getUtcDayRange = (dateInput) => {
  if (isDateOnlyString(dateInput)) {
    return {
      start: new Date(`${dateInput}T00:00:00.000Z`),
      end: new Date(`${dateInput}T23:59:59.999Z`),
    };
  }

  const dateObj = new Date(dateInput);
  const start = new Date(dateObj);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(dateObj);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

// Vérifier si un créneau est disponible (durée réelle du soin)
appointmentSchema.statics.isTimeSlotAvailable = async function (
  date,
  heure,
  service,
  excludeAppointmentId = null,
) {
  if (!ALL_SLOT_TIMES.includes(heure)) {
    return false;
  }

  const closureBlocked = await Closure.getBlockedSlotTimesForDate(date);
  if (closureBlocked.has(heure)) {
    return false;
  }

  const activeStatuses = ["pending", "confirmed", "completed"];
  const baseQuery =
    excludeAppointmentId != null
      ? {
          _id: { $ne: excludeAppointmentId },
          status: { $in: activeStatuses },
        }
      : { status: { $in: activeStatuses } };

  const { start: dayStart, end: dayEnd } = getUtcDayRange(date);

  const reservedAppointments = await this.find({
    ...baseQuery,
    date: {
      $gte: dayStart,
      $lte: dayEnd,
    },
  }).select("heure service");

  const candidateStart = heure;
  const candidateService = service;

  for (const apt of reservedAppointments) {
    if (!apt.heure) continue;
    if (
      appointmentsConflict(
        candidateStart,
        candidateService,
        apt.heure,
        apt.service,
      )
    ) {
      return false;
    }
  }

  return true;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
