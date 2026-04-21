import { StrictMode } from 'react'
import ReactDOMServer from 'react-dom/server'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider
} from 'react-router'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { routes } from './routes.tsx'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: { main: '#0A66C2' },
  },
})

export async function render(url: string) {
  const cache = createCache({ key: 'css' })
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

  const fullRoutes = [{
    element: <App />,
    children: routes,
  }]

  const handler = createStaticHandler(fullRoutes)
  const fetchRequest = new Request(`https://localhost${url}`)
  const context = await handler.query(fetchRequest)

  if (context instanceof Response) {
    throw context
  }

  const router = createStaticRouter(handler.dataRoutes, context)

  const app = (
    <StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <StaticRouterProvider router={router} context={context} />
        </ThemeProvider>
      </CacheProvider>
    </StrictMode>
  )

  const html = ReactDOMServer.renderToString(app)

  const chunks = extractCriticalToChunks(html)
  const styles = constructStyleTagsFromChunks(chunks)

  return { html, head: styles }
}
