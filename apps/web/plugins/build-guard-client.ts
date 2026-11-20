/// <reference path="./vite-plugin-globals.d.ts" />
/**
 * Keeps the last working preview on screen while code changes and the dev server restarts, and reports
 * build errors to the editor.
 */
import { Component, createElement, type ReactNode } from 'react';
import { CODE_CHANGED_EVENT, HEALTH_PATH, RELOAD_HOLD_LIMIT_MS, ROOT_ROUTE_URL_PREFIX, TURN_STATE_EVENT, TURN_STATE_REQUEST_EVENT } from 'virtual:horizons-build-guard-config';
import { postToEditor } from 'virtual:horizons-editor-channel';
import RefreshRuntime from 'virtual:react-router/hmr-runtime';
import type { CodeChange, HealthCheckResponse } from './vite-plugin-build-guard.js';

interface ViteErrorPayload {
	err: {
		message: string;
		frame?: string;
		id?: string;
		loc?: { file?: string; line: number; column: number };
	};
}

const HOME_PATH = '/';
const HEALTH_POLL_INTERVAL_MS = 2500;

let isDevServerDown = false;

async function checkPageHealth(pagePath: string): Promise<HealthCheckResponse | null> {
	try {
		// Longer than the server's own render timeout, so a slow page reads as an answer and only a server that
		// stopped answering reads as down.
		const response = await fetch(`${HEALTH_PATH}?path=${encodeURIComponent(pagePath)}`, { cache: 'no-store', signal: AbortSignal.timeout(RELOAD_HOLD_LIMIT_MS) });

		return await response.json();
	} catch {
		return null;
	}
}

function currentPagePath() {
	return window.location.pathname + window.location.search;
}

// Vite awaits this listener before it reloads the page, so the page stays put until the restarted app
// renders: the current page or `/` (a 404 or a removed route never renders), twice in a row since a fresh
// server can still blip, or for 30 s with the server answering (a login-gated `/`). A reload while it
// doesn't answer would only load the sandbox proxy's "paused" page.
async function waitUntilPreviewRenders() {
	isDevServerDown = true;
	let deadline: number | null = null;
	let healthyChecks = 0;

	while (healthyChecks < 2) {
		await new Promise(resolve => setTimeout(resolve, HEALTH_POLL_INTERVAL_MS));

		const pageHealth = await checkPageHealth(currentPagePath());
		isDevServerDown = !pageHealth;
		deadline = pageHealth ? deadline ?? Date.now() + RELOAD_HOLD_LIMIT_MS : null;

		if (deadline !== null && Date.now() >= deadline) {
			break;
		}

		healthyChecks = pageHealth?.ok || (await checkPageHealth(HOME_PATH))?.ok ? healthyChecks + 1 : 0;
	}

	// The reload Vite sends next must go through.
	isDevServerDown = false;
}

// A document loaded while the dev server is down is the sandbox proxy's static "paused" page, which stays
// until the editor reloads the preview. This covers React Router's own reloads (a route module it can't load,
// a manifest version mismatch) as well as links and forms; a navigation the editor starts still goes through.
// The page stays as it is, and the session journal tells the editor, which shows its toast.
function cancelDocumentNavigation(event: NavigateEvent) {
	if (!isDevServerDown || event.destination.sameDocument || !event.cancelable) {
		return;
	}

	event.preventDefault();
	window.dispatchEvent(new Event('horizons:route-error'));
}

// The error overlay is off so a broken build never covers the preview, and the runtime script
// reported build errors to the editor by watching for that overlay. Report them the same way here.
function reportViteError({ err }: ViteErrorPayload) {
	// A sandbox restart severs Vite's module runner mid-request: infrastructure churn, not an app error to fix.
	if (err.message.includes('transport was disconnected')) {
		return;
	}

	const message = (err.frame ? err.message.replace(err.frame, '') : err.message).trim();
	const [file] = (err.loc?.file || err.id || '').split('?');
	const fileLocation = file && err.loc ? `${file}:${err.loc.line}:${err.loc.column}` : file;

	postToEditor({
		type: 'horizons-vite-error',
		error: message + (fileLocation ? ` File:${fileLocation}` : ''),
	});
}

// Vite awaits this listener before the change, also through a stopped server whose missing stylesheet would
// unstyle the page. A reload request, a restarted server or 30 s with the server answering ends the wait, since
// every later update queues behind this one: what is queued behind it then shows the page as it is.
async function holdChangeUntilPageRenders({ reloadRequestId }: CodeChange) {
	let deadline: number | null = null;

	for (;;) {
		const health = await checkPageHealth(currentPagePath());

		if (health) {
			deadline ??= Date.now() + RELOAD_HOLD_LIMIT_MS;

			if (health.rendered || health.reloadRequestId !== reloadRequestId || Date.now() >= deadline) {
				return;
			}
		}

		await new Promise(resolve => setTimeout(resolve, HEALTH_POLL_INTERVAL_MS));
	}
}

type FunctionComponent = (props: object) => ReactNode;

interface HookSignature {
	key: string;
	forceReset?: boolean;
	getCustomHooks?: () => unknown[];
}

