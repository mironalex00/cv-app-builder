import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { routes } from './routes';
import App from './App';

const theme = createTheme({
  palette: { primary: { main: '#0A66C2' } },
});

const cache = createCache({ key: 'css' });

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