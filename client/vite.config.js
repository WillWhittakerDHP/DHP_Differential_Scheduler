/**
 * Vite Configuration
 *
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import svgLoader from 'vite-svg-loader';
import AutoImport from 'unplugin-auto-import/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    plugins: [
        vue(),
        vuetify({ autoImport: true }),
        svgLoader(), // Enable SVG imports
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
            // PATTERN: Add custom resolver function to map @ alias to src directory
            resolvers: [
                function (id) {
                    if (id.startsWith('@/')) {
                        var srcPath = fileURLToPath(new URL('./src', import.meta.url));
                        return id.replace('@/', "".concat(srcPath, "/"));
                    }
                    return null;
                }
            ],
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
            '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: "@use \"@configured-variables\" as *;",
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
                        return 'vue';
                    }
                    if (id.includes('node_modules/vue-router/')) {
                        return 'vue-router';
                    }
                    if (id.includes('node_modules/pinia/')) {
                        return 'pinia';
                    }
                    if (id.includes('node_modules/vuetify/') || id.includes('node_modules/@mdi/')) {
                        return 'vuetify';
                    }
                    if (id.includes('node_modules/@vueuse/')) {
                        return 'vueuse';
                    }
                    if (id.includes('node_modules/axios/')) {
                        return 'axios';
                    }
                    if (id.includes('node_modules/date-fns/')) {
                        return 'date-fns';
                    }
                    if (id.includes('node_modules/@tanstack/vue-query')) {
                        return 'vue-query';
                    }
                    if (id.includes('node_modules/vee-validate/')) {
                        return 'vee-validate';
                    }
                    return undefined;
                },
            },
        },
        chunkSizeWarningLimit: 600,
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
