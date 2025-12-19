import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import appointmentRoutes from "./routes/appointments.js";
import reviewRoutes from "./routes/reviews.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API Le Cocon de Laura - Backend opérationnel" });
});

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Démarrer le serveur
connectDB().then(() => {
  app
    .listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API disponible sur http://localhost:${PORT}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Le port ${PORT} est déjà utilisé.`);
        console.log(
          `💡 Solution : Changez le PORT dans le fichier .env ou tuez le processus avec : kill -9 $(lsof -ti:${PORT})`
        );
        process.exit(1);
      } else {
        throw err;
      }
    });
});

export default app;
