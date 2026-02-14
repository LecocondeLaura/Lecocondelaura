import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import appointmentRoutes from "./routes/appointments.js";
import reviewRoutes from "./routes/reviews.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import notificationRoutes from "./routes/notifications.js";
import closureRoutes from "./routes/closures.js";
import { startFollowUpScheduler } from "./services/followUpScheduler.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// CORS : autoriser le front (avec et sans www)
const frontOrigin = process.env.FRONTEND_URL?.replace(/\/+$/, "") || null;
const allowedOrigins = [];
if (frontOrigin) {
  allowedOrigins.push(frontOrigin);
  const withWww = frontOrigin.startsWith("https://www.")
    ? frontOrigin
    : frontOrigin.replace(/^(https:\/\/)/, "$1www.");
  const withoutWww = frontOrigin.replace(/^https:\/\/www\./, "https://");
  if (withWww !== frontOrigin) allowedOrigins.push(withWww);
  if (withoutWww !== frontOrigin) allowedOrigins.push(withoutWww);
}
const corsOptions =
  allowedOrigins.length > 0 ? { origin: allowedOrigins, credentials: true } : {};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/closures", closureRoutes);

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

      // Démarrer le planificateur automatique des emails de suivi
      startFollowUpScheduler();
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
