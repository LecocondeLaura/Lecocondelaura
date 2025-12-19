# Dashboard d'Administration - Le Cocon de Laura

## 🔐 Sécurité

Le dashboard est protégé par authentification JWT. Seuls les utilisateurs administrateurs peuvent y accéder.

## 📝 Création des comptes administrateurs

Pour créer les comptes administrateurs (vous et votre conjointe), suivez ces étapes :

### 1. Installer les dépendances

```bash
cd Backend
npm install
```

### 2. Créer les comptes

Exécutez le script de création des utilisateurs :

```bash
npm run create-admin
```

Le script vous demandera :

- Le nom d'utilisateur pour le premier compte
- Le mot de passe pour le premier compte
- Le nom d'utilisateur pour le deuxième compte (votre conjointe)
- Le mot de passe pour le deuxième compte

**Important :**

- Les mots de passe sont automatiquement hashés avec bcrypt
- Choisissez des mots de passe forts (minimum 6 caractères)
- Notez bien vos identifiants dans un endroit sûr

### 3. Configuration JWT_SECRET

Générez automatiquement une clé secrète JWT sécurisée :

```bash
npm run generate-secret
```

Le script va générer une clé aléatoire. Copiez-la et ajoutez-la dans votre fichier `.env` :

```env
JWT_SECRET=la-cle-generee-par-le-script
```

**💡 Alternative simple :** Si vous préférez, vous pouvez aussi utiliser n'importe quelle chaîne de caractères longue et aléatoire (minimum 32 caractères). Par exemple :

- Une phrase que vous inventez : `LeCoconDeLaura2024SecretKeySuperSecure`
- Une combinaison de mots : `LauraCoconSecretKey2024SecureAuth`

**⚠️ Important :**

- Gardez cette clé secrète et ne la partagez jamais
- Ne la commitez pas dans Git (elle doit être dans `.env` qui est dans `.gitignore`)

## 🚀 Utilisation

### Accéder au dashboard

1. Démarrez le serveur backend :

```bash
cd Backend
npm run dev
```

2. Démarrez le frontend :

```bash
cd Frontend
npm run dev
```

3. Accédez à la page de connexion :

```
http://localhost:5173/login
```

4. Connectez-vous avec vos identifiants

5. Vous serez redirigé vers le dashboard : `/dashboard`

### Fonctionnalités du Dashboard

- **Voir tous les avis** : Tous les avis soumis par les clients
- **Filtrer par statut** : En attente, Approuvés, Rejetés
- **Approuver un avis** : Cliquez sur "Approuver" pour le rendre visible sur le site
- **Rejeter un avis** : Cliquez sur "Rejeter" pour le refuser
- **Supprimer un avis** : Cliquez sur l'icône poubelle pour supprimer définitivement

### Statuts des avis

- **En attente (pending)** : Avis soumis mais pas encore modéré
- **Approuvé (approved)** : Avis visible sur le site public
- **Rejeté (rejected)** : Avis refusé, non visible sur le site

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les tokens JWT expirent après 7 jours
- Les routes d'administration sont protégées par middleware d'authentification
- Les tokens sont stockés dans localStorage côté frontend

## 📧 Support

En cas de problème, vérifiez :

1. Que MongoDB est bien connecté
2. Que les variables d'environnement sont correctement configurées
3. Que les dépendances sont installées (`npm install`)
