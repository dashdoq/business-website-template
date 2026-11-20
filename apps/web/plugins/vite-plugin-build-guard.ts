import { randomUUID } from 'node:crypto';
import { statSync } from 'node:fs';
import fs from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformWithOxc, type Connect, type FullReloadPayload, type HotPayload, type Plugin, type ViteDevServer } from 'vite';

const VIRTUAL_ID = 'virtual:horizons-build-guard';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const CONFIG_VIRTUAL_ID = 'virtual:horizons-build-guard-config';
const CONFIG_RESOLVED_ID = '\0' + CONFIG_VIRTUAL_ID;
const PLUGIN_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_PATH = path.resolve(PLUGIN_DIR, 'build-guard-client.ts');

const HEALTH_PATH = '/__horizons/health';
const RELOAD_PATH = '/__horizons/reload';
const HOME_PATH = '/';
const HEALTH_POLL_INTERVAL_MS = 1000;
// A home page that keeps answering 5xx never renders, so a held reload goes through after this.
const RELOAD_HOLD_LIMIT_MS = 30 * 1000; // 30 seconds
// A cold render takes seconds; a check that runs out counts as not rendered, and the next poll retries.
const PAGE_RENDER_TIMEOUT_MS = 10 * 1000; // 10 seconds
const RELOAD_REQUEST_HEADER = 'x-horizons-reload';
// The backend and horizons-ai curl localhost over SSH. A proxy that reaches the dev server over loopback
// (nginx on the same host) still marks the request as forwarded.
const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const FORWARDED_REQUEST_HEADERS = ['x-forwarded-for', 'x-real-ip'];
const FILE_ADD_SETTLE_MS = 300;
// The root route of `appDirectory` in react-router.config.ts, which the template owns.
const ROOT_ROUTE_FILE_PREFIX = path.join('src', 'root.');
const ROOT_ROUTE_URL_PREFIX = '/src/root.';
const REACT_ROUTER_TYPEGEN_DIRECTORY = `${path.sep}.react-router${path.sep}`;
// Touched by horizons-ai while its coding agent edits a live follow-up, and refreshed on each coding step.
const PREVIEW_TURN_MARKER_PATH = '/data/.preview/turn';
// So a horizons-ai that died mid-turn can't leave it on.
const PREVIEW_TURN_MARKER_MAX_AGE_MS = 30 * 60 * 1000;
const CODE_CHANGED_EVENT = 'horizons:code-changed';
const TURN_STATE_EVENT = 'horizons:turn-state';
const TURN_STATE_REQUEST_EVENT = 'horizons:turn-state-request';

export interface PageHealth {
	ok: boolean;
	rendered: boolean;
}

export interface HealthCheckResponse extends PageHealth {
	reloadRequestId: string;
}

export interface CodeChange {
	reloadRequestId: string;
}

const UNREACHABLE_PAGE: PageHealth = { ok: false, rendered: false };

// In middleware mode (server.ts) Vite has no listener of its own and no resolved URLs; the port is the config's.
const resolveServerUrl = (server: ViteDevServer) => {
	if (server.resolvedUrls?.local[0]) {
		return server.resolvedUrls.local[0];
	}

	return server.config.server.middlewareMode ? `http://127.0.0.1:${server.config.server.port}` : undefined;
};

let reloadRequestId = randomUUID();
const pageHealthChecks = new Map<string, Promise<PageHealth>>();

function isTurnRunning() {
	const markerStats = statSync(PREVIEW_TURN_MARKER_PATH, { throwIfNoEntry: false });

	return markerStats !== undefined && Date.now() - markerStats.mtimeMs < PREVIEW_TURN_MARKER_MAX_AGE_MS;
}

// A 4xx page (a login-gated `/`, a removed route) has rendered the new code. horizons-ai's `reload_app` counts the
// same statuses as served when it verifies a reload, so the `rendered` threshold must stay equal to its own.
async function fetchPageHealth({ server, pagePath }: { server: ViteDevServer; pagePath: string }): Promise<PageHealth> {
	const serverUrl = resolveServerUrl(server);

	if (!serverUrl) {
		return UNREACHABLE_PAGE;
	}

	try {
		// A path like `//host/` or `/\host/` resolves to another origin, which would let anyone who can
		// open the preview make the sandbox call internal addresses. The path is checked once resolved, so
		// `/./__horizons/health` can't make the health check fetch itself.
		const target = new URL(pagePath, serverUrl);

		if (target.origin !== new URL(serverUrl).origin || target.pathname.startsWith(HEALTH_PATH)) {
			return UNREACHABLE_PAGE;
		}

		const { status } = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(PAGE_RENDER_TIMEOUT_MS) });

		return { ok: status < 400, rendered: status < 500 };
	} catch {
		return UNREACHABLE_PAGE;
	}
}

function checkPageHealth({ server, pagePath }: { server: ViteDevServer; pagePath: string }) {
	const sharedCheck = pageHealthChecks.get(pagePath);

	if (sharedCheck) {
		return sharedCheck;
	}

	const check = fetchPageHealth({ server, pagePath }).finally(() => {
		setTimeout(() => {
			if (pageHealthChecks.get(pagePath) === check) {
				pageHealthChecks.delete(pagePath);
			}
		}, HEALTH_POLL_INTERVAL_MS);
	});
	pageHealthChecks.set(pagePath, check);

	return check;
}

