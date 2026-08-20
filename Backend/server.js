import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import appointmentRoutes from "./routes/appointments.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import notificationRoutes from "./routes/notifications.js";
import closureRoutes from "./routes/closures.js";
import expenseRoutes from "./routes/expenses.js";
import { startFollowUpScheduler } from "./services/followUpScheduler.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// CORS : en prod = uniquement FRONTEND_URL ; en dev = + localhost (Vite)
const frontOrigin = process.env.FRONTEND_URL?.replace(/\/+$/, "") || null;
const allowedOrigins = [];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
  );
}
if (frontOrigin) {
  const fullOrigin = frontOrigin.startsWith("http") ? frontOrigin : `https://${frontOrigin}`;
  allowedOrigins.push(fullOrigin);
  const withWww = fullOrigin.startsWith("https://www.")
    ? fullOrigin
    : fullOrigin.replace(/^(https:\/\/)/, "$1www.");
  const withoutWww = fullOrigin.replace(/^https:\/\/www\./, "https://");
  if (withWww !== fullOrigin) allowedOrigins.push(withWww);
  if (withoutWww !== fullOrigin) allowedOrigins.push(withoutWww);
}
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/closures", closureRoutes);
app.use("/api/expenses", expenseRoutes);

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
