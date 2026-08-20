import express from "express";
import Expense from "../models/Expense.js";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";
import { getPriceForService } from "../services/emailService.js";

const router = express.Router();

const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getYearRange = (year) => {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
};

const sumRevenue = (list) =>
  list.reduce((acc, apt) => acc + (getPriceForService(apt.service) || 0), 0);

const computeRevenue = async (start, end) => {
  const paidMassageFilter = {
    paiementEffectue: true,
    status: { $in: ["pending", "confirmed", "completed"] },
    carteCadeaux: false,
    moyenPaiement: { $ne: "carte_cadeaux" },
  };
  const paidGiftCardFilter = {
    paiementEffectue: true,
    carteCadeaux: true,
  };

  const [massages, giftCards] = await Promise.all([
    Appointment.find({
      ...paidMassageFilter,
      date: { $gte: start, $lte: end },
    }).select("service"),
    Appointment.find({
      ...paidGiftCardFilter,
      createdAt: { $gte: start, $lte: end },
    }).select("service"),
  ]);

  const massageRevenue = sumRevenue(massages);
  const giftCardsRevenue = sumRevenue(giftCards);

  return {
    massages: massageRevenue,
    giftCards: giftCardsRevenue,
    total: massageRevenue + giftCardsRevenue,
  };
};

// GET - Dépenses + résumé CA pour un mois (ou une année si month absent)
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const monthParam = req.query.month;
    const month =
      monthParam != null && monthParam !== ""
        ? parseInt(monthParam, 10)
        : null;

    let start;
    let end;
    let periodLabel;

    if (month != null && month >= 1 && month <= 12) {
      ({ start, end } = getMonthRange(year, month));
      periodLabel = `${year}-${String(month).padStart(2, "0")}`;
    } else {
      ({ start, end } = getYearRange(year));
      periodLabel = String(year);
    }

    const [expenses, revenue] = await Promise.all([
      Expense.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      computeRevenue(start, end),
    ]);

    const totalExpenses = expenses.reduce(
      (acc, e) => acc + (e.montant || 0),
      0
    );

    res.json({
      success: true,
      data: {
        periodLabel,
        year,
        month: month || null,
        revenue,
        totalExpenses,
        balance: revenue.total - totalExpenses,
        expenses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des comptes",
      error: error.message,
    });
  }
});

// GET - Toutes les dépenses (optionnel)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des dépenses",
      error: error.message,
    });
  }
});

// POST - Créer une dépense
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nom, montant, date, categorie, notes } = req.body;

    if (!nom || montant == null || !date) {
      return res.status(400).json({
        success: false,
        message: "Nom, montant et date sont requis",
      });
    }

    const amount = Number(montant);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Montant invalide",
      });
    }

    const expense = await Expense.create({
      nom: String(nom).trim(),
      montant: amount,
      date: new Date(date),
      categorie: categorie ? String(categorie).trim() : "",
      notes: notes ? String(notes).trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Dépense enregistrée",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la dépense",
      error: error.message,
    });
  }
});

// PUT - Modifier une dépense
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Dépense non trouvée",
      });
    }

    const { nom, montant, date, categorie, notes } = req.body;

    if (nom !== undefined) expense.nom = String(nom).trim();
    if (montant !== undefined) {
      const amount = Number(montant);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Montant invalide",
        });
      }
      expense.montant = amount;
    }
    if (date !== undefined) expense.date = new Date(date);
    if (categorie !== undefined) expense.categorie = String(categorie).trim();
    if (notes !== undefined) expense.notes = String(notes).trim();

    await expense.save();

    res.json({
      success: true,
      message: "Dépense mise à jour",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error.message,
    });
  }
});

// DELETE - Supprimer une dépense
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Dépense non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Dépense supprimée",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
});

export default router;
