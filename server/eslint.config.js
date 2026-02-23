/**
 * WHY: ESLint Configuration for Server (Express + TypeScript)

LEARNING: ESLint...
 */
import js from '@eslint/js'
import tseslintParser from '@typescript-eslint/parser'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'

export default [
  js.configs.recommended,
  
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        NodeJS: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      'no-unused-vars': 'off', // Turn off base rule in favor of @typescript-eslint version
      '@typescript-eslint/no-explicit-any': [
        'warn',
        {
          ignoreRestArgs: true, // Allow `any` in rest arguments and generic constraints
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        NodeJS: 'readonly',
      },
    },
  },
  
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        NodeJS: 'readonly',
      },
    },
  },
  
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  },
  {
    ignores: [
      'src/db/migrations/**',
      'src/**/__tests__/**',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],
  },
]