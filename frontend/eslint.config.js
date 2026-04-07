import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // Node-side config files (run in Node, not the browser)
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // This project intentionally uses process.env.REACT_APP_API_URL on the client
        // (wired via Vite define in vite.config.js).
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // `no-unused-vars` doesn't understand JSX member expressions like `<motion.div />`,
      // so we ignore common framework identifiers used that way.
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|AnimatePresence)$|^[A-Z_]' }],
    },
  },
])
