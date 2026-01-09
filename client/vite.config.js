/**
 * Vite Configuration
 *
 * LEARNING: Vite config for Vue 3 + TypeScript + Vuetify
 * WHY: Configures build tool, path aliases, and plugins
 * PATTERN: Vite config with Vue plugin and path resolution
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import svgLoader from 'vite-svg-loader';
import AutoImport from 'unplugin-auto-import/vite';
import { fileURLToPath, URL } from 'node:url';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vuetify({ autoImport: true }),
        svgLoader(), // Enable SVG imports
        // Auto-import Vue functions (like Vuexy does)
        AutoImport({
            imports: ['vue', '@vueuse/core', 'pinia'],
            dirs: [
                './src/@core/utils',
                './src/@core/composable/',
                './src/composables/',
                './src/utils/',
            ],
            vueTemplate: true,
            dts: true, // Generate TypeScript declarations
            // Note: Warnings about failed to resolve "@/composables/..." are harmless.
            // Unimport tries to resolve these during scanning, but Vite handles @ alias resolution at runtime.
            // These warnings don't affect functionality and can be safely ignored.
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
            '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
            '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
            '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
            '@styles': fileURLToPath(new URL('./src/assets/styles/', import.meta.url)),
            '@configured-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
            'vue-i18n': fileURLToPath(new URL('./src/shims/vue-i18n', import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: "@use \"@configured-variables\" as *;",
            },
        },
    },
    server: {
        port: 3002,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
});
