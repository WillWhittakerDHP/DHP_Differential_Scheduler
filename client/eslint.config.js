import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import security from 'eslint-plugin-security'
import vueParser from 'vue-eslint-parser'
import schedulerLocal from '../eslint-local-plugin/index.mjs'

export default tseslint.config(
  js.configs.recommended,
  
  ...vue.configs['flat/essential'],
  
  ...tseslint.configs.recommended,
  
  {
    plugins: {
      security,
    },
  },
  
  // WHY: Vue files need vue-eslint-parser as the parser, with TypeScript parser for script blocks
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
        project: false, // Don't require tsconfig for Vue files
      },
      globals: {
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
        PropType: 'readonly',
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
        COOKIE_MAX_AGE_1_YEAR: 'readonly',
      },
    },
  },
  
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    rules: {
      // WHY: This rule is now obsolete as migration is complete - client/ is the Vue app
      // PATTERN: Rule disabled as migration is complete
      //         message: 'Importing from the React app (client/) is not allowed during Vue migration. Please migrate the code to client/ instead.',
      
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Warn about v-html usage (security concern)
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
      
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

      'security/detect-object-injection': 'off',
      //      We keep this as 'warn' to catch potential issues, but will add disable comments
      'security/detect-non-literal-regexp': 'warn',
    },
  },

  {
    files: ['src/**/*.{ts,vue,js,mjs,cjs}'],
    plugins: {
      'scheduler-local': schedulerLocal,
    },
    rules: {
      'scheduler-local/require-logger-in-catch': 'error',
    },
  },

  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  {
    files: ['.scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },

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

  // WHY: Keeps components focused on rendering, moving business logic to composables
  // PATTERN: Apply stricter rules to components that should be view-only (adjust file patterns as needed)
  {
    files: [
      '**/*.view.vue',           // Files ending in .view.vue
      '**/presentation/**/*.vue', // Components in presentation/ directories
    ],
    rules: {
      'vue/no-restricted-syntax': [
        'error',
        {
          selector: 'VElement > VExpressionContainer CallExpression',
          message: 'View-only components should not call methods in templates. Move logic to composables.',
        },
        {
          selector: 'VElement[directive] > VExpressionContainer CallExpression',
          message: 'View-only components should not call methods in directive expressions. Move logic to composables.',
        },
        {
          selector: 'VElement[directive] VExpressionContainer CallExpression',
          message: 'View-only components should not call methods in directives. Move logic to composables.',
        },
      ],
      
      'vue/this-in-template': 'error',
      
      'vue/no-unused-properties': [
        'error',
        {
          groups: ['methods', 'computed'],
        },
      ],
      
      // Prevent async logic in computed properties
      // WHY: Async logic should be in composables, not components
      'vue/no-async-in-computed-properties': 'error',
      
      'vue/no-computed-properties-in-data': 'error',
    },
  },
  
  // PATTERN: Align with client/.audit-reports/audit-global-config.json globalExclusions
  // so we do not lint test files, core/library code (@core, @layouts), or build output.
  {
    ignores: [
      'dist/**',
      'fixtures/**',
      'src/@core/**',
      'src/@layouts/**',
      'src/**/__tests__/**',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],
  },
);