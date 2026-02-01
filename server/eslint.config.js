/**
 * ESLint Configuration for Server (Express + TypeScript)
 * 
 * LEARNING: ESLint 9 flat config format for TypeScript
 * WHY: ESLint 9 requires flat config format, migrating from legacy .eslintrc
 * PATTERN: Flat config with TypeScript ESLint recommended rules
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
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': [
        'error',
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
      },
    },
  },
  
  {
    ignores: [