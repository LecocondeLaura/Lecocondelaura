import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST - Connexion
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Nom d'utilisateur et mot de passe requis",
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" } // Token valide pendant 7 jours
    );

    res.json({
      success: true,
      message: "Connexion réussie",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: error.message,
    });
  }
});

// GET - Vérifier le token (pour vérifier si l'utilisateur est toujours connecté)
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token manquant",
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Token invalide",
          });
        }

        res.json({
          success: true,
          data: {
            user: {
              id: decoded.id,
              username: decoded.username,
              role: decoded.role,
            },
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification",
      error: error.message,
    });
  }
});

export default router;
