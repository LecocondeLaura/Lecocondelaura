# 🚀 Guide de déploiement du Backend

## Option 1 : Railway (Recommandé - Le plus simple) 🚂

### Étape 1 : Créer un compte MongoDB Atlas

1. Allez sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit
3. Créez un cluster gratuit (M0 - Free tier)
4. Configurez un utilisateur de base de données :
   - Database Access → Add New Database User
   - Choisissez "Password" authentication
   - Créez un nom d'utilisateur et un mot de passe (⚠️ **SAUVEGARDEZ-LES**)
5. Configurez le réseau :
   - Network Access → Add IP Address
   - Pour le développement : `0.0.0.0/0` (autorise toutes les IP)
   - Pour la production : Ajoutez l'IP de Railway (Railway vous la donnera)
6. Récupérez la connection string :
   - Clusters → Connect → Connect your application
   - Copiez la connection string (format : `mongodb+srv://user:password@cluster.mongodb.net/dbname`)
   - Remplacez `<password>` par votre mot de passe

### Étape 2 : Déployer sur Railway

1. **Créez un compte** sur [railway.app](https://railway.app)

   - Connectez-vous avec GitHub (recommandé)

2. **Créez un nouveau projet** :

   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository
   - Railway détectera automatiquement le dossier `Backend`

3. **Configurez les variables d'environnement** :

   - Dans votre projet Railway, allez dans "Variables"
   - Ajoutez les variables suivantes :

   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/le-cocon-de-laura?retryWrites=true&w=majority
   PORT=3000
   JWT_SECRET=votre_secret_jwt_tres_long_et_securise
   FRONTEND_URL=https://lecocondelaura.fr
   EMAIL_SERVICE=gmail
   EMAIL_USER=votre-email@gmail.com
   EMAIL_PASSWORD=votre-app-password
   RECIPIENT_EMAIL=email-de-laura@example.com
   RIB=IBAN: FR76 XXXX XXXX XXXX XXXX XXXX XXX
   BIC=XXXXXXXXX
   ```

   ⚠️ **Important** :

   - Générez un JWT_SECRET sécurisé : `node scripts/generateJWTSecret.js`
   - Pour Gmail, utilisez un "App Password" (pas votre mot de passe normal)
   - Remplacez `FRONTEND_URL` par l'URL réelle de votre frontend

4. **Déployez** :

   - Railway détecte automatiquement Node.js
   - Il exécutera `npm install` puis `npm start`
   - Le déploiement se fait automatiquement

5. **Récupérez l'URL** :

   - Railway vous donne une URL du type : `votre-projet.railway.app`
   - Cette URL est votre API : `https://votre-projet.railway.app/api`

6. **Configurez MongoDB pour autoriser Railway** :
   - Dans MongoDB Atlas, allez dans Network Access
   - Ajoutez l'IP de Railway (ou utilisez `0.0.0.0/0` pour le développement)

### Étape 3 : Créer les utilisateurs admin

1. **Via Railway CLI** (recommandé) :

   ```bash
   # Installez Railway CLI
   npm i -g @railway/cli

   # Connectez-vous
   railway login

   # Connectez-vous au projet
   railway link

   # Exécutez le script
   railway run node scripts/createAdminUsers.js
   ```

2. **Ou manuellement** :
   - Connectez-vous à MongoDB Atlas
   - Créez les utilisateurs directement dans la base de données

---

## Option 2 : Render 🎨

### Étape 1 : Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte (gratuit avec limitations)

### Étape 2 : Déployer

1. **Créez un nouveau Web Service** :

   - Cliquez sur "New" → "Web Service"
   - Connectez votre repository GitHub
   - Sélectionnez le repository

2. **Configurez le service** :

   - **Name** : `le-cocon-de-laura-api` (ou autre)
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Root Directory** : `Backend` ⚠️ **IMPORTANT**

3. **Ajoutez les variables d'environnement** :

   - Même configuration que Railway (voir ci-dessus)

4. **Déployez** :
   - Render déploiera automatiquement
   - Vous obtiendrez une URL : `votre-projet.onrender.com`

---

## Option 3 : Heroku ☁️

### Étape 1 : Installer Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ou téléchargez depuis heroku.com
```

### Étape 2 : Déployer

```bash
# 1. Connectez-vous
heroku login

# 2. Créez une app
cd Backend
heroku create le-cocon-de-laura-api

# 3. Ajoutez les variables d'environnement
heroku config:set MONGODB_URI="votre_connection_string"
heroku config:set JWT_SECRET="votre_secret"
heroku config:set FRONTEND_URL="https://lecocondelaura.fr"
# ... etc pour toutes les variables

# 4. Déployez
git push heroku main
```

---

## 🔧 Configuration CORS

Le backend doit autoriser les requêtes depuis le frontend. Vérifiez dans `server.js` :

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

---

## ✅ Vérification

Une fois déployé, testez :

1. **Health check** :

   ```bash
   curl https://votre-backend.railway.app/
   ```

   Devrait retourner : `{"message":"API Le Cocon de Laura - Backend opérationnel"}`

2. **Test des routes** :
   - Testez quelques endpoints depuis Postman ou votre frontend
   - Vérifiez les logs dans Railway/Render pour voir les erreurs éventuelles

---

## 🔄 Mises à jour

- **Railway/Render** : Déploie automatiquement à chaque push sur GitHub
- **Heroku** : `git push heroku main`

---

## 🆘 Dépannage

### Le backend ne démarre pas

- Vérifiez les logs dans Railway/Render
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que MongoDB est accessible depuis l'IP du service

### Erreur de connexion MongoDB

- Vérifiez la connection string
- Vérifiez que l'IP est autorisée dans MongoDB Atlas
- Vérifiez que le mot de passe est correct dans la connection string

### CORS errors

- Vérifiez que `FRONTEND_URL` correspond à l'URL réelle du frontend
- Vérifiez la configuration CORS dans `server.js`

---

## 📝 Prochaines étapes

Une fois le backend déployé :

1. **Mettez à jour le frontend** :

   - Modifiez `Frontend/src/config/api.config.js` ou créez un `.env` :
     ```env
     VITE_API_URL=https://votre-backend.railway.app/api
     ```

2. **Redéployez le frontend** sur Vercel

3. **Testez l'intégration complète**