function toCheckablePagePath(requestedPath: string | null) {
	if (!requestedPath?.startsWith('/')) {
		return HOME_PATH;
	}

	return requestedPath;
}

async function respondToHealthCheck({ server, request, response, next }: { server: ViteDevServer; request: IncomingMessage; response: ServerResponse; next: Connect.NextFunction }) {
	const url = new URL(request.url ?? '/', 'http://localhost');

	if (url.pathname !== HEALTH_PATH) {
		next();

		return;
	}

	const health = await checkPageHealth({ server, pagePath: toCheckablePagePath(url.searchParams.get('path')) });
	const healthCheckResponse: HealthCheckResponse = { ...health, reloadRequestId };
	response.setHeader('content-type', 'application/json');
	response.setHeader('cache-control', 'no-store');
	response.end(JSON.stringify(healthCheckResponse));
}

function serveHealthCheck({ server }: { server: ViteDevServer }) {
	server.middlewares.use((request, response, next) => {
		respondToHealthCheck({ server, request, response, next }).catch(next);
	});
}

let heldFullReload: FullReloadPayload | null = null;
let isPollingHome = false;

// A full reload while the app cannot render would swap the last good preview for an error page,
// so it waits until the home page renders again. Two held reloads for different pages widen to every page.
async function releaseFullReloadWhenHomeRenders({ server, sendToClients, fullReload }: { server: ViteDevServer; sendToClients: (payload: HotPayload) => void; fullReload: FullReloadPayload }) {
	heldFullReload = heldFullReload && heldFullReload.path !== fullReload.path ? { type: 'full-reload', path: '*' } : fullReload;

	if (isPollingHome) {
		return;
	}

	isPollingHome = true;
	const deadline = Date.now() + RELOAD_HOLD_LIMIT_MS;

	while (heldFullReload) {
		if (Date.now() >= deadline || (await checkPageHealth({ server, pagePath: HOME_PATH })).rendered) {
			const releasedFullReload = heldFullReload;
			heldFullReload = null;
			sendToClients(releasedFullReload);
			break;
		}

		await new Promise(resolve => setTimeout(resolve, HEALTH_POLL_INTERVAL_MS));
	}

	isPollingHome = false;
}

function holdFullReloadsUntilHomeRenders({ server }: { server: ViteDevServer }) {
	const clientHotChannel = server.environments.client.hot;
	const sendToClients = clientHotChannel.send.bind(clientHotChannel);

	clientHotChannel.send = ((payloadOrEvent: HotPayload | string, customEventData?: unknown) => {
		if (typeof payloadOrEvent !== 'string' && payloadOrEvent.type === 'update') {
			// React Router's own hooks resend root route updates after `hotUpdate` drops them.
			const updates = payloadOrEvent.updates.filter(update => !update.path.startsWith(ROOT_ROUTE_URL_PREFIX));

			if (updates.length < payloadOrEvent.updates.length) {
				void releaseFullReloadWhenHomeRenders({ server, sendToClients, fullReload: { type: 'full-reload' } });
			}

			if (!updates.length) {
				return;
			}

			payloadOrEvent = { ...payloadOrEvent, updates };
		}

		const isCodeChange = typeof payloadOrEvent === 'string'
			? payloadOrEvent === 'react-router:hmr'
			: payloadOrEvent.type === 'update' || (payloadOrEvent.type === 'custom' && payloadOrEvent.event === 'react-router:hmr');

		if (isCodeChange && syncTurnState({ send: sendToClients })) {
			const codeChange: CodeChange = { reloadRequestId };
			sendToClients(CODE_CHANGED_EVENT, codeChange);
		}

		if (typeof payloadOrEvent === 'string') {
			sendToClients(payloadOrEvent, customEventData);

			return;
		}

		if (payloadOrEvent.type === 'full-reload') {
			void releaseFullReloadWhenHomeRenders({ server, sendToClients, fullReload: payloadOrEvent });

			return;
		}

		sendToClients(payloadOrEvent);
	}) as typeof clientHotChannel.send;
}

let lastSentTurnState = false;

// Also called before each code change: the poll alone could tell the page a turn started only after its first
// edit, which would then skip the last-working-version guard.
function syncTurnState({ send }: { send: (event: string, data: { isTurnRunning: boolean }) => void }) {
	const turnState = isTurnRunning();

	if (turnState !== lastSentTurnState) {
		lastSentTurnState = turnState;
		send(TURN_STATE_EVENT, { isTurnRunning: turnState });
	}

	return turnState;
}

function sendTurnState({ server }: { server: ViteDevServer }) {
	const clientHotChannel = server.environments.client.hot;
	lastSentTurnState = isTurnRunning();

	clientHotChannel.on(TURN_STATE_REQUEST_EVENT, (_payload, client) => client.send(TURN_STATE_EVENT, { isTurnRunning: lastSentTurnState }));

	setInterval(() => syncTurnState({ send: (event, data) => clientHotChannel.send(event, data) }), HEALTH_POLL_INTERVAL_MS).unref();
}

