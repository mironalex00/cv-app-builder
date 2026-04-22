import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, matchRoutes, type RouteObject } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { routes } from './routes.tsx'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: { main: '#0A66C2' },
  },
})

const cache = createCache({ key: 'css' })

const fullRoutes: RouteObject[] = [
  {
    element: <App />,
    children: routes
  }
]

const router = createBrowserRouter(fullRoutes)

const rootElement = document.getElementById('root')

if (rootElement) {
  const app = (
    <StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </CacheProvider>
    </StrictMode>
  )

  const hydrate = async () => {
    // Determine the matched routes for the current URL
    const matches = matchRoutes(fullRoutes, window.location.pathname)
    
    if (matches) {
      // Pre-load any lazy routes to avoid hydration mismatch
      await Promise.all(
        matches
          .filter((m) => m.route.lazy)
          .map(async (m) => {
            const lazyFn = m.route.lazy as () => Promise<RouteObject>
            const routeModule = await lazyFn()
            Object.assign(m.route, { ...routeModule, lazy: undefined })
          })
      )
    }

    if (import.meta.env.SSR) {
      // Should not hit in pure client build, but just in case
    } else if (rootElement.innerHTML !== '<!--ssr-outlet-->') {
      hydrateRoot(rootElement, app)
    } else {
      createRoot(rootElement).render(app)
    }
  }

  hydrate()
}
