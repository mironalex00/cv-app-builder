import type { RouteObject } from 'react-router'

export const routes: RouteObject[] = [
  {
    path: '/',
    lazy: async () => {
      const { default: HomePage } = await import('./pages/HomePage.tsx');
      return { Component: HomePage };
    },
  },
  {
    path: '/editor',
    lazy: async () => {
      const { default: EditorPage } = await import('./pages/EditorPage.tsx');
      return { Component: EditorPage };
    }
  },
  {
    path: '*',
    lazy: async () => {
      const { default: NotFoundPage } = await import('./pages/NotFoundPage.tsx');
      return { Component: NotFoundPage };
    }
  }
]