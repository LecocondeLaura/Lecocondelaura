import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    return false;
  }
};

// Lister les utilisateurs
const listUsers = async () => {
  try {
    const users = await User.find().select("username role createdAt");
    
    if (users.length === 0) {
      console.log("\n⚠️  Aucun utilisateur trouvé dans la base de données.");
      console.log("💡 Utilisez le script createAdminUsers.js pour créer des utilisateurs.");
    } else {
      console.log("\n📋 Liste des utilisateurs admin :\n");
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Créé le: ${user.createdAt.toLocaleDateString("fr-FR")}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des utilisateurs:", error.message);
  }
};

// Exécuter le script
const run = async () => {
  const connected = await connectDB();
  if (connected) {
    await listUsers();
    await mongoose.connection.close();
    console.log("✅ Connexion fermée");
    process.exit(0);
  } else {
    process.exit(1);
  }
};

run();
