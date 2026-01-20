// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [// Ignore patterns
{
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/.serena/**',
    '**/drizzle/**',
  ],
}, // Base ESLint recommended rules
eslint.configs.recommended, // TypeScript files configuration
{
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      // Node.js globals
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      // ES2021 globals
      globalThis: 'readonly',
      // CommonJS
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
      // Browser/Web globals
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      fetch: 'readonly',
      Request: 'readonly',
      Response: 'readonly',
      URL: 'readonly',
      URLSearchParams: 'readonly',
      Headers: 'readonly',
      FormData: 'readonly',
      Blob: 'readonly',
      File: 'readonly',
      // React globals (React 19 JSX runtime)
      React: 'readonly',
      JSX: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
  },
  rules: {
    // TypeScript-specific rules
    ...tseslint.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/triple-slash-reference': 'off', // Next.js generated types use this

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
}, // JavaScript files configuration
{
  files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      // Node.js globals
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      // ES2021 globals
      globalThis: 'readonly',
      // CommonJS
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
    },
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
}, // Disable formatting rules that conflict with Prettier
prettier, ...storybook.configs["flat/recommended"]];
