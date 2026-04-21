import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes
  }
])

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

  if (import.meta.env.SSR) {
    // Should not hit in pure client build, but just in case
  } else if (rootElement.innerHTML !== '<!--ssr-outlet-->') {
    hydrateRoot(rootElement, app)
  } else {
    createRoot(rootElement).render(app)
  }
}