interface LastWorkingVersionProps {
	version: FunctionComponent;
	// Rendered in order, one further after each error caught; past the last, the error goes to the parent.
	attempts: ReactNode[];
	onCommit?: (attempt: number) => void;
}

interface LastWorkingVersionState {
	version: FunctionComponent | null;
	attempt: number;
	caught: { error: unknown } | null;
	handled: { error: unknown } | null;
}

let isTurnRunning = false;
// The newest version of each guarded component that committed, which the next update falls back to.
const lastWorkingVersions = new Map<string, FunctionComponent>();
const hookSignatures = new WeakMap<FunctionComponent, HookSignature>();
const registerWithReactRefresh = RefreshRuntime.register;
const createSignatureFunction = RefreshRuntime.createSignatureFunctionForTransform;

// React renders the next attempt before committing, so the error is never painted. An error in an
// effect moves it on too, so a version that keeps throwing can't loop.
class LastWorkingVersion extends Component<LastWorkingVersionProps, LastWorkingVersionState> {
	declare props: LastWorkingVersionProps;
	state: LastWorkingVersionState = { version: null, attempt: 0, caught: null, handled: null };

	static getDerivedStateFromProps(props: LastWorkingVersionProps, state: LastWorkingVersionState) {
		if (props.version !== state.version) {
			return { version: props.version, attempt: 0, caught: null, handled: null };
		}

		return state.caught === state.handled ? null : { attempt: state.attempt + 1, handled: state.caught };
	}

	// Wrapped, so an error thrown twice still reads as a new one.
	static getDerivedStateFromError(error: unknown) {
		return { caught: { error } };
	}

	componentDidMount() {
		this.props.onCommit?.(this.state.attempt);
	}

	componentDidUpdate() {
		this.props.onCommit?.(this.state.attempt);
	}

	render() {
		if (this.state.attempt >= this.props.attempts.length) {
			throw this.state.caught?.error;
		}

		return this.props.attempts[this.state.attempt];
	}
}

// Called, not rendered, so React Refresh can't resolve it back to the newest version.
function Version({ component, props }: { component: FunctionComponent; props: object }) {
	return component(props);
}

function isFunctionComponent(type: unknown): type is FunctionComponent {
	return typeof type === 'function' && !type.prototype?.isReactComponent;
}

// The new version first renders in place, keeping the component's state. If that throws it renders
// freshly mounted, and if that throws too the last working version renders. React lets a boundary
// catch only once per render, so the last working version sits in a boundary of its own.
function guard({ id, next, previous }: { id: string; next: FunctionComponent; previous: FunctionComponent }): FunctionComponent {
	return props => createElement(LastWorkingVersion, {
		version: next,
		attempts: [
			createElement(LastWorkingVersion, {
				key: 'next',
				version: next,
				attempts: [
					createElement(Version, { key: 'in-place', component: next, props }),
					createElement(Version, { key: 'remounted', component: next, props }),
				],
			}),
			createElement(Version, { key: 'previous', component: previous, props }),
		],
		onCommit: attempt => lastWorkingVersions.set(id, attempt === 0 ? next : previous),
	});
}

// React Refresh keeps a component's state only between versions with the same hook signature, so each
// guard takes the signature of the version it wraps.
RefreshRuntime.createSignatureFunctionForTransform = () => {
	const signatureFunction = createSignatureFunction();

	return (type, key, forceReset, getCustomHooks) => {
		if (typeof key === 'string' && isFunctionComponent(type)) {
			hookSignatures.set(type, { key, forceReset, getCustomHooks });
		}

		return signatureFunction(type, key, forceReset, getCustomHooks);
	};
};

RefreshRuntime.register = (type, id) => {
	// The version on screen: React Refresh moves `current` only once it applies the update.
	const onScreen = RefreshRuntime.getFamilyByID(id)?.current;
	registerWithReactRefresh(type, id);

	// Root components render <html> and <body>; remounting them throws "removeChild".
	if (!isTurnRunning || onScreen === type || id.includes(ROOT_ROUTE_URL_PREFIX) || !isFunctionComponent(type) || !isFunctionComponent(onScreen)) {
		lastWorkingVersions.delete(id);

		return;
	}

	// A guarded component already on screen is a wrapper, so the fallback comes from the map and never nests.
	const previous = lastWorkingVersions.get(id) ?? onScreen;
	const guarded = guard({ id, next: type, previous });
	const signature = hookSignatures.get(type);
	lastWorkingVersions.set(id, previous);

	if (signature) {
		RefreshRuntime.setSignature(guarded, signature.key, signature.forceReset, signature.getCustomHooks);
	}

	registerWithReactRefresh(guarded, id);
};

import.meta.hot?.on(TURN_STATE_EVENT, (state: { isTurnRunning: boolean }) => {
	isTurnRunning = state.isTurnRunning;
});
// Asked after listening, so the answer can't be missed.
import.meta.hot?.send(TURN_STATE_REQUEST_EVENT);

import.meta.hot?.on('vite:error', reportViteError);
import.meta.hot?.on(CODE_CHANGED_EVENT, holdChangeUntilPageRenders);
import.meta.hot?.on('vite:ws:disconnect', waitUntilPreviewRenders);

if (window.parent !== window) {
	window.navigation?.addEventListener('navigate', cancelDocumentNavigation);
}
