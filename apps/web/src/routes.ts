import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
 route('collectie','routes/collectie.tsx'),
 route('product/:handle','routes/product.tsx'),
 route('winkelwagen','routes/cart.tsx'),
 route('account','routes/account.tsx'),
 route('checkout/success','routes/checkout-success.tsx'),
 route('checkout/cancelled','routes/checkout-cancelled.tsx'),
 route(':slug','routes/editorial.tsx'),
 
	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
	route('api/health', 'routes/api.health.ts'),
	route('api/*', 'routes/api.$.ts'),
] satisfies RouteConfig;
