import { StrictMode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider, matchRoutes } from 'react-router';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { routes } from './routes';
import App from './App';

const theme = createTheme({
  palette: { primary: { main: '#0A66C2' } },
});

export async function render(url: string): Promise<{ html: string; head: string }> {
  let pathname: string;
  try {
    pathname = new URL(url, 'http://localhost').pathname;
    if (pathname.includes('..') || /[^a-zA-Z0-9_\-/.~]/.test(pathname)) {
      throw new Error('Invalid URL path');
    }
  } catch {
    throw new Error('Malformed URL');
  }

  const cache = createCache({ key: 'css' });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

  const resolvedRoutes = routes.map((r) => ({ ...r }));
  const matched = matchRoutes(resolvedRoutes, pathname) ?? [];
  
  await Promise.all(
    matched.map(async ({ route }) => {
      const r = route as { lazy?: () => Promise<Record<string, unknown>> };
      if (typeof r.lazy === 'function') {
        const resolved = await r.lazy();
        Object.assign(route, resolved);
        delete r.lazy;
      }
    })
  );

  const fullRoutes = [{ element: <App />, children: resolvedRoutes }];
  const handler = createStaticHandler(fullRoutes);

  const fetchRequest = new Request(`http://localhost${pathname}`);
  const context = await handler.query(fetchRequest);

  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(handler.dataRoutes, context);

  const app = (
    <StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <StaticRouterProvider router={router} context={context} />
        </ThemeProvider>
      </CacheProvider>
    </StrictMode>
  );

  const html = ReactDOMServer.renderToString(app);
  const chunks = extractCriticalToChunks(html);
  const styles = constructStyleTagsFromChunks(chunks);

  return { html, head: styles };
}