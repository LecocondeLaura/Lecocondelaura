# Le Cocon de Laura - Frontend

## 🚧 État actuel : Mode "Coming Soon"

**Le site est actuellement en mode "Coming Soon" uniquement.**

- Seule la page `ComingSoon.jsx` est chargée
- Taille du bundle réduite : ~195 KB (au lieu de 356 KB)
- Toutes les autres pages sont désactivées pour réduire la taille

### Pour activer le site complet :

1. Remplacez `src/App.jsx` par `src/App.jsx.full` :

   ```bash
   mv src/App.jsx.full src/App.jsx
   ```

2. Ou restaurez manuellement toutes les routes dans `App.jsx`

3. Poussez les changements sur GitHub (Vercel redéploiera automatiquement)

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
