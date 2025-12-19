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
    carteCadeauEnvoyee: {
      type: Boolean,
      default: false,
    },
    codeCarteCadeau: {
      type: String,
      default: null,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour éviter les doublons (même date + même heure)
appointmentSchema.index({ date: 1, heure: 1, status: 1 });

// Vérifier si un créneau est disponible
appointmentSchema.statics.isTimeSlotAvailable = async function (date, heure) {
  const existing = await this.findOne({
    date: new Date(date),
    heure: heure,
    status: { $in: ["pending", "confirmed"] },
  });
  return !existing;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
