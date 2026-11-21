# E-commerce SEO findings: amiradecocarpets.be

Source: on-page analysis (static; raw HTML of 69 product-like and 11 category URLs from raw/crawl-snapshot.jsonl, plus live fetches of /nl/catalog-14/tapijten/malagha, /nl/catalog-14/tapijten and image headers). No DataForSEO data. Schema validation detail lives in findings/schema.md. Page content treated as untrusted data.

Scores: Product content 25/100, Category pages 45/100, Merchant Center readiness 20/100, Internal linking 60/100, Images 48/100. E-commerce overall 36/100.

## Critical

1. **No product descriptions anywhere.** All 69 product pages have empty meta description (`<meta name="description" content="">`), empty JSON-LD `"description": ""`, `og:image` empty, and `og:description` equal to the name. Page `<title>` is just the product name ("MALAGHA", "Comfort", "TUNIS"). On the live Malagha page the only content is h1+price, size/colour dropdowns, a 0-review widget and related products. No material, pile height, weight, origin, care, delivery or return info. Fix: a Proxi description field per product plus a title template such as `{Naam} tapijt {kleur} - vanaf {prijs} | Amira Deco-Carpets`. Example description: "Zacht Malagha tapijt in beige of grijs, verkrijgbaar in 5 maten van 80 x 150 tot 240 x 330 cm. Onderhoudsvriendelijk, geschikt voor woonkamer en slaapkamer. Bestel online of kom langs in onze winkel in Wetteren." Impact: rankings and rich results for ~70 URLs; this is the biggest gap.
2. **Price missing on 27 of 69 product pages.** H1 carries "NAAM 35,00 EUR" on only 42 pages; others (MOLLY, LUXOR, VISTA, SPIRIT, PARADISE, ELIO, TEDDY etc.) show none. Schema offers on those pages lack `price`/`priceCurrency`. The static JSON-LD also emits a first Product block with offers but no price, followed by a duplicate block with a price (two Product entities per page; 68 of 69 pages had a price in at least one block, so verify rendering). Products without price are ineligible for Merchant listings and Product rich results. Fix: populate base price for every article or hide/noindex unpriced items; if price is "op aanvraag", say so and use `AggregateOffer`/no Offer rather than empty.
3. **Variant URL explosion and duplicates.** Each size/colour variant has its own URL, e.g. malagha-2226 ... 2233 (8 URLs), tunis-beige-2260..2263, tunis-ivory-2238, tunis-grey, harmony-grey/-ivory-2314/-beige-2319. Variants canonicalise to the parent (good) but are linked from the parent page and listings, are not in the sitemap (good), and still return 200 with the same JSON-LD `offers.url` of a short `/nl/malagha` URL (a third URL form). 9 sampled URLs are non-self-canonical. Also separate near-identical parents exist: BARLEY (/barley, /barley-775), HEAVEN SHEEP (/heaven-sheep-707 and /heaven-sheep-carpet), HARMONY plus HARMONY GREY/IVORY/BEIGE, three TUNIS pages with identical title "TUNIS". Fix: one parent per design with colour/size selector; 301 or consolidate duplicates; make the Offer URL equal the canonical; unique title per colour if colour pages stay indexable ("Tunis tapijt beige").
4. **Out-of-stock handling absent.** All 204 availability values across product JSON-LD are `InStock` including the "Laatste stock" category, and no "Voorraad", "levertijd" or stock text exists on product pages (only hidden "Onvoldoende voorraad" dialog). Fix: output `OutOfStock`/`LimitedAvailability` from real stock, show "Nog 2 op voorraad" on laatste-stock items, keep sold-out URLs live with alternatives (or 301 to the category if permanently discontinued), and add delivery time text.

## High

5. **Google Merchant Center / free listings readiness is poor.** robots.txt disallows `/media/google-shopping/*`, implying a Proxi-generated feed exists, but it is not referenced anywhere crawlable (I did not request the disallowed path). Page data cannot support a valid feed: missing description (required), 27 items without price, no GTIN/MPN/brand (brand block only holds an empty `slogan`), 4 of 12 first-page items on /tapijten use the placeholder "nophoto" image (Ariel Chenille, Boucle, Cleaner, Comfort), no shipping or return policy markup, no availability variance. Fix: confirm feed URL in Merchant Center (Proxi back office), set `identifier_exists=no` for custom/unbranded rugs or add MPN, add `brand`, `color`, `size`, `material`, `item_group_id` per design, `shippingDetails`/`hasMerchantReturnPolicy` (also in schema), and enable free listings. Note that blocking the feed path is fine for crawlers only if Merchant Center fetches it by URL with its own credentials.
6. **Product images missing.** Placeholder nophoto.webp used for some products and also in "related products" on the Malagha page (Comfort). Product pages: 298 of 872 images lack alt (34%), mostly the gallery/hero from the shared site template (`alt=""` on /media/images/gallery/11/...), not the product photos. Product photos do have alt = product name.
7. **Category pages are thin and misdirected.** Category intro is one sentence ("Een tapijt brengt warmte en samenhang in je interieur..."); /nl/catalog-14/tapijten has 46 items on 4 paginated pages loaded by JS (`$.category.show`; no crawlable rel=next/prev or `?page=` links found), so only 12 products are in the HTML. Titles are weak or all-caps ("LOPERS", "KINDERTAPIJTJES", "Laatste Stock", "Online shop"), and 3 category titles have no brand. Dual URL pattern: /nl/dekens, /nl/tapijten, /nl/lopers (CMS content pages with 1.9-2.1k words, own titles like "Tapijten Wetteren | Amira Deco-Carpets") versus /nl/catalog-14/<cat> (shop listing). Both are indexable and in the sitemap, and the content pages are keyword-cannibalising with the shop listing. Fix: pick one pillar per category: link the editorial page prominently to the shop category, add a 150-250 word intro and FAQ above/below the grid on the shop category, and ensure all products are reachable via static links (see 9). Example title: "Vloerkleden en tapijten online kopen | Amira Deco-Carpets Wetteren".
8. **Junk URLs from templates.** Crawl shows `/nl/catalog-14/{url}` (404, linked from every category page), `/nl/catalog-14/nl/online-shop` and `/nl/catalog-14/tapijten/nl/online-shop` (200, duplicates of Online shop, relative-link bug), `/nl/catalog-14/tapijten/cleaner-500-ml-906` and `/sierkussens/cleaner-500-ml-906` (same product under 3 categories, canonical to /dekens/). `/nl/catalog-14` itself canonicalises to the homepage. Fix: repair the relative link and the unrendered `{url}` placeholder in the menu template.

