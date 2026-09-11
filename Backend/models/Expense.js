import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de la dépense est requis"],
      trim: true,
    },
    montant: {
      type: Number,
      required: [true, "Le montant est requis"],
      min: [0, "Le montant doit être positif"],
    },
    date: {
      type: Date,
      required: [true, "La date est requise"],
    },
    categorie: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ date: -1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
