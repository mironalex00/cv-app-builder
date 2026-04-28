import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, matchRoutes } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { routes } from './routes';
import App from './App';

const theme = createTheme({
  palette: { primary: { main: '#0A66C2' } },
});

const cache = createCache({ key: 'css' });
const initialMatches = matchRoutes(routes, window.location.pathname) ?? [];

await Promise.all(
  initialMatches.map(async ({ route }) => {
    const r = route as { lazy?: () => Promise<Record<string, unknown>> };
    if (typeof r.lazy === 'function') {
      const resolved = await r.lazy();
      Object.assign(route, resolved);
      delete r.lazy;
    }
  })
);

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes,
  },
]);

const rootElement = document.getElementById('root')!;

const app = (
  <StrictMode>
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes() && rootElement.innerHTML !== '<!--ssr-outlet-->') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}