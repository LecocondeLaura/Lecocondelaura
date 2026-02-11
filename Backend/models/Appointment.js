import mongoose from "mongoose";

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
      enum: ["especes", "cheque"],
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
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour éviter les doublons (même date + même heure)
appointmentSchema.index({ date: 1, heure: 1, status: 1 });

// Fonction pour obtenir la durée du soin en minutes
const getServiceDuration = (serviceName) => {
  if (!serviceName) return 60;
  if (serviceName.includes("45min")) return 45;
  if (serviceName.includes("60min")) return 60;
  if (serviceName.includes("90min")) return 90;
  return 60; // Par défaut
};

// Fonction pour obtenir les créneaux bloqués selon la durée du soin
const getBlockedSlots = (startTime, serviceName) => {
  const allTimes = ["09:00", "11:00", "14:00", "16:00", "18:00"];
  const duration = getServiceDuration(serviceName);
  let blockedSlots = [startTime];
  
  // Convertir l'heure en minutes depuis minuit
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  
  const startMinutes = timeToMinutes(startTime);
  let blockedMinutes;
  
  if (duration === 45 || duration === 60) {
    // Pour 45min ou 1h → bloquer 1h30 (90 minutes)
    blockedMinutes = startMinutes + 90;
  } else if (duration === 90) {
    // Pour 1h30 → bloquer 2h (120 minutes)
    blockedMinutes = startMinutes + 120;
  } else {
    blockedMinutes = startMinutes + 90; // Par défaut
  }
  
  // Trouver tous les créneaux qui se chevauchent
  allTimes.forEach((time) => {
    const timeMinutes = timeToMinutes(time);
    // Si le créneau commence avant la fin du soin, il est bloqué
    if (timeMinutes >= startMinutes && timeMinutes < blockedMinutes) {
      if (!blockedSlots.includes(time)) {
        blockedSlots.push(time);
      }
    }
  });
  
  return blockedSlots;
};

// Vérifier si un créneau est disponible
appointmentSchema.statics.isTimeSlotAvailable = async function (date, heure, service) {
  // Vérifier si le créneau exact est déjà pris
  const existing = await this.findOne({
    date: new Date(date),
    heure: heure,
    status: { $in: ["pending", "confirmed", "completed"] },
  });
  
  if (existing) {
    return false;
  }
  
  // Récupérer tous les rendez-vous de cette date
  const dateObj = new Date(date);
  const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
  const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
  
  const reservedAppointments = await this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "confirmed", "completed"] },
  }).select("heure service");
  
  // Calculer les créneaux bloqués par notre nouveau rendez-vous
  const newBlockedSlots = getBlockedSlots(heure, service);
  
  // Vérifier si notre nouveau rendez-vous chevauche avec un rendez-vous existant
  for (const apt of reservedAppointments) {
    const existingBlockedSlots = getBlockedSlots(apt.heure, apt.service);
    // Si un créneau bloqué par notre nouveau rendez-vous est dans les créneaux bloqués d'un rendez-vous existant
    if (newBlockedSlots.some((slot) => existingBlockedSlots.includes(slot))) {
      return false;
    }
  }
  
  return true;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
