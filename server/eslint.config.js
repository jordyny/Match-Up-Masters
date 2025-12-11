import js from '@eslint/js'
import globals from 'globals'

const jsRecommended = js.configs.recommended ?? {}

export default [
  // Ignore built/dep stuff
   {
    ignores: ['node_modules', 'eslint.config.js'],
  },

  // Main config for all JS files in this folder
  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // change to 'module' if you use import/export
      globals: globals.node,
    },

    rules: {
      // Base recommended JS rules
      ...(jsRecommended.rules ?? {}),

      // Allow console.log etc in this small backend
      'no-console': 'off',

      // Warn (not error) on unused variables, but allow unused args like `_req`
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'no-useless-escape': 'off',
    },
  },
]
