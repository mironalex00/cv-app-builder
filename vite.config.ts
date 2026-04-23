import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel'
import basicSsl from '@vitejs/plugin-basic-ssl';
import eslint from "@nabla/vite-plugin-eslint";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      plugins: ['babel-plugin-react-compiler'],
      presets: [reactCompilerPreset({
        target: '18'
      })]
    }),
    basicSsl(),
    eslint({
      eslintOptions: {
        fix: true,
        fixTypes: ['layout', 'suggestion', 'problem'],
      }
    })
  ],
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      '@mui/x-date-pickers',
      'jspdf',
      'html2canvas',
    ]
  }
})