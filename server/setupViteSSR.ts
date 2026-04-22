import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import compression from 'compression';
import sirv from 'sirv';
import { Application } from 'express';
import { createServer, type ViteDevServer } from 'vite';

declare type SSROptions = {
    isProduction: boolean;
    baseRoute: string;
    app: Application;
}

export default function createViteSSRSetup(options: SSROptions) {

    const { isProduction, baseRoute, app } = options;

    return async () => {
        
        let vite: ViteDevServer | undefined;
        const root = process.cwd();

        if (!isProduction) {
            vite = await createServer({
                server: { middlewareMode: true },
                appType: 'custom',
                base: baseRoute,
            });
            app.use(vite.middlewares);
        } else {
            app.use(compression());
            app.use(baseRoute, sirv(join(root, 'dist/client'), { extensions: [] }));
        }

        const compiledTemplatePath = join(root, 'dist/client/index.html');
        const templateHtml = await readFile(compiledTemplatePath, 'utf-8').catch(() => '');

        let cachedRender: ((url: string) => Promise<{ head?: string; html?: string }>) | null = null;

        app.use('*all', async (req, res) => {
            try {
                let url = req.originalUrl.replace(baseRoute, '');
                if (!url.startsWith('/')) {
                    url = `/${url}`;
                }

                let template: string;
                let render: (url: string) => Promise<{ head?: string; html?: string }>;

                if (!isProduction && vite) {
                    template = await readFile(join(root, 'index.html'), 'utf-8');
                    template = await vite.transformIndexHtml(url, template);
                    render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
                } else {
                    template = templateHtml;
                    if (!cachedRender) {
                        const serverEntryUrl = pathToFileURL(join(root, 'dist/server/entry-server.js')).href;
                        cachedRender = (await import(serverEntryUrl)).render;
                    }
                    render = cachedRender!;
                }

                const rendered = await render(url);
                const html = template
                    .replace(`<!--app-head-->`, rendered.head ?? '')
                    .replace(`<!--app-html-->`, rendered.html ?? '');

                res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
            } catch (e: Error | unknown) {
                if (e instanceof Error) {
                    if (vite) {
                        vite.ssrFixStacktrace(e);
                    }
                    console.error(e.stack);
                    res.status(500).end(e.stack);
                } else {
                    console.error(e);
                    res.status(500).end('Internal Server Error');
                }
            }
        });
    };
}