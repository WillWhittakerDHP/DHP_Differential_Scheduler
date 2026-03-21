/**
 * Temporary ESLint config for Phase B spike: run only the audit-as-any custom rule.
 * Usage: npx eslint -c .eslint-rules/eslint-spike.config.mjs [paths]
 */
import tseslint from 'typescript-eslint';
import auditAsAny from './audit-as-any.mjs';

export default tseslint.config(
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: false,
      },
    },
    plugins: {
      'audit-spike': {
        rules: {
          'audit-as-any': auditAsAny,
        },
      },
    },
    rules: {
      'audit-spike/audit-as-any': 'error',
    },
  }
);
