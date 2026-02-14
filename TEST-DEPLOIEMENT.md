# Tester le déploiement – Backend Railway + Front Vercel

## 1. Variables à mettre sur Railway (Backend)

Dans **Railway** → ton service Backend → **Variables**, ajoute :

| Variable | Obligatoire | Exemple / remarque |
|----------|-------------|--------------------|
| `MONGODB_URI` | ✅ Oui | `mongodb+srv://user:pass@cluster.mongodb.net/lecocondelaura` (MongoDB Atlas ou autre) |
| `JWT_SECRET` | ✅ Oui | Une longue chaîne aléatoire. En local : `node Backend/scripts/generateJWTSecret.js` pour en générer une. |
| `FRONTEND_URL` | ✅ Recommandé | URL du site en prod, ex. `https://lecocondelaura.vercel.app` (sans slash final). Pour que le front puisse appeler l’API (CORS). |
| `EMAIL_SERVICE` | Si emails | `gmail` (ou `outlook`, etc.) |
| `EMAIL_USER` | Si emails | L’adresse qui envoie les emails |
| `EMAIL_PASSWORD` | Si emails | Mot de passe ou **App Password** Gmail (pas le mot de passe du compte) |
| `RECIPIENT_EMAIL` | Si emails | Email où recevoir les notifications (ex. Laura) |
| `SITE_URL` | Recommandé | `https://lecocondelaura.fr` ou l’URL Vercel (pour les liens dans les emails) |
| `RIB` | Optionnel | RIB au format texte si tu l’utilises dans les emails |

**À ne pas mettre** : `PORT` — Railway le définit tout seul.

---

## 2. Variable à mettre sur Vercel (Frontend)

Dans **Vercel** → projet Frontend → **Settings** → **Environment Variables** :

| Variable | Valeur | Environnement |
|----------|--------|----------------|
| `VITE_API_URL` | `https://TON-URL-RAILWAY.up.railway.app/api` | Production (et Preview si tu veux tester les previews) |

Remplace `TON-URL-RAILWAY` par l’URL réelle de ton backend Railway (sans `/api` à la fin dans l’URL du site ; on ajoute `/api` dans la valeur de `VITE_API_URL`).

Exemple : si Railway te donne `https://lecocondelaura-backend-production.up.railway.app`, alors :
- `VITE_API_URL` = `https://lecocondelaura-backend-production.up.railway.app/api`

Après avoir ajouté ou modifié la variable, **redéploie** le front (Deployments → ⋮ → Redeploy).

---

## 3. Checklist pour tester que tout marche

### Backend seul (Railway)

1. **API vivante**  
   Ouvre dans le navigateur :  
   `https://TON-URL-RAILWAY.up.railway.app`  
   Tu dois voir un JSON du type :  
   `{ "message": "API Le Cocon de Laura - Backend opérationnel" }`.

2. **Health / base de données**  
   Si tu as une route type `/api/...` qui ne nécessite pas d’auth (ex. liste des créneaux ou infos publiques), appelle-la. Si ça répond sans erreur 500, MongoDB est bien connecté.

### Frontend (Vercel) qui parle au Backend

3. **Connexion**  
   Va sur l’URL du site Vercel → essaie de te **connecter** (compte admin ou utilisateur). Si la connexion réussit, l’API auth et `JWT_SECRET` sont bons.

4. **Réservations / données**  
   Selon ce que fait l’app : créer une résa, voir la liste, etc. Si tout s’affiche et se crée sans erreur, le front appelle bien le backend et CORS est ok (grâce à `FRONTEND_URL` sur Railway).

5. **Emails (optionnel)**  
   Si tu as mis `EMAIL_*` et `RECIPIENT_EMAIL`, déclenche une action qui envoie un email (ex. réservation). Vérifie que l’email arrive bien.

---

## 4. En résumé

- **Railway** : `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (et variables email si besoin).
- **Vercel** : `VITE_API_URL` = URL Railway + `/api`.
- **Test** : (1) JSON sur l’URL Railway, (2) connexion sur le site, (3) une ou deux actions métier (résa, etc.).  
Si tout ça fonctionne, le déploiement est bon.
