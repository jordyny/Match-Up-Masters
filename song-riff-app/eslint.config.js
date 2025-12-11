import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Safely grab rules from the plugins, falling back if a config key doesn't exist
const jsRecommended = js.configs.recommended ?? {}

const hooksConfig =
  reactHooks.configs?.['recommended-latest'] ??
  reactHooks.configs?.recommended ??
  {}
const hooksRules = hooksConfig.rules ?? {}

const refreshConfig =
  reactRefresh.configs?.vite ??
  reactRefresh.configs?.recommended ??
  {}
const refreshRules = refreshConfig.rules ?? {}

export default [
  // Ignore build output
  {
    ignores: ['dist'],
  },

  // Main JS/JSX config
  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      // Base JS rules
      ...(jsRecommended.rules ?? {}),

      // React Hooks rules
      ...hooksRules,

      // React Refresh rules
      ...refreshRules,

      // Custom tweaks
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      'no-constant-binary-expression': 'off',

      // 🚫 Disable this rule because the current plugin version
      // crashes under ESLint 9 with `context.getSource is not a function`
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]
