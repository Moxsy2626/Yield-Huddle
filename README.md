# Yield-Huddle
App de control de scrap.

## Tech stack
- React + TypeScript + Vite
- Material UI (MUI)
- Zustand (estado), React Query (datos), Recharts (gráficas)
- sql.js + IndexedDB (persistencia local)
- Tauri (empaquetado escritorio)

## Scripts útiles
- `npm run dev` – modo desarrollo (web)
- `npm run build` – build web
- `npm run tauri dev` – app de escritorio en dev
- `npm run tauri build` – instalador de escritorio

## Vistas previstas
- Diario / Semanal / Mensual
- Minuta (asistencia y acciones)
- Unidades sin clasificación

<<<<<<< HEAD
## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> 61f4c04 (chore: bootstrap scrap-control (vite+react-ts+pwa+tauri+sqlite))
test
test status checks
test status checks
trigger CI
=======
## Notas
- Commits: Conventional Commits
- Ramas: GitFlow (`develop`, `feature/*`, etc.)
>>>>>>> db3db1e2ee2bd14bbf6497b43d7febe2ac05921e
