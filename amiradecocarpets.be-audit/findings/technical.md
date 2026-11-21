# Technical SEO findings - www.amiradecocarpets.be (2026-11-21)
Score: 66/100. Platform: Proxi (PHP, server-rendered; no JS rendering dependency, is_spa false). Pass/fail: Crawlability PASS, Indexability PARTIAL, Security PARTIAL, URLs PARTIAL, Mobile PASS (viewport present), JS rendering PASS, Structured data PASS (LocalBusiness + Product JSON-LD on 99/102 pages), IndexNow not implemented.

## Critical
none.

## High
1. Template bug creates 404 crawl traps. Literal `{url}` links on essentially every page: /{url}, /nl/catalog-14/{url}, /nl/catalog-14/tapijten/{url}, /nl/nl/{url}, /catalog/c/review/form/ca/14/ar/{url} (all 404, no title). Waste crawl budget, show as broken links in GSC. Fix: Proxi support desk (template placeholder not substituted).
2. Duplicate category URL patterns. The sitemap lists 70 /nl/catalog-14/... URLs (canonical variant) but internal links also use /nl/dekens, /nl/tapijten, /nl/lopers, /nl/sierkussens, /nl/kindertapijtjes, /nl/laatste-stock, /nl/marrokaanse-vintage, /nl/online-shop (200, canonical -> /nl/catalog-14/...), plus /nl/tapijten-19 and /nl/kunstgras-18 (both canonical -> /nl/catalog-14/tapijten, so kunstgras-18 points to the wrong category), /nl/nl/online-shop, /nl/catalog-14/nl/online-shop (malformed doubled paths, 200), and /nl/catalog-14 (canonical -> /). Canonicals are present, so risk is moderate, but kunstgras-18 -> tapijten is a wrong signal. Fix: change menu/footer links to the canonical variant (shop admin menu editor); 301 redirects and canonical fix for kunstgras-18 need Proxi support.
3. Product variants duplicate: /nl/catalog-14/tapijten/malagha-2226..2231 (6 URLs) canonicalise to /malagha; cleaner-500-ml-906 reachable under /tapijten/, /sierkussens/, /dekens/ (canonical /dekens/, which is the sitemap one). Fine via canonical but they are internally linked; link only to canonical. Medium-High.

## Medium
4. Host/protocol redirect chain. http://amiradecocarpets.be -> http://www -> https://www (2 hops); https://amiradecocarpets.be -> http://www.amiradecocarpets.be -> https://www (2 hops, passes through insecure http). Ends correctly on https://www but should be single hop. Fix: Proxi support / DNS-redirect setting.
5. Meta descriptions missing on 85 of 102 pages (all product/category). Duplicate titles: homepage title shared by 3 URLs, "Tapijt bestellen" x4, "Vloerkleden Wetteren" x2, Dekens/Sierkussens x2, and bare titles "LOPERS", "KINDERTAPIJTJES", "Laatste Stock" (no brand/keyword). Fix: fill SEO title/description fields per category and product in the Proxi admin.
6. Heading issues: homepage has empty H1 plus two identical H1s (with "||" separators); 2 pages with no H1 (the 404 templates); repeated H2 "Inloggen". Fix: Proxi page editor/support.
7. Security headers: CSP is fully permissive (`default-src * 'unsafe-inline' 'unsafe-eval'`, effectively no protection); HSTS lacks includeSubDomains/preload; X-Frame-Options SAMEORIGIN, nosniff, Referrer-Policy and Permissions-Policy are present. Fix: platform-level, support desk; low SEO impact.
8. Caching: HTML sends `Cache-Control: no-store, no-cache`, Expires 1981, PHPSESSID cookie plus codePromoValid/displayOrder cookies on every response, Vary: User-Agent. Prevents CDN/bfcache and slows repeat visits (see performance.md). Vary: User-Agent suggests device-specific output. Support desk.
9. Intermittent server connection resets (observed during crawl). Googlebot may reduce crawl rate. Raise with Proxi hosting; monitor GSC crawl stats.
10. Internal /nl/confidentiality_ws is the single noindex page (no canonical, not in sitemap): acceptable, intentional. Not an issue.

## Low
11. 689 images without alt across 102 pages (homepage 6 of 16). Add alt in admin.
12. Sitemap: valid (sitemap_discovery: robots.txt declared https://www.amiradecocarpets.be/sitemap.xml, 200, valid urlset), 78 URLs, only 1 lastmod entry, so no freshness signals. Homepage listed without trailing slash. Sitemap contains no non-canonical or noindex URLs (good). Ask Proxi for lastmod.
13. Sitemap lists /nl/tapijten-2 and /nl/kunstgras-3 (info pages) while the shop categories compete for the same keywords: possible cannibalisation; review.
14. Parameter URL /nl/vloerkleden?idgallery=13&idcible=Gallery canonicalises correctly to /nl/vloerkleden (OK); /catalog/c/review/form/... is a crawlable form URL, not in robots Disallow; add Disallow if editable.
15. robots.txt: allows all (including AI crawlers, comments say deliberate), Disallow /admin/ etc, blocks AhrefsBot (harms nothing for Google; limits third-party audits). AhrefsBot group also carries wishlist/account disallows that only apply to that bot, so `/*/catalog-*/wishlist` and account-create are NOT blocked for Google/others; wishlist URLs could be crawlable. Move those to the `*` group (support desk).
16. IndexNow: no key file (/indexnow.txt 404), not implemented. Low value for Google, useful for Bing/Yandex/Naver; Proxi would need to support it; otherwise submit via Bing Webmaster Tools.
17. hreflang: none; single-language nl-BE site, not needed. html lang=nl (could be nl-BE).
18. 404 handling: nonexistent URL returns a proper 404 status (no soft 404).

## Internal linking
All 78 sitemap URLs receive at least one internal link in the crawl (no orphans). Max depth shallow (catalog 3-4 levels in URL, reachable from menu). Non-sitemap duplicates are 24 pages discovered via menu/body links (see items 1-3).

## Mobile/JS/CWV
Viewport meta present; server-rendered content (raw fetch contains full text; no SPA). Hidden cookie-policy modal inflates word counts (~1500 words) on every page, which may dilute content signals (consider asking Proxi to lazy-load it). CWV/visual: see findings/performance.md and visual.md. Homepage HTML ~136 KB, response 1.4-2 s TTFB-ish (crawler time), slowish.

## Priority order
1) {url} bug (Proxi) 2) repoint internal links to canonical URLs, fix kunstgras-18 3) single-hop https://www redirect 4) meta descriptions/titles/H1 5) robots.txt group fix, session cookies/caching, CSP 6) alt text, lastmod, IndexNow.
