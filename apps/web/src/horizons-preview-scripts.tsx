import { useEffect } from 'react';
import { bannerAttrs } from 'virtual:horizons-banner';
import { ecommerceTrackingScript, googleTag } from 'virtual:horizons-ecommerce-tracking';

/** Vite serves `\0`-resolved virtual ids at `/@id/__x00__<id>` in dev. */
const viteVirtualSrc = (id: string) => `/@id/__x00__${id}`;

// Inline, not a module script: it must run when Vite's module graph fails to load.
const devBootRetryScript = `(() => {
	const key = 'horizons:boot-retry';
	let scheduled = false;
	const reloadOnce = () => {
		try {
			const attempts = Number(sessionStorage.getItem(key)) || 0;
			if (scheduled || window.__horizonsHydrated || attempts >= 3) return;
			scheduled = true;
			sessionStorage.setItem(key, String(attempts + 1));
			setTimeout(() => window.__horizonsHydrated || location.reload(), 500 * (attempts + 1));
		} catch {}
	};
	try {
		new PerformanceObserver((list) => {
			if (list.getEntries().some((entry) => entry.responseStatus === 504 && entry.name.includes('/node_modules/.vite/deps/'))) reloadOnce();
		}).observe({ type: 'resource', buffered: true });
	} catch {}
	addEventListener('horizons:hydrated', () => {
		try { sessionStorage.removeItem(key); } catch {}
	});
})();`;

// Framework mode hydrates the whole document, so the banner script — which inserts
// its own nodes into <body> — must not run until hydration has committed. Shipping
// it in the server HTML made it mutate <body> first and fail hydration (React #418),
// which also tore the banner down. Appending it from the post-hydration effect keeps
// the server HTML and the hydration render identical.
function appendTemplateBannerScript(attrs: HorizonsBannerAttrs) {
	if (document.querySelector(`script[src="${attrs.src}"]`)) {
		return;
	}

	const script = document.createElement('script');
	Object.entries(attrs).forEach(([name, value]) => {
		if (value) {
			script.setAttribute(name, value);
		}
	});
	document.body.appendChild(script);
}

// Same constraint as the banner: the tracking runtime inserts the vendor scripts into <head>.
function appendEcommerceTrackingScript(code: string) {
	const script = document.createElement('script');
	script.textContent = code;
	document.head.appendChild(script);
}

export function HorizonsPreviewScripts() {
	useEffect(() => {
		// Effects flush only after React commits the hydration render, so this is the
		// earliest reliable "hydration is done" signal. The iframe route-restoration
		// script waits for it before applying builder-requested navigations — changing
		// the URL any earlier makes React hydrate a route that disagrees with the
		// server-rendered HTML and fail with a hydration mismatch.
		(window as Window & { __horizonsHydrated?: boolean }).__horizonsHydrated = true;
		window.dispatchEvent(new Event('horizons:hydrated'));

		if (bannerAttrs) {
			appendTemplateBannerScript(bannerAttrs);
		}

		if (ecommerceTrackingScript) {
			appendEcommerceTrackingScript(ecommerceTrackingScript);
		}

		if (!import.meta.env.DEV) {
			void import('virtual:horizons-runtime');
		}
	}, []);

	if (!import.meta.env.DEV) {
		// Google tag lives in the server HTML so Google's tag check finds it; React 19 skips the nodes gtag.js adds to <head>.
		return googleTag ? (
			<>
				<script dangerouslySetInnerHTML={{ __html: googleTag.inlineScript }} />
				<script async src={googleTag.src} />
			</>
		) : null;
	}

	return (
		<>
			{/* A full page load, such as a click before hydration, keeps this page on screen until the next one paints. */}
			<style dangerouslySetInnerHTML={{ __html: '@view-transition { navigation: auto; }' }} />
			<script dangerouslySetInnerHTML={{ __html: devBootRetryScript }} />
			<script type="module" src={viteVirtualSrc('virtual:horizons-runtime')} />
			<script type="module" src={viteVirtualSrc('virtual:horizons-edit-mode')} />
			<script type="module" src={viteVirtualSrc('virtual:horizons-iframe-route-restoration')} />
			<script type="module" src={viteVirtualSrc('virtual:horizons-pocketbase-auth')} />
			<script type="module" src={viteVirtualSrc('virtual:session-journal-client')} />
			<script type="module" src={viteVirtualSrc('virtual:horizons-build-guard')} />
		</>
	);
}
