import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        build: {
            outDir: 'dist/server',
            ssr: true,
            sourcemap: false,
            rolldownOptions: {
                input: 'src/entry-server.tsx',
                output: {
                    format: 'esm',
                    entryFileNames: 'entry-server.js',
                },
            },
        },
        ssr: {
            target: 'node',
            noExternal: [
                '@mui/material',
                '@mui/icons-material',
                '@mui/system',
                '@mui/base',
                '@emotion/react',
                '@emotion/styled',
                '@emotion/server',
            ],
        },
    })
);