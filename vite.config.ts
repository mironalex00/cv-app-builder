import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import eslint from '@nabla/vite-plugin-eslint';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    eslint({
      eslintOptions: {
        fix: true,
        fixTypes: ['layout', 'suggestion', 'problem'],
      },
    }),
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled',
    ],
  }
});