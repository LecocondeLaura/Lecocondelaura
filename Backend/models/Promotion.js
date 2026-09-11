import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "amount"],
      default: "percent",
    },
    discountValue: {
      type: Number,
      required: [true, "La réduction est requise"],
      min: 0,
    },
    services: {
      type: [String],
      default: [],
    },
    applyToGiftCards: {
      type: Boolean,
      default: true,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