## Medium

9. **Internal linking.** Positive: breadcrumb (BreadcrumbList) on every product, category links in global nav and a "Misschien bent u ook geïnteresseerd" related-products slider with prices. Weak: breadcrumb items link to short `/nl/tapijten` form and `/nl/malagha` (not the canonical /nl/catalog-14/... URLs), the breadcrumb has no visible Dutch label for the last item link; category listing is JS-paginated; related products include placeholder-image items; no links from editorial pages (/nl/vloerkleden, /nl/tapijten-2) to specific products. Cleaner (reinigingsproduct) is filed under Tapijten, Dekens and Sierkussens. Fix: static `?page=2..4` links, align breadcrumb URLs to canonicals, add "Populaire tapijten" blocks on editorial pages, link cross-sell cleaner from each rug.
10. **Faceting/sorting.** Only sort (prijs oplopend/aflopend, nieuwigheden) via JS; no crawlable facets, so no faceted-URL bloat but also no filterable landing pages (maat, kleur, materiaal, rond, wasbaar). Opportunity: static landing pages "Rond tapijt", "Beige tapijt 160 x 230", "Wasbaar tapijt".
11. **Reviews:** "( 0 beoordelingen)" displayed on every product; no AggregateRating. Fix: request reviews post-purchase; do not add self-serving store ratings as product markup.
12. **Size info hidden in dropdown:** sizes (80 x 150, 80 x 300, 160 x 230, 200 x 290, 240 x 330) and colours exist only as select options; add a visible size/price table. Price shown is the "from" price; the variant price is shown only after selection.

## Low

13. Lowercase/inconsistent product names ("nomad", "heaven rond", "Blizz"), product named "DESIGN VINTAGE" at /ash-mirage-2355 (URL and name mismatch).
14. Unit text: use "35,00 EUR" -> "€ 35,00" with "incl. btw" note.
15. Related slider and reviews form link `/catalog/c/review/form/...` are crawlable thin URLs; consider nofollow.

## Images

Site-wide: 1851-1907 images, 675-689 without alt (about 36%). Product pages (42 price pages and others sampled): product photos have alt = product name, which is generic ("MALAGHA", no colour/type/size). Template gallery images on every page (gallery/11/*.webp, 6 per page) have `alt=""`, the main contributor to the missing alt count.

| Check | Result |
|---|---|
| Alt text | 34% of product-page images missing alt; product photos named only "MALAGHA". Fix: "Malagha tapijt beige 160 x 230 cm, zachte pool, woonkamer" |
| Formats | Served as WebP via content negotiation even on .jpg URLs (good); gallery uses .webp |
| Size | big/145.jpg 121 KB, mediumDetail/145.jpg 39 KB, listing thumbnail medium/316.jpg 125 KB (as heavy as the full image; too big for a 200 px tile). Fix: generate proper 400 px thumbs plus srcset |
| Resolution | "big" originals used in JSON-LD (>=800 px likely; not measured); detail pages show mediumDetail |
| Lazy-loading | Listing and related images use `loading="lazy"` plus data-original; hero uses fetchpriority=high (good). No `srcset`/`sizes`, no width/height in product markup (CLS risk) |
| Placeholders | nophoto.webp for products without a photo (4 of 12 on the first Tapijten page) |
| Caching | max-age 30 days, public (good) |
| Filenames | numeric (145.jpg, 316.jpg), no descriptive keywords |
| og:image | empty on product pages (no social preview) |

Images score: 48/100.

## Priority fix order
1. Product descriptions + title/meta templates (Critical 1)
2. Prices on all products, correct availability, clean single Product schema (Critical 2, 4)
3. Collapse variant and duplicate URLs, fix `{url}` and `nl/online-shop` junk links (Critical 3, High 8)
4. Merchant feed completeness, shipping and returns (High 5)
5. Category intro text, static pagination, resolve /nl/<cat> vs /nl/catalog-14/<cat> overlap (High 7)
6. Image alt, thumbnails, placeholders (High 6, Images)
