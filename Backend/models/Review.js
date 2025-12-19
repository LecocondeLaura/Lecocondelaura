import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Le message est requis"],
      trim: true,
      maxlength: [300, "Le message ne peut pas dépasser 300 caractères"],
    },
    date: {
      type: Date,
      required: [true, "La date de séance est requise"],
    },
    initials: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour améliorer les performances des requêtes
reviewSchema.index({ status: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
