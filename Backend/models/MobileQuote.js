import mongoose from "mongoose";

const historyEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "created",
        "devis_envoye",
        "devis_signe",
        "acompte_recu",
        "paiement",
        "status",
        "note",
      ],
      required: true,
    },
    label: { type: String, required: true },
    detail: { type: String, default: "" },
    montant: { type: Number, default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const mobileQuoteSchema = new mongoose.Schema(
  {
    /** Nom de l'établissement */
    entreprise: {
      type: String,
      trim: true,
      default: "",
    },
    typeEtablissement: {
      type: String,
      enum: ["entreprise", "hotel_spa", "ephad", ""],
      default: "",
    },
    /** Prénom + nom de la personne qui fait la demande */
    contactNom: {
      type: String,
      trim: true,
      default: "",
    },
    /** Legacy (anciennes demandes) */
    nom: {
      type: String,
      trim: true,
      default: "",
    },
    prenom: {
      type: String,
      trim: true,
      default: "",
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
    /** Ville / lieu */
    lieu: {
      type: String,
      required: [true, "La ville est requise"],
      trim: true,
    },
    dateSouhaitee: {
      type: String,
      default: "",
      trim: true,
    },
    nombrePersonnes: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "quoted", "closed"],
      default: "pending",
    },
    montant: {
      type: Number,
      default: null,
      min: 0,
    },
    montantAcompte: {
      type: Number,
      default: null,
      min: 0,
    },
    moyenPaiement: {
      type: String,
      enum: ["especes", "cheque", "virement", "carte_cadeaux", null],
      default: null,
    },
    paiementEffectue: {
      type: Boolean,
      default: false,
    },
    /** Jours d'intervention (dates isolées) */
    joursIntervention: {
      type: [Date],
      default: [],
    },
    /** Legacy */
    dateDebutMission: {
      type: Date,
      default: null,
    },
    dateFinMission: {
      type: Date,
      default: null,
    },
    devisEnvoyeAt: {
      type: Date,
      default: null,
    },
    devisSigneAt: {
      type: Date,
      default: null,
    },
    acompteRecuAt: {
      type: Date,
      default: null,
    },
    linkedClosureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Closure",
      default: null,
    },
    linkedClosureIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Closure",
      default: [],
    },
    notesInternes: {
      type: String,
      default: "",
      trim: true,
    },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

mobileQuoteSchema.index({ createdAt: -1 });
mobileQuoteSchema.index({ status: 1 });
mobileQuoteSchema.index({ paiementEffectue: 1 });
mobileQuoteSchema.index({ acompteRecuAt: 1 });
mobileQuoteSchema.index({ joursIntervention: 1 });

const MobileQuote = mongoose.model("MobileQuote", mobileQuoteSchema);

export default MobileQuote;
