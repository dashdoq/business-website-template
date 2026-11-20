import { postToEditor } from 'virtual:horizons-editor-channel';

interface RouterState {
	errors?: Record<string, unknown> | null;
}

interface DataRouter {
	state: RouterState;
	subscribe: (listener: (state: RouterState) => void) => () => void;
	revalidate: () => Promise<void>;
}

function resolveFetchUrl(input) {
	if (typeof input === 'string') {
		return input;
	}
	if (input instanceof URL) {
		return input.href;
	}
	if (input && typeof input.url === 'string') {
		return input.url;
	}
	return String(input ?? '');
}

const STACK_FRAME_LINE_REGEX = /^\s*at\s/;
const WORKSPACE_STACK_FRAME_REGEX = /.*\/apps\/web\/(src\/[^\s):]+:\d+:\d+)/;
const APP_STACK_FRAME_REGEX = /\/(src\/[^\s):]+:\d+:\d+)/;
const UNLOCATED_COMPONENT_FRAME_REGEX = /^\s*at\s+([A-Z][\w$]*)\s+\(<anonymous>\)\s*$/;
const REACT_BUILT_IN_COMPONENTS = new Set(['Activity', 'Fragment', 'Profiler', 'StrictMode', 'Suspense', 'SuspenseList', 'ViewTransition']);

const MAX_APP_STACK_FRAMES = 6;

function appFrameLocation(line: string) {
	if (!STACK_FRAME_LINE_REGEX.test(line) || line.includes('/node_modules/')) {
		return null;
	}

	const match = line.match(WORKSPACE_STACK_FRAME_REGEX) ?? line.match(APP_STACK_FRAME_REGEX);

	return match ? match[1] : null;
}

// React's server render names the components it was inside but gives most of them no file
// position, so without the names the first located frame is the root layout, whatever broke.
function unlocatedComponentFrame(line: string) {
	const name = line.match(UNLOCATED_COMPONENT_FRAME_REGEX)?.[1];

	return name && !REACT_BUILT_IN_COMPONENTS.has(name) ? `<${name}>` : null;
}

function appStackFrames(stack: unknown) {
	if (typeof stack !== 'string') {
		return [];
	}

	const frames: string[] = [];

	for (const line of stack.split('\n')) {
		const location = appFrameLocation(line) ?? unlocatedComponentFrame(line);

		if (location && !frames.includes(location)) {
			frames.push(location);

			if (frames.length === MAX_APP_STACK_FRAMES) {
				break;
			}
		}
	}

	return frames;
}

const HYDRATION_MARKER = 'Hydration failed because the server rendered';
const HYDRATION_DOCS_LINK = 'react.dev/link/hydration-mismatch';
const DIFF_LINE_REGEX = /^\s*[+-]\s/;
const COMPONENT_NAME_REGEX = /^\s*at\s+(\S+)/;

const MAX_HYDRATION_DIFF_CHARS = 3000;
const MAX_HYDRATION_TREE_CHARS = 3000;
const MAX_COMPONENT_STACK_CHARS = 1500;
const MAX_COMPONENT_STACK_FRAMES = 8;
const MAX_HYDRATION_EXPLANATION_CHARS = 300;

function extractHydrationTree(message: string) {
	const linkIndex = message.indexOf(HYDRATION_DOCS_LINK);

	return linkIndex === -1 ? message : message.slice(linkIndex + HYDRATION_DOCS_LINK.length).trim();
}

function extractHydrationDiff(tree: string) {
	const lines = tree.split('\n');
	const firstDiffIndex = lines.findIndex(line => DIFF_LINE_REGEX.test(line));

	if (firstDiffIndex === -1) {
		return '';
	}

	const parentLine = firstDiffIndex > 0 ? [lines[firstDiffIndex - 1]] : [];

	return [...parentLine, ...lines.slice(firstDiffIndex).filter(line => DIFF_LINE_REGEX.test(line))].join('\n');
}

function trimTo(text: string, maxChars: number) {
	return text.length > maxChars ? `${text.slice(0, maxChars)} …` : text;
}

function componentFrameLabel(line: string) {
	const location = appFrameLocation(line);

	return location ? `at ${line.match(COMPONENT_NAME_REGEX)?.[1] ?? '<anonymous>'} (${location})` : null;
}

function appComponentStack(componentStack: unknown) {
	if (typeof componentStack !== 'string') {
		return '';
	}

	const lines = componentStack.split('\n').filter(line => line.trim());
	const frames = lines
		.map(componentFrameLabel)
		.filter((label): label is string => !!label)
		.slice(0, MAX_COMPONENT_STACK_FRAMES);

	const kept = frames.length ? frames : lines.slice(0, MAX_COMPONENT_STACK_FRAMES).map(line => line.trim());

	return trimTo(kept.join('\n'), MAX_COMPONENT_STACK_CHARS);
}

export function isHydrationError(error: unknown) {
	return error instanceof Error && error.message.includes(HYDRATION_MARKER);
}

export function buildHydrationReport({ message, componentStack }: { message: string; componentStack?: unknown }) {
	const headline = message.split(/\.\s|\n/)[0].trim();
	const tree = extractHydrationTree(message);
	const diff = trimTo(extractHydrationDiff(tree) || tree, MAX_HYDRATION_DIFF_CHARS);
	const stack = appComponentStack(componentStack);
	const explanation = trimTo(message.slice(headline.length).split(HYDRATION_DOCS_LINK)[0].replace(/^[.\s]+|https?:\/\/\s*$/g, '').trim(), MAX_HYDRATION_EXPLANATION_CHARS);

	const text = [
		headline,
		diff,
		stack && `Component stack:\n${stack}`,
		tree !== diff && `Element tree:\n${trimTo(tree, MAX_HYDRATION_TREE_CHARS)}`,
		explanation,
	].filter(Boolean).join('\n\n');

	return { text, diff, componentStack: stack };
}

const DIFF_SIDE_LINE_REGEX = /^\s*([+-])\s+(\S.*)$/;
const EDIT_ID_VALUE_REGEX = /(data-edit-(?:assisted-)?id)=(?:"[^"]*"|\{[^}]*\})/g;
const TRUNCATION_MARK = '…';

interface DiffSides {
	serverLines: string[];
	clientLines: string[];
}

function splitDiffSides(diff: string): DiffSides {
	const serverLines: string[] = [];
	const clientLines: string[] = [];

	for (const line of diff.split('\n')) {
		const match = line.match(DIFF_SIDE_LINE_REGEX);

		if (match) {
			(match[1] === '-' ? serverLines : clientLines).push(match[2].trim());
		}
	}

	return { serverLines, clientLines };
}

function blankEditIdValues(line: string) {
	return line.replace(EDIT_ID_VALUE_REGEX, '$1=""');
}

function hasBalancedSides({ serverLines, clientLines }: DiffSides) {
	return serverLines.length > 0 && serverLines.length === clientLines.length;
}

function hasSameLinesIgnoringEditIds({ serverLines, clientLines }: DiffSides) {
	return serverLines.every((line, index) => blankEditIdValues(line) === blankEditIdValues(clientLines[index]));
}

function hasDifferentLines({ serverLines, clientLines }: DiffSides) {
	return serverLines.some((line, index) => line !== clientLines[index]);
}

export function isEditIdOnlyHydrationDiff(diff: string) {
	if (!diff || diff.includes(TRUNCATION_MARK)) {
		return false;
	}

	const sides = splitDiffSides(diff);

	return hasBalancedSides(sides) && hasSameLinesIgnoringEditIds(sides) && hasDifferentLines(sides);
}

// Password managers and writing tools insert their own elements into the page before
// React hydrates; only the visitor's browser has them, so the site cannot fix them.
const BROWSER_EXTENSION_MARKER_REGEX = /data-lastpass|data-1p-|data-gr-|grammarly|data-dashlane|data-bitwarden|__endic_/i;

export function isBrowserExtensionHydrationDiff(diff: string) {
	const { serverLines, clientLines } = splitDiffSides(diff);

	return serverLines.length > 0
		&& clientLines.length === 0
		&& BROWSER_EXTENSION_MARKER_REGEX.test(serverLines.join('\n'));
}

export function isIgnorableHydrationMessage(message: string) {
	if (!message.includes(HYDRATION_DOCS_LINK)) {
		return false;
	}

	const diff = extractHydrationDiff(extractHydrationTree(message));

	return isEditIdOnlyHydrationDiff(diff) || isBrowserExtensionHydrationDiff(diff);
}

interface HydrationReport {
	error: Error;
	text: string;
	diff: string;
	componentStack: string;
}

let pendingHydrationReport: HydrationReport | null = null;

export function reportHydrationError({ error, componentStack }: { error: Error; componentStack?: unknown }) {
	if (isIgnorableHydrationMessage(error.message)) {
		return;
	}

	try {
		pendingHydrationReport = { error, ...buildHydrationReport({ message: error.message, componentStack }) };
	} catch {
		pendingHydrationReport = null;
	}

	try {
		reportError(error);
	} finally {
		pendingHydrationReport = null;
	}
}

if (typeof window !== 'undefined') {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const addedNode of mutation.addedNodes) {
				if (
					addedNode.nodeType === Node.ELEMENT_NODE
					&& (
						(addedNode as Element).tagName?.toLowerCase() === 'vite-error-overlay'
						|| (addedNode as Element).classList?.contains('backdrop')
					)
				) {
					handleViteOverlay(addedNode as Element);
				}
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});

	function handleViteOverlay(node) {
		if (!node.shadowRoot) {
			return;
		}

		const backdrop = node.shadowRoot.querySelector('.backdrop');

		if (backdrop) {
			const overlayHtml = backdrop.outerHTML;
			const parser = new DOMParser();
			const doc = parser.parseFromString(overlayHtml, 'text/html');
			const messageBodyElement = doc.querySelector('.message-body');
			const fileElement = doc.querySelector('.file');
			const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';

			// A sandbox restart severs vite's module runner mid-request and the overlay
			// shows "transport was disconnected" — infra churn, not an app error to fix.
			if (messageText.includes('transport was disconnected')) {
				return;
			}

			const fileText = fileElement ? fileElement.textContent.trim() : '';
			const error = messageText + (fileText ? ` File:${fileText}` : '');

			postToEditor({
				type: 'horizons-vite-error',
				error,
			});
		}
	}

	window.onerror = (message, source, lineno, colno, errorObj) => {
		const hydration = pendingHydrationReport?.error === errorObj ? pendingHydrationReport : null;

		const errorDetails = errorObj ? JSON.stringify({
			name: errorObj.name,
			message: hydration ? hydration.text : errorObj.message,
			stack: errorObj.stack,
			source,
			lineno,
			colno,
		}) : null;

		postToEditor({
			type: 'horizons-runtime-error',
			message,
			error: errorDetails,
			...(hydration ? { hydrationDiff: hydration.diff, componentStack: hydration.componentStack } : {}),
		});
	};

	const ROUTER_POLL_INTERVAL_MS = 100;
	const ROUTER_POLL_TIMEOUT_MS = 20000;

	// Captured ahead of the console patches below so that giving up does not travel back to the
	// editor as a horizons-console-warn.
	const unpatchedConsoleWarn = console.warn;

	let lastReportedRouterError: string | null = null;

	const PREVIEW_INTERSTITIAL_MARKERS = ['Your preview is starting', 'Your preview is paused'];
	const NETWORK_FAILURE_MESSAGES = ['Failed to fetch', 'Load failed', 'NetworkError when attempting to fetch resource.'];
	const NETWORK_RETRY_DELAY_MS = 1500;
	const ROUTER_DATA_URL_REGEX = /\.data(?:\?|$)/;

	let activeRouter: DataRouter | null = null;
	let isNetworkRetryUsed = false;
	let isNetworkRetryPending = false;

	function isNetworkFailure(error: unknown) {
		return error instanceof Error && error.name === 'TypeError' && NETWORK_FAILURE_MESSAGES.includes(error.message);
	}

	function formatRouterError(error: unknown) {
		if (error instanceof Error) {
			// `Error` alone says nothing the message does not; a subclass name does. Never
			// return '' — an empty message would drop the report and fail the page silently.
			return error.name && error.name !== 'Error'
				? `${error.name}: ${error.message}`
				: error.message || error.name || 'Error';
		}

		if (!error || typeof error !== 'object') {
			return error ? String(error) : null;
		}

		const { status, statusText, data, message } = error as {
			status?: unknown;
			statusText?: unknown;
			data?: unknown;
			message?: unknown;
		};

		// Thrown responses (404s, `data()` rejections) are how a route says no, not a fault to fix.
		if (typeof status === 'number') {
			if (status < 500) {
				return null;
			}

			if (typeof data === 'string' && PREVIEW_INTERSTITIAL_MARKERS.some(marker => data.includes(marker))) {
				return null;
			}

			const detail = typeof data === 'string' && data ? `: ${data}` : '';

			return `${status} ${statusText || 'Server Error'}${detail}`;
		}

		// Anything else thrown from a loader reaches us untouched, so dig out something readable
		// rather than posting the "[object Object]" that String() would give.
		if (typeof message === 'string' && message) {
			return message;
		}

		try {
			return JSON.stringify(error);
		}
		catch {
			return String(error);
		}
	}

	// A server-rendered page fails as a whole, so the route and file matter as much as the
	// message. Both consumers truncate, hence they lead.
	function describeRouterError(routeId: string, error: unknown) {
		const message = formatRouterError(error);

		if (!message) {
			return null;
		}

		const frames = error instanceof Error ? appStackFrames(error.stack) : [];
		const origin = frames.length ? `${routeId}, ${frames[0]}` : routeId;
		const report = `SSR error on ${window.location.pathname} (${origin}): ${message}`;

		// The first frame can be a shared component rendering a broken element it was
		// handed; the frames above it name the caller to fix. They go at the end so the
		// frontend logger's ~255-char window keeps the headline while the ask-to-fix
		// path (10k chars) keeps the full render path.
		return frames.length > 1 ? `${report}\n(render path: ${frames.slice(1).join(' ← ')})` : report;
	}

	function reportRouterErrors(state: RouterState) {
		// Runs on every router state change, so leave the healthy path allocation-free.
		if (!state.errors) {
			lastReportedRouterError = null;
			isNetworkRetryUsed = false;

			return;
		}

		if (isNetworkRetryPending) {
			return;
		}

		const router = activeRouter;

		if (!isNetworkRetryUsed && router && Object.values(state.errors).every(isNetworkFailure)) {
			isNetworkRetryUsed = true;
			isNetworkRetryPending = true;
			// Revalidation passes through states that still hold the old error, so judge only
			// the state it settles on.
			setTimeout(() => {
				router.revalidate()
					.catch(() => undefined)
					.finally(() => {
						isNetworkRetryPending = false;
						reportRouterErrors(router.state);
					});
			}, NETWORK_RETRY_DELAY_MS);

			return;
		}

		const error = Object.entries(state.errors)
			.map(([routeId, routeError]) => describeRouterError(routeId, routeError))
			.filter((message): message is string => !!message)
			.join('\n');

		if (!error) {
			lastReportedRouterError = null;

			return;
		}

		if (error === lastReportedRouterError) {
			return;
		}

		lastReportedRouterError = error;

		postToEditor({
			type: 'horizons-ssr-error',
			error,
		});
	}

	function watchRouterErrors() {
		const router = (window as unknown as { __reactRouterDataRouter?: DataRouter }).__reactRouterDataRouter;

		if (!router) {
			return false;
		}

		activeRouter = router;
		reportRouterErrors(router.state);
		router.subscribe(reportRouterErrors);

		return true;
	}

	// A failed server render arrives as a 500 document, so nothing throws in the browser and
	// window.onerror stays silent. React Router replays the error into the router it hydrates,
	// which in dev only exists once the scripts below this one have run.
	if (!watchRouterErrors()) {
		const routerPollStartedAt = Date.now();

		const routerPollInterval = setInterval(() => {
			if (watchRouterErrors()) {
				clearInterval(routerPollInterval);

				return;
			}

			if (Date.now() - routerPollStartedAt > ROUTER_POLL_TIMEOUT_MS) {
				clearInterval(routerPollInterval);
				// __reactRouterDataRouter is undocumented, so a React Router upgrade could drop it.
				unpatchedConsoleWarn('[horizons-runtime] React Router data router never appeared, SSR errors will not be reported.');
			}
		}, ROUTER_POLL_INTERVAL_MS);
	}

	const originalConsoleError = console.error;
	const MATCH_LINE_COL_REGEX = /:(\d+):(\d+)\)?\s*$/;
	const MATCH_AT_REGEX = /^\s*at\s+(?:async\s+)?(?:.*?\s+)?\(?/;
	const MATCH_PATH_REGEX = /^\//;

	function parseStackFrameLine(line) {
		const lineColMatch = line.match(MATCH_LINE_COL_REGEX);
		if (!lineColMatch) return null;
		const [, lineNum, colNum] = lineColMatch;
		const suffix = `:${lineNum}:${colNum}`;
		const idx = line.lastIndexOf(suffix);
		if (idx === -1) return null;
		const before = line.substring(0, idx);
		const stackPath = before.replace(MATCH_AT_REGEX, '').trim();

		if (!stackPath) return null;

		try {
			const pathname = new URL(stackPath).pathname;
			const filePath = pathname.replace(MATCH_PATH_REGEX, '') || pathname;
			return `${filePath}:${lineNum}:${colNum}`;
		} catch {
			const filePath = stackPath.replace(MATCH_PATH_REGEX, '') || stackPath;
			return `${filePath}:${lineNum}:${colNum}`;
		}
	}

	function getFilePathFromStack(stack, skipFrames = 0) {
		if (!stack || typeof stack !== 'string') return null;
		const lines = stack.split('\n').slice(1);

		const frames = lines.map(line => parseStackFrameLine(line.replace(/\r$/, ''))).filter(Boolean);

		return frames[skipFrames] ?? null;
	}

	function formatConsoleMessage(args, skipStackFrames = 1) {
		let messageString = '';
		let filePath: string | null = null;

		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			if (arg instanceof Error) {
				filePath = getFilePathFromStack(arg.stack, 0);
				messageString = `${arg.name}: ${arg.message}`;
				if (filePath) {
					messageString = `${messageString} at ${filePath}`;
				}
				break;
			}
		}

		if (!messageString) {
			messageString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
			const stack = new Error().stack;
			filePath = getFilePathFromStack(stack, skipStackFrames);
			if (filePath) {
				messageString = `${messageString} at ${filePath}`;
			}
		}

		return messageString;
	}

	console.error = function(...args) {
		if (isIgnorableHydrationMessage(args.map(arg => String(arg)).join('\n'))) {
			return;
		}

		originalConsoleError.apply(console, args);

		postToEditor({
			type: 'horizons-console-error',
			error: formatConsoleMessage(args, 1),
		});
	};

	const originalConsoleWarn = console.warn;

	console.warn = function(...args) {
		originalConsoleWarn.apply(console, args);

		postToEditor({
			type: 'horizons-console-warn',
			warning: formatConsoleMessage(args, 1),
		});
	};

	const BENIGN_FETCH_ERRORS = [
		[/hcgi\/platform\/api\/collections\/.*auth-with-password.*/i, /Failed to authenticate/i],
		[/hcgi\/api\//i, /Insufficient credits/i],
		[/hcgi\/api\//i, /INTEGRATION_NOT_CONFIGURED/i],
		// The store answers 403 while the merchant has reviews off; getProductReviews turns it into null.
		[/\/v2\/channels\/[^/]+\/products\/[^/]+\/reviews/i, /Product reviews are not available/i],
		// The PocketBase SDK re-establishes its SSE subscription itself after a restart
		// or token refresh; the rejected reconnect attempts in between are churn.
		[/hcgi\/platform\/api\/realtime/i, /Invalid realtime client|previous request authorization/i],
		// Auth endpoints have tight brute-force limits that testing a login flow trips.
		// Only there is a 429 benign: anywhere else it is almost always a fetch loop
		// in app code (the general limit is 200 requests per 5 minutes), so it must
		// stay a console.error for the fix loop to see.
		[/hcgi\/platform\/api\/collections\/[^/]+\/(auth-with-|request-)/i, /Too Many Requests/i],
	];

	function isBenignFetchError(url, body) {
		return BENIGN_FETCH_ERRORS.some(([urlPattern, bodyPattern]) =>
			urlPattern.test(url) && (!bodyPattern || bodyPattern.test(body)));
	}

	const PLATFORM_URL_PATTERN = /hcgi\/platform\//i;
	const VALIDATION_CODE_TEXT_PATTERN = /validation_/;

	function hasValidationCode(value) {
		if (value == null) {
			return false;
		}
		if (typeof value === 'string') {
			return value.startsWith('validation_');
		}
		if (Array.isArray(value)) {
			return value.some(hasValidationCode);
		}
		if (typeof value === 'object') {
			return Object.values(value).some(hasValidationCode);
		}
		return false;
	}

	function isValidationFetchWarning(url, body) {
		if (!PLATFORM_URL_PATTERN.test(url)) {
			return false;
		}
		try {
			return hasValidationCode(JSON.parse(body));
		} catch {
			return VALIDATION_CODE_TEXT_PATTERN.test(body);
		}
	}

	const originalFetch = window.fetch;

	window.fetch = function(...args) {
		const url = resolveFetchUrl(args[0]);

		if (url.startsWith('ws:') || url.startsWith('wss:')) {
			return originalFetch.apply(this, args);
		}

		return originalFetch.apply(this, args)
			.then(async response => {
				const contentType = response.headers.get('Content-Type') || '';

				const isDocumentResponse =
					contentType.includes('text/html')
					|| contentType.includes('application/xhtml+xml');

				// no-cors requests (e.g. Google Analytics/Ads beacons) always return an opaque
				const isOpaqueResponse = response.type === 'opaque';

				if (!response.ok && !isDocumentResponse && !isOpaqueResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					const errorMessage = `Fetch error from ${requestUrl}: ${errorFromRes}`;

					if (isBenignFetchError(requestUrl, errorFromRes)) {
						console.info(errorMessage);
					} else if (isValidationFetchWarning(requestUrl, errorFromRes)) {
						console.warn(errorMessage);
					} else {
						console.error(errorMessage);
					}
				}

				return response;
			})
			.catch(error => {
				if (!url.match(/\.html?$/i)) {
					if (error?.name === 'AbortError' || (isNetworkFailure(error) && ROUTER_DATA_URL_REGEX.test(url))) {
						console.info(error);
					} else {
						console.error(error);
					}
				}

				throw error;
			});
	};

	if (window.navigation && window.self !== window.top) {
		window.navigation.addEventListener('navigate', (event) => {
			const url = event.destination.url;

			try {
				const destinationUrl = new URL(url);
				const destinationOrigin = destinationUrl.origin;
				const currentOrigin = window.location.origin;

				if (destinationOrigin === currentOrigin) {
					return;
				}
			} catch {
				return;
			}

			postToEditor({
				type: 'horizons-navigation-error',
				url,
			});
		});
	}
}
