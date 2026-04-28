import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'server.ts',
    'src/entry-server.tsx',
    'src/entry-client.tsx',
  ],
  project: [
    'src/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
  ],
  typescript: {
    config: [
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json'
    ],
  },
  vite: {
    config: [
      'vite.config.ts',
      'vite.client.config.ts',
      'vite.server.config.ts'
    ],
  },
  eslint: {
    config: ['eslint.config.ts'],
  },
};

export default config;