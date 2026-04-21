import NotFoundPage from './pages/NotFoundPage.tsx'
import EditorPage from './pages/EditorPage.tsx'
import HomePage from './pages/HomePage.tsx'

import type { RouteObject } from 'react-router'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/editor',
    element: <EditorPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]