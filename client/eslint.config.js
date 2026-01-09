/**
 * ESLint Configuration for Vue App
 * 
 * LEARNING: ESLint 9 flat config format for Vue 3 + TypeScript
 * WHY: Prevents accidental imports from React app during migration
 * PATTERN: Flat config with Vue, TypeScript, and import restrictions
 * 
 * This configuration blocks imports from the React app (client/) directory
 * to prevent migration violations and ensure clean separation during Vue migration.
 */

import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import security from 'eslint-plugin-security'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  // Base JavaScript recommended rules
  js.configs.recommended,
  
  // Vue plugin configuration
  ...vue.configs['flat/essential'],
  
  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  
  // Security plugin
  {
    plugins: {
      security,
    },
  },
  
  // Configuration for Vue files
  // LEARNING: Vue files need vue-eslint-parser as the parser, with TypeScript parser for script blocks
  // WHY: vue-eslint-parser handles Vue SFC syntax, then delegates to TypeScript parser for <script> blocks
  // PATTERN: Separate config block for Vue files with proper parser setup
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        // Include auto-imports type definitions
        extraFileExtensions: ['.vue'],
        project: false, // Don't require tsconfig for Vue files
      },
      globals: {
        // Vue auto-imports (from unplugin-auto-import)
        ref: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineComponent: 'readonly',
        defineAsyncComponent: 'readonly',
        getCurrentInstance: 'readonly',
        useAttrs: 'readonly',
        useId: 'readonly',
        // VueUse auto-imports
        useMagicKeys: 'readonly',
        useDropZone: 'readonly',
        useFileDialog: 'readonly',
        useObjectUrl: 'readonly',
        useWindowScroll: 'readonly',
        useWindowSize: 'readonly',
        useRouter: 'readonly',
        useI18n: 'readonly',
        useDebounceFn: 'readonly',
        useClipboard: 'readonly',
        useCookie: 'readonly',
        useFocus: 'readonly',
        useRoute: 'readonly',
        useSkins: 'readonly',
        useToggle: 'readonly',
        useEventListener: 'readonly',
        until: 'readonly',
        toRef: 'readonly',
        syncRef: 'readonly',
        // Vue types
        PropType: 'readonly',
        // Browser globals
        window: 'readonly',
        console: 'readonly',
        document: 'readonly',
        File: 'readonly',
        FileList: 'readonly',
        HTMLElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        Node: 'readonly',
        Element: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        fetch: 'readonly',
        // Constants (from auto-imports)
        COOKIE_MAX_AGE_1_YEAR: 'readonly',
      },
    },
  },
  
  // Configuration for TypeScript and JavaScript files
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  
  // Shared rules for all files
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    rules: {
      // Block imports from React app (client/) directory
      // LEARNING: no-restricted-imports prevents importing from specific paths
      // WHY: This rule is now obsolete as migration is complete - client/ is the Vue app
      // PATTERN: Rule disabled as migration is complete
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     patterns: [
      //       {
      //         group: ['**/client/**', '**/client/*', 'client/**', 'client/*'],
      //         message: 'Importing from the React app (client/) is not allowed during Vue migration. Please migrate the code to client/ instead.',
      //       },
      //     ],
      //   },
      // ],
      
      // Vue-specific rules
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Warn about v-html usage (security concern)
      // Vuetify data tables use slot names like `#item.foo` (dot syntax). Allow that pattern.
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
      
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: true, // Allow `any` in rest arguments
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'warn',
      
      /**
       * WHY: // WHY: detect-object-injection flags legitimate TypeScript/Vue dynamic property access patterns
       * PATTERN: // PATTERN: Disable this rule as it doesn't provide value for our codebase patterns
       */
      'security/detect-object-injection': 'off',
      // WHY: detect-non-literal-regexp can flag legitimate dynamic RegExp construction.
      //      We keep this as 'warn' to catch potential issues, but will add disable comments
      //      for specific safe cases (e.g., controlled regex input in validators).
      'security/detect-non-literal-regexp': 'warn',
    },
  },

  // Node scripts (generation / tooling)
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  // Test files (Vitest)
  // LEARNING: Tests have different ergonomic needs (Vitest globals, occasional `any`, `require` in legacy tests).
  // WHY: Keeps production code strict while allowing tests to be readable and fast to write.
  {
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Admin views are debug-heavy during migration; allow `any` there until the refactors settle.
  {
    files: ['src/views/admin/**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
)