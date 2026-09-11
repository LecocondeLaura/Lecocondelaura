import mongoose from "mongoose";

/**
 * Réglages singleton pour l'affichage des avis Google sur la landing.
 * Mis à jour depuis le dashboard (sans clé API Google).
 */
const googleReviewSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    reviewCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    mapsUrl: {
      type: String,
      required: true,
      trim: true,
      default: "https://maps.app.goo.gl/fjQKdWRihyL9nJN39",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "GoogleReviewSettings",
  googleReviewSettingsSchema
);
