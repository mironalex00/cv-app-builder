import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        plugins: [
        ],
        build: {
            outDir: 'dist/client',
            sourcemap: false,
            cssCodeSplit: true,
            chunkSizeWarningLimit: 650,
            minify: true,
            rolldownOptions: {
                output: {
                    minify: {
                        compress: {
                            dropConsole: true,
                            dropDebugger: true,
                        },
                    },
                    codeSplitting: {
                        groups: [
                            {
                                name: 'pdf-tools',
                                test: /node_modules\/(jspdf|html2canvas|dompurify)/,
                            },
                            {
                                name: 'date-pickers',
                                test: /node_modules\/@mui\/x-date-pickers/,
                            },
                            {
                                name: 'dayjs',
                                test: /node_modules\/dayjs/,
                            },
                            {
                                name: 'phone',
                                test: /node_modules\/libphonenumber-js/,
                            },
                            {
                                name: 'forms',
                                test: /node_modules\/(react-hook-form|validator)/,
                            },
                            {
                                name: 'http',
                                test: /node_modules\/axios/,
                            },
                            {
                                name: 'crop-tool',
                                test: /node_modules\/react-easy-crop/,
                            },
                            {
                                name: 'mui-icons',
                                test: /node_modules\/@mui\/icons-material/,
                            },
                            {
                                name: 'mui-core',
                                test: /node_modules\/@mui\/(material|system|base)/,
                            },
                            {
                                name: 'emotion',
                                test: /node_modules\/@emotion/,
                            },
                            {
                                name: 'react-vendor',
                                test: /node_modules\/(react|react-dom|react-router|scheduler)\//,
                            },
                        ],
                    },
                    advancedChunks: {
                        minSize: 20_000,
                        maxSize: 250_000,
                    },
                },
            },
        },
    })
);