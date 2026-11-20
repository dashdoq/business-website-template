/**
 * Process entry for `apps/web`, in development and in production.
 *
 * It owns the one HTTP server on port 3000: Express serves the built assets
 * and hands page requests to React Router, and WebSocket upgrades on
 * `/ws` go to the realtime server from `server/app.ts`. In development the
 * same HTTP server also carries Vite's HMR socket.
 *
 * Node runs this file directly (type stripping), so it stays erasable
 * TypeScript: `import type`, no enums, no parameter properties.
 */
import type { ErrorRequestHandler } from 'express';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import type { ViteDevServer } from 'vite';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

// React picks its development or production build from NODE_ENV on first load,
// so it is settled before anything that reaches React is imported.
process.env.NODE_ENV ??= 'production';

const isDevelopment = process.env.NODE_ENV === 'development';
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '::';
const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const buildDirectory = path.resolve(appDirectory, '../../dist/apps/web');
const serverAppEntry = path.join(appDirectory, 'server/app.ts');
const SERVER_APP_RELOAD_DELAY_MS = 300;
// Same check as `src/lib/realtime.server.ts`, which Node cannot import here (it resolves `@/` through Vite).
const REALTIME_PATH = '/ws';
const VITE_HMR_PROTOCOLS = new Set(['vite-hmr', 'vite-ping']);
const REQUEST_URL_BASE = 'http://localhost';

type ServerApp = typeof import('./server/app');

const app = express();
const httpServer = createServer(app);

app.disable('x-powered-by');
app.use(compression());
app.use((request, response, next) => {
	if (URL.canParse(request.url, REQUEST_URL_BASE)) {
		next();

		return;
	}

	response.status(400).end();
});

let activeServerApp: ServerApp | undefined;

const isRealtimeUpgrade = (request: IncomingMessage): boolean => {
	try {
		return new URL(request.url ?? '/', REQUEST_URL_BASE).pathname === REALTIME_PATH
			&& !VITE_HMR_PROTOCOLS.has(request.headers['sec-websocket-protocol']?.toString() ?? '');
	} catch {
		return false;
	}
};

const logSocketError = (error: unknown) => {
	console.warn('[server] upgrade socket error', error);
};

// The realtime server lives in the module graph under `server/app.ts`, so a new
// module instance means that code changed: the old one's sockets close and the
// clients reconnect into the new one.
const activateServerApp = (serverApp: ServerApp): ServerApp => {
	if (activeServerApp && activeServerApp !== serverApp) {
		activeServerApp.realtime.close({ reason: 'code changed' });
	}

	activeServerApp = serverApp;

	return serverApp;
};

const escapeHtml = (text: string): string => text
	.replaceAll('&', '&amp;')
	.replaceAll('<', '&lt;')
	.replaceAll('>', '&gt;');

// A module that fails to load (a missing import, a syntax error) stops React Router before it
// renders a document, so none of the preview scripts that report errors to the builder run.
// This page reports the error itself; the script is inline because the module graph is what failed.
const sendServerAppErrorPage = ({ editorOrigins }: { editorOrigins: string[] }): ErrorRequestHandler => (error, request, response, next) => {
	if (response.headersSent || !request.accepts('html')) {
		next(error);

		return;
	}

	console.error(`[server] request failed: ${request.method} ${request.path}`, error);

	const detail = error instanceof Error ? error.stack ?? error.message : String(error);
	const report = JSON.stringify({ type: 'horizons-ssr-error', error: `SSR error on ${request.path}: ${detail}` })
		.replaceAll('<', '\\u003c');
	// The parent's origin is also the postMessage target, so only the editor can receive the report.
	const reportScript = `const origin = location.ancestorOrigins?.[0] ?? (document.referrer ? new URL(document.referrer).origin : null);`
		+ `if (window.parent !== window && ${JSON.stringify(editorOrigins)}.includes(origin)) window.parent.postMessage(${report}, origin);`;

	response.status(500).type('html').send(
		`<!doctype html><html><head><meta charset="utf-8"><title>Server error</title></head><body>`
		+ `<pre>${escapeHtml(detail)}</pre>`
		+ `<script>${reportScript}</script>`
		+ `</body></html>`,
	);
};

const loadDevelopmentServerApp = async (vite: ViteDevServer): Promise<ServerApp> => {
	const serverApp = await vite.ssrLoadModule(serverAppEntry) as ServerApp;

	return activateServerApp(serverApp);
};

const serveDevelopment = async () => {
	const { createServer: createViteServer } = await import('vite');
	const { ALLOWED_PARENT_ORIGINS: editorOrigins } = await import('./plugins/visual-editor/utils/parent-frame.js');
	const vite = await createViteServer({
		root: appDirectory,
		// Vite's HMR socket shares this server; it only claims upgrades that carry its own subprotocol.
		server: { middlewareMode: true, ws: { server: httpServer } },
	});

	// A change under server/app.ts (the realtime handler included) is picked up here, so clients on
	// the old code reconnect right away instead of on the next request. Vite invalidates its module
	// graph after it emits the watcher event, hence the delay.
	let reloadTimer: ReturnType<typeof setTimeout> | undefined;
	vite.watcher.on('all', () => {
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(() => {
			loadDevelopmentServerApp(vite).catch((error) => {
				if (error instanceof Error) {
					vite.ssrFixStacktrace(error);
				}

				console.error('[server] reloading server/app.ts failed', error);
			});
		}, SERVER_APP_RELOAD_DELAY_MS);
	});

	app.use(vite.middlewares);
	app.use(async (request, response, next) => {
		try {
			const serverApp = await loadDevelopmentServerApp(vite);

			await serverApp.app(request, response, next);
		} catch (error) {
			if (error instanceof Error) {
				vite.ssrFixStacktrace(error);
			}

			next(error);
		}
	});
	app.use(sendServerAppErrorPage({ editorOrigins }));

	httpServer.on('upgrade', async (request: IncomingMessage, socket: Duplex, head: Buffer) => {
		// Vite's HMR socket shares this server and must survive a broken server/app.ts.
		if (!isRealtimeUpgrade(request)) {
			return;
		}

		try {
			const serverApp = await loadDevelopmentServerApp(vite);

			serverApp.realtime.handleUpgrade({ request, socket, head });
		} catch (error) {
			console.error('[server] realtime upgrade failed', error);
			socket.destroy();
		}
	});

	return () => vite.close();
};

const serveProduction = async () => {
	const clientDirectory = path.join(buildDirectory, 'client');
	const serverApp = activateServerApp(
		await import(pathToFileURL(path.join(buildDirectory, 'server/index.js')).href) as ServerApp,
	);

	app.use('/assets', express.static(path.join(clientDirectory, 'assets'), { immutable: true, maxAge: '1y' }));
	app.use(express.static(clientDirectory, { maxAge: '1h' }));
	app.use(morgan('tiny'));
	app.use(serverApp.app);

	httpServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
		try {
			if (!serverApp.realtime.handleUpgrade({ request, socket, head })) {
				socket.on('error', logSocketError);
				socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
			}
		} catch (error) {
			console.error('[server] realtime upgrade failed', error);
			socket.destroy();
		}
	});

	return async () => {};
};

const closeDependencies = isDevelopment ? await serveDevelopment() : await serveProduction();

httpServer.listen(port, host, () => {
	console.log(`[server] ${isDevelopment ? 'development' : 'production'} server listening on http://localhost:${port}`);
});

const shutdown = async () => {
	activeServerApp?.realtime.close({ reason: 'server stopping' });
	httpServer.close();
	httpServer.closeAllConnections();
	await closeDependencies();
};

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
	process.once(signal, () => {
		shutdown().catch(console.error);
	});
}