// The send goes through the full reload hold, so open previews reload only once the home page renders.
// Only a caller inside the sandbox may ask, and the custom header also keeps out a request the app's own server
// code makes to a URL it was handed.
function serveReloadRequest({ server }: { server: ViteDevServer }) {
	server.middlewares.use((request, response, next) => {
		const url = new URL(request.url ?? '/', 'http://localhost');

		if (url.pathname !== RELOAD_PATH) {
			next();

			return;
		}

		response.setHeader('content-type', 'application/json');
		response.setHeader('cache-control', 'no-store');

		if (request.method !== 'POST') {
			response.statusCode = 405;
			response.setHeader('allow', 'POST');
			response.end(JSON.stringify({ ok: false }));

			return;
		}

		const isFromInsideSandbox = LOOPBACK_ADDRESSES.has(request.socket.remoteAddress ?? '')
			&& !FORWARDED_REQUEST_HEADERS.some((header) => header in request.headers);

		if (!isFromInsideSandbox || request.headers[RELOAD_REQUEST_HEADER] !== '1') {
			response.statusCode = 403;
			response.end(JSON.stringify({ ok: false }));

			return;
		}

		reloadRequestId = randomUUID();
		server.environments.client.hot.send({ type: 'full-reload' });
		response.end(JSON.stringify({ ok: true }));
	});
}

let fileAddSettleTimer: ReturnType<typeof setTimeout> | undefined;
let addedFilesRecovery = Promise.resolve();

// The SSR module runner caches a failed import of a file that did not exist yet, so a newly added
// file only takes effect once that cache is cleared. Nothing imports a `public/` file, so adding one needs no pass.
// An agent step writes its files in one burst, so the pass runs once, after the last file lands, and never
// alongside another pass that is still invalidating the module graph.
function recoverWhenFileIsAdded({ server }: { server: ViteDevServer }) {
	server.watcher.on('add', (filePath: string) => {
		if (filePath.includes(REACT_ROUTER_TYPEGEN_DIRECTORY) || filePath.startsWith(server.config.publicDir + path.sep)) {
			return;
		}

		clearTimeout(fileAddSettleTimer);
		fileAddSettleTimer = setTimeout(() => {
			addedFilesRecovery = addedFilesRecovery
				.then(() => recoverAfterAddedFiles({ server }))
				.catch((error: unknown) => server.config.logger.error(`[horizons-build-guard] added-file recovery failed: ${String(error)}`));
		}, FILE_ADD_SETTLE_MS);
	});
}

async function recoverAfterAddedFiles({ server }: { server: ViteDevServer }) {
	const wasHomeFailing = !(await fetchPageHealth({ server, pagePath: HOME_PATH })).ok;
	const serverEnvironment = server.environments.ssr;
	serverEnvironment.moduleGraph.invalidateAll();
	pageHealthChecks.clear();
	serverEnvironment.hot.send({ type: 'full-reload' });

	if (wasHomeFailing && (await fetchPageHealth({ server, pagePath: HOME_PATH })).ok) {
		server.environments.client.hot.send({ type: 'full-reload' });
	}
}

export default function buildGuardPlugin(): Plugin[] {
	return [
		{
			name: 'horizons-build-guard',
			apply: 'serve',

			hotUpdate({ file }) {
				pageHealthChecks.clear();

				if (!path.relative(this.environment.config.root, file).startsWith(ROOT_ROUTE_FILE_PREFIX)) {
					return;
				}

				this.environment.hot.send({ type: 'full-reload' });

				return [];
			},

			configureServer(server) {
				serveHealthCheck({ server });
				holdFullReloadsUntilHomeRenders({ server });
				sendTurnState({ server });
				serveReloadRequest({ server });
				recoverWhenFileIsAdded({ server });
			},

			resolveId(id) {
				if (id === VIRTUAL_ID) {
					return RESOLVED_ID;
				}

				if (id === CONFIG_VIRTUAL_ID) {
					return CONFIG_RESOLVED_ID;
				}
			},

			async load(id) {
				if (id === RESOLVED_ID) {
					const code = await fs.readFile(CLIENT_PATH, 'utf-8');
					const result = await transformWithOxc(code, CLIENT_PATH);
					return result.code;
				}

				if (id === CONFIG_RESOLVED_ID) {
					return Object.entries({ HEALTH_PATH, RELOAD_HOLD_LIMIT_MS, CODE_CHANGED_EVENT, TURN_STATE_EVENT, TURN_STATE_REQUEST_EVENT, ROOT_ROUTE_URL_PREFIX })
						.map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
						.join('\n');
				}
			},
		},
		{
			name: 'horizons-build-guard:stylesheet',
			apply: 'serve',

			handleHotUpdate({ file, modules }) {
				if (file.endsWith('.css')) {
					return modules.filter(module => !new URLSearchParams(module.url.split('?')[1]).has('url'));
				}
			},
		},
	];
}
