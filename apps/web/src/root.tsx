import {
	data,
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import stylesheet from '@/index.css?url';
import { CartProvider } from '@/hooks/use-ecommerce-cart';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieBanner } from '@/components/cookie-banner';
import { CartDrawerProvider } from '@/components/cart-drawer';
import { Logo } from '@/components/logo';
import { siteOrigin } from '@/lib/site-origin.server';
import { HorizonsPreviewScripts } from './horizons-preview-scripts';

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: stylesheet, precedence: 'default' },
	{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
	{ rel: 'icon', href: '/favicon.png', type: 'image/png' },
];

/**
 * Publishes the site's public origin, which `seo()` reads to build canonical and
 * `og:url` tags, and advertises the sitemap to crawlers that read response
 * headers rather than HTML.
 *
 * A `meta` export can only reach server data through `matches`, and the `headers`
 * export cannot see loader data at all, so both have to travel this way.
 */
export function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);

	return data(
		{ origin },
		{ headers: { Link: `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"` } },
	);
}

/**
 * A page route that exports `headers` replaces this one, so merge `parentHeaders`
 * there rather than returning only that route's own headers.
 */
export function headers({ loaderHeaders }: Route.HeadersArgs) {
	return loaderHeaders;
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		// suppressHydrationWarning absorbs attributes injected by browser extensions
		// and theme scripts before hydration; attribute-only, one element deep. Keep both.
		<html lang="nl" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<HorizonsPreviewScripts />
			</head>
			<body suppressHydrationWarning>
				<CartProvider><CartDrawerProvider><div id="root" className="flex min-h-dvh flex-col">{children}</div><CookieBanner /></CartDrawerProvider></CartProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <><SiteHeader /><div className="flex-1"><Outlet /></div><SiteFooter /></>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const isClientErrorResponse = isRouteErrorResponse(error) && error.status < 500;

	if (import.meta.env.DEV && !isClientErrorResponse) {
		return null;
	}

	let message = 'Oops!';
	let details = 'An unexpected error occurred.';

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
	}

	return (
		<main className="wrap flex flex-col items-start gap-6 py-20 lg:py-28">
			<Link to="/" aria-label="Woolup – naar de homepage">
				<Logo className="h-8 w-auto" title="Woolup" />
			</Link>
			<h1 className="display-xl">{message}</h1>
			<p className="max-w-[48ch] text-lg text-stone">{details}</p>
			<Link to="/collectie" className="btn-primary">
				De collectie
			</Link>
		</main>
	);
}
