import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    nom: {
      type: String,
      trim: true,
    },
    prenom: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    // Informations supplémentaires
    allergies: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    preferences: {
      type: String,
      default: "",
      trim: true,
    },
    autresInfos: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Note: L'index unique sur email est déjà créé automatiquement par unique: true

const Client = mongoose.model("Client", clientSchema);

export default Client;
