# Déploiement – Le Cocon de Laura

Backend sur **Railway**, frontend sur **Vercel**.

---

## 1. Backend (Railway)

### Créer le projet

1. Va sur [railway.app](https://railway.app), connecte-toi (GitHub).
2. **New Project** → **Deploy from GitHub repo** → choisis le repo (compte de ta conjointe).

### ⚠️ Important : définir le Root Directory

Railway analyse la **racine** du repo par défaut. Ton repo contient `Backend/` et `Frontend/`, donc sans config Railpack ne voit pas de `package.json` et échoue avec *"Railpack could not determine how to build the app"*.

**À faire :**

1. Clique sur le **service** (la carte du déploiement).
2. Onglet **Settings** (ou **Paramètres**).
3. Section **Source** (ou **Source Code**).
4. Champ **Root Directory** : mets exactement **`Backend`** (avec un B majuscule, comme dans le repo).
5. Sauvegarde. Railway va **redéployer** en prenant uniquement le contenu de `Backend/` ; le build Node sera alors détecté.

Optionnel :
- **Watch Paths** : `Backend/**` → ne redéployer que quand des fichiers dans `Backend` changent.

### Autres réglages du service

- **Build Command** : laisser vide (détection auto depuis `package.json`).
- **Start Command** : `npm start` (ou laisser vide, c’est le script par défaut du Backend).

### Variables d’environnement (Railway → Variables)

À définir dans l’onglet **Variables** du service Backend :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MONGODB_URI` | Oui | URI MongoDB (Atlas ou autre). Ex. `mongodb+srv://user:pass@cluster.mongodb.net/lecocondelaura` |
| `JWT_SECRET` | Oui | Secret pour les tokens (générer avec `node Backend/scripts/generateJWTSecret.js` en local). |
| `PORT` | Non | Railway l’injecte automatiquement ; ne pas le surcharger sauf besoin. |
| `EMAIL_SERVICE` | Oui (si emails) | Ex. `gmail`, `outlook`. |
| `EMAIL_USER` | Oui (si emails) | Adresse email d’envoi. |
| `EMAIL_PASSWORD` | Oui (si emails) | Mot de passe ou “App Password” (Gmail). |
| `RECIPIENT_EMAIL` | Recommandé | Email où recevoir les notifications (ex. Laura). |
| `SITE_URL` | Recommandé | URL du site en prod, ex. `https://lecocondelaura.fr` ou l’URL Vercel. |
| `RIB` | Si besoin | RIB pour les emails (format texte). |
| `FRONTEND_URL` | Recommandé | URL du front Vercel, ex. `https://ton-projet.vercel.app` ou `https://lecocondelaura.fr`. Utilisée pour CORS. |

Après le premier déploiement, note l’**URL publique** du backend (ex. `https://lecocondelaura-backend.up.railway.app`).

---

## 2. Frontend (Vercel)

### Créer le projet

1. Va sur [vercel.com](https://vercel.com), connecte-toi avec GitHub.
2. **Add New** → **Project** → importe le même repo.
3. Configurer le projet :
   - **Root Directory** : `Frontend` (cliquer sur **Edit** à côté du repo et mettre `Frontend`).
   - **Framework Preset** : Vite (détecté automatiquement).
   - **Build Command** : `npm run build`.
   - **Output Directory** : `dist` (valeur par défaut pour Vite).
   - **Install Command** : `npm install`.

### Variable d’environnement (Vercel → Settings → Environment Variables)

| Variable | Valeur | Environnement |
|----------|--------|----------------|
| `VITE_API_URL` | URL complète de l’API Railway + `/api` | Production (et Preview si tu veux tester les previews). |

Exemple : si l’API Railway est `https://lecocondelaura-backend.up.railway.app`, alors :

`VITE_API_URL` = `https://lecocondelaura-backend.up.railway.app/api`

Redéploie après avoir ajouté la variable (Deployments → … → Redeploy).

---

## 3. Vérifications

- **Backend** : ouvrir `https://ton-backend.up.railway.app` → tu dois voir le JSON `{ "message": "API Le Cocon de Laura - Backend opérationnel" }`.
- **Frontend** : ouvrir l’URL Vercel ; la connexion au backend doit fonctionner (login, réservations, etc.).
- **CORS** : le backend autorise l’origine du front si `FRONTEND_URL` est définie sur Railway (voir ci-dessous).

---

## 4. Domaine personnalisé (optionnel)

- **Vercel** : Settings → Domains → ajouter `lecocondelaura.fr` (ou autre) et suivre les instructions DNS.
- **Railway** : Settings du service → Domains → ajouter un sous-domaine type `api.lecocondelaura.fr` et configurer un CNAME vers l’URL Railway.

Ensuite, mettre à jour :
- `VITE_API_URL` = `https://api.lecocondelaura.fr/api`
- `FRONTEND_URL` (Railway) = `https://lecocondelaura.fr`

---

## 5. Résumé des URLs à ne pas oublier

- **Backend (Railway)** : à mettre dans `VITE_API_URL` (avec `/api`) et dans `FRONTEND_URL` (sans `/api`) côté Railway.
- **Frontend (Vercel)** : à mettre dans `FRONTEND_URL` sur Railway pour que CORS accepte les requêtes du site.
