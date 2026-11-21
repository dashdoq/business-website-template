# Performance audit: amiradecocarpets.be (lab only)

## Method and caveats
- PSI API: rate limited (no key), no CrUX. No field data, so CWV pass/fail is NOT confirmed by 75th-percentile field data.
- Local Playwright/Chromium via the sandbox proxy. Mobile: 412x823, 4x CPU throttle, 150ms RTT, 1.6 Mbps. Desktop: 40ms RTT, 10 Mbps. Single run per page, 4s settle after load. TBT = sum of (longtask - 50ms) via PerformanceObserver (INP proxy, not true INP).
- Validity: the sandbox proxy returned intermittent 502s on some site assets (hero images, bootstrap.min.js, aos.js, cart XHR), and the 404s on old webshop02 images were real. This inflates LCP/FCP variance (e.g. FCP 9s on inner pages, desktop CLS >1 on categories). Treat absolute numbers as indicative and rerun with a PSI key or WebPageTest. Sandbox: Playwright's own Chromium, not claude-seo render_page.

## Results
| Page | Device | TTFB | FCP | LCP | CLS | TBT | Load | Requests / bytes |
|---|---|---|---|---|---|---|---|---|
| / | mobile | 0.59s | 3.2s | 4.7s (img 32.webp, 171KB) | 0.06 | 650ms | 22.3s | 93 / 1.97MB |
| / | desktop | 0.74s | 1.6s | 2.9s (img 40.webp, 951KB) | 0.01 | 271ms | 11.5s | 93 / 1.99MB |
| /nl/tapijten | mobile | 0.74s | 9.3s* | 16.6s* (nophoto.webp placeholder) | 0.62* | 455ms | 24.7s | 89 / 0.64MB |
| /nl/tapijten | desktop | 0.77s | 1.7s | 3.5s (DIV) | 1.46* | 240ms | 11.7s | 95 / 0.65MB |
| /nl/catalog-14/tapijten | mobile | 0.86s | 9.4s* | 9.5s* | 0.27* | 626ms | 13.1s | 89 / 0.64MB |
| /nl/catalog-14/tapijten | desktop | 0.74s | 9.2s* | 9.2s* | 1.38* | 259ms | 17.5s | 94 / 0.66MB |
(*inflated or distorted by proxy 502s; direction is still consistent: category pages shift heavily.) Byte totals use content-length so are undercounts for the 2 category pages.

## LCP
- Homepage hero: a rotating slider. LCP element varies per load (53.webp preloaded, but 32.webp / 40.webp became LCP), so the single preload only helps one slide. Desktop hero image was 951KB.
- Subparts (homepage, approx): TTFB 0.6-0.74s; load delay ~0.03-0.07s; load duration ~0.9s desktop / 1.9s mobile; render delay ~1.2s desktop / 2.1s mobile (blocked by 22 CSS + sync scripts). Render delay is the biggest part, not the download.
- Category pages: LCP is a product-grid placeholder (cdnnen nophoto.webp) or text/div, indicating lazy-loaded product images (jquery.lazyload) arrive late.

## Render-blocking and weight
- 22-23 stylesheets and 37-38 scripts, 89-95 requests per page. Roughly 243KB script and 67KB CSS transferred (compressed) on the homepage.
- Duplicate libraries confirmed: jQuery 1.7.2 and 1.9.1 both loaded (both ancient, vulnerable); GSAP 3.12.2 from cdnjs (+TextPlugin, ScrollTrigger) and local gsap.min.js; Font Awesome 4.7 + FA 5 all.css + v4-shims (3 FA CSS files, 3 font families); jQuery UI + jquery-ui-1.7.1 CSS + i18n 1.7.2; two validation libs (validate + validationEngine); fancybox, jPages, nailthumb, lazyload, matchHeight, sticky.
- Third parties: cdnnen.proxi.tools (platform CDN, 46 requests), cdnjs (3 GSAP scripts), fonts.googleapis/gstatic (3 fonts). No ads or analytics seen loading at idle. Extra connections cost mobile RTT (4 origins).
- 404s on every page for legacy images (webshop02/media/images/btn.png, h1.png, basket.png, badge1/3.png, left-content.png, webshop04 sep.png): wasted requests and indicates dead CSS.
- DOM 1,366-1,473 elements (under 1,500 but close).

## Caching
- HTML: no-store, no-cache, must-revalidate (no bfcache, no CDN caching; TTFB 0.6-0.86s, above the 0.8s good threshold on some pages).
- CDN JS/CSS: immutable 1 year, brotli (good). Local JS/CSS: 1 year immutable with versioned ?ver= (good) but gzip only.
- Images: mixed. Some max-age=30d, some 1h, and some gallery/logo images served no-store (6 on homepage). Fix.
- Fonts: 1 year (good).

## CLS
- Homepage low (0.01-0.06 lab). Category pages shift heavily in lab (0.27-1.46, partly proxy-distorted): product grid with lazy-loaded images and nailthumb/matchHeight JS resizing after load. Reserve image aspect-ratio in CSS.

## Prioritized fixes
1. Critical: Cache HTML for anonymous users (e.g. s-maxage 60-300 plus stale-while-revalidate) and drop no-store to enable bfcache; aim TTFB <0.5s. (Platform-level; ask Proxi.)
2. Critical: Remove render-blocking: defer all scripts, inline critical CSS, load plugin CSS (slick, aos, fancybox, validationEngine, jquery-ui) only where used; merge/minify the 22 CSS files.
3. High: Remove duplicate libs: one jQuery (drop 1.7.2), one GSAP (drop local or cdnjs copy), one Font Awesome (drop v4 + shims, or subset icons to SVG).
4. High: Hero slider: serve responsive srcset (mobile 171KB vs desktop 951KB; compress to ~150-250KB), preload only first slide, set fetchpriority on first slide only, make later slides lazy.
5. High: Category pages: set explicit width/height or aspect-ratio on product tiles, replace JS-driven equal heights (matchHeight/nailthumb) with CSS grid, to fix CLS; lazy-load only below-fold images.
6. Medium: Reduce mobile main-thread work (TBT 450-650ms at 4x): defer GSAP/ScrollTrigger/AOS until needed, break up init handlers in the jQuery ready block.
7. Medium: Fix 404 legacy image references and no-store on images; set images to 30d+ cache.
8. Medium: Brotli for local assets; self-host Google Fonts with font-display:swap and preconnect.
9. Low: Upgrade jQuery to 3.x with migrate if platform allows; keep DOM under 1,500.

## Core Web Vitals status (lab, indicative only)
- LCP: homepage mobile 4.7s = Poor (needs fix), desktop 2.9s = Needs improvement.
- CLS: homepage pass; category pages Poor (lab).
- INP: not measurable in lab; TBT 240-650ms suggests risk (Needs improvement on mobile).

## Performance score: 38/100
