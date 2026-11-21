# SXO (Search Experience) - amiradecocarpets.be
Checked 2026-11-21. **SXO Gap Score: 39/100.** This score is separate from the SEO Health Score.
Method: render_page.py --mode auto, used on 9 key pages. All pages were server-rendered (is_spa false), so Playwright did not launch and the sandbox question does not apply. SERPs were sampled with WebSearch (6 queries). The crawl data comes from raw/crawl-snapshot.jsonl. This file covers intent fit only. Visual, CWV and agent details are in visual.md, performance.md and agentic.md.

## Key insight (lead finding)
The site has one page type that fits its biggest commercial intents: a webshop listing with prices (/nl/catalog-14/tapijten). The other intents land on pages of the wrong type or on empty pages:
- **Kunstgras** (artificial grass) has only generic SEO copy: no products, no price per m2, no installation offer.
- **Marokkaanse vintage** is an empty category. It is linked in the main nav and listed in the sitemap.
- **Tapijt op maat** (made-to-measure) has no page at all.
- **The "vloerkleden" page** is a gallery, not a shop.

These mismatches outweigh any on-page polish.

## Query map and page-type mismatch

| # | Query (nl-BE) | SERP dominant type (sampled) | Consensus | Mapped page | Page type | Severity |
|---|---|---|---|---|---|---|
| 1 | tapijtwinkel Wetteren / tapijten Wetteren | Local page: directories (openingsuren.vlaanderen, openingsurengids.be), competitor "rug shop near Ghent" local landing pages, map pack expected | ~70% local/directory | / and /nl/decoratiewinkel | Local + Landing | MEDIUM |
| 2 | vloerkleed kopen | Product pages: retailer category and product pages (Gamma, Hornbach, bol, Action, IKEA, Goossens, Zara) with price, size and filters | 100% e-commerce | /nl/catalog-14/tapijten (Google may also pick /nl/vloerkleden, a gallery) | Product listing (category) | HIGH |
| 3 | kunstgras kopen (en laten leggen) Oost-Vlaanderen | Mixed: product listings priced per m2 (Gamma, bol, Hornbach), cost guides (Trustup "17-55 EUR/m2", Werkspot, Slimster) and quote platforms (Homedeal) | ~45% shop, ~45% price guide/quote | /nl/kunstgras-3 | Landing page (text only) | CRITICAL |
| 4 | Marokkaans vintage tapijt kopen | Marketplace product pages (Catawiki, Marktplaats, Etsy, 1stdibs) showing origin (Beni Ourain, Boujad), size, wool and age | ~90% product listings | /nl/catalog-14/marrokaanse-vintage | Empty category ("Geen product gevonden") | CRITICAL |
| 5 | tapijt op maat Gent / Wetteren | Local directories and local shops offering made-to-measure (Carpet-Stock, Creatuft, CarpetRight) | ~80% local/service | none (only a "KAN OOK OP MAAT" badge on one product in the listing) | Missing page | HIGH |

### Findings and fixes by query
1. **CRITICAL: Kunstgras (/nl/kunstgras-3) is the wrong page type for a shopping and pricing intent.**
   - What the page has: 4 generic H2s ("Kwaliteit en variëteit", "Betaalbare prijzen" and others) and the claim "vaak goedkoper dan in andere winkels", with no price shown.
   - What is missing: products, price per m2, roll widths (2 m / 4 m) and pile heights beyond "2cm en 3cm". There is no statement on whether Amira lays the grass (*leggen/plaatsen*), no quote CTA and no project photos.
   - The webshop has no kunstgras category. /nl/kunstgras-18 resolves to the carpet listing (canonical: catalog-14/tapijten), so the nav promise ends at carpets.
   - Fix:
     - Turn it into a hybrid service and product page:
       - a price table per m2 for each quality (20/30/40 mm)
       - roll widths, plus "op maat gesneden"
       - an installation yes/no answer, with the price per m2 if yes and partner advice if not
       - a quote form (area in m2, postcode, photo upload)
       - 6+ before/after garden photos
       - a 4-6 question FAQ on drainage, base layer, sand infill and lifetime
     - Add a kunstgras category to the webshop (sample pieces, ready-cut sizes such as 2x3 m, tools, sand, tape) with Product/Offer markup.
     - Fix the misleading /nl/kunstgras-18 URL with a 301 or delete it.
2. **CRITICAL: Marokkaanse vintage is an empty category that is still indexable.** It returns 200, INDEX and FOLLOW, is in the sitemap and is linked from the main nav on every page. It is also spelled "Marrokaanse", is duplicated at /nl/marrokaanse-vintage and has no meta description. Searchers who expect specific pieces (origin, size, wool, age, back-side photos) get "Geen product gevonden". Google may treat the page as a soft 404, and it burns trust for anyone arriving from the nav. Fix: either list the pieces again or hide the nav item and noindex the page until stock returns. When pieces are live, each one needs its origin/type (Beni Ourain, Boujad, Azilal), its exact size, its material, whether it is genuinely vintage or vintage-look, and close-up photos. The current "DESIGN VINTAGE" products (Ash Mirage, Silver Duna and others, 15 EUR) are machine-made vintage-look rugs. Label them honestly, and do not route the "Marokkaans vintage" intent to them. Correct the spelling to "Marokkaanse".
3. **HIGH: Vloerkleed kopen.** The page type is right (catalog-14/tapijten lists 46 products with prices from 15 EUR), but the experience falls short of the SERP standard:
   - Many listing cards show no price; variant products show no "vanaf" price either.
   - The only control is a sort (price/new). There are no filters for size, colour, material, round or runner.
   - Each page shows 12 products, so finding a rug takes 4 pages.
   - The listing uses the word "tapijt". "Vloerkleed" appears only on /nl/vloerkleden, which is titled "Vloerkleden Wetteren" but is an inspiration gallery with no products. That page could rank for the term and fail the buy intent.
   - The product page (example: MALAGHA) has size and colour selectors and correct per-variant prices. It has no material, pile height, care, delivery time or delivery cost. It shows "0 beoordelingen". The info form makes "Bedrijf" (company name) a required field, which consumers cannot fill in sensibly.
   - /nl/bestellen-en-betalen has an H1 and nothing else: no shipping cost, delivery area, delivery time, returns or payment methods.

   Fix:
   - Show a "vanaf" price on every card.
   - Add size, colour and material filters, and show 24-36 products per page.
   - Add "vloerkleed/vloerkleden" to the shop's H1 and title, e.g. "Vloerkleden & tapijten online kopen".
   - Either make /nl/vloerkleden link into the shop with live products, or retitle it as "Galerij".
   - Fill bestellen-en-betalen with delivery cost, delivery time, area (BE/NL?), returns window and payment methods, and link to it from every product page.
   - Make "Bedrijf" optional.
   - Realistically, the national head term "vloerkleed kopen" is dominated by Gamma, IKEA, bol and Action. Target long-tail queries such as "vloerkleed 200x290", "vloerkleed kopen Wetteren/Gent" and "goedkope vloerkleden Oost-Vlaanderen".
4. **HIGH: Tapijt op maat has no landing page.** The only signals are a single "KAN OOK OP MAAT" badge and the H2 "Advies op maat" on /nl/tapijten-2, which is about advice, not custom sizes. Fix: create /nl/tapijt-op-maat covering:
   - which collections can be cut or bound to size
   - how measuring works
   - price per m2 or per running metre
   - lead time
   - whether they measure at home in the Wetteren/Gent region
   - a quote form

   Link the "KAN OOK OP MAAT" badge to that page.
5. **MEDIUM: Tapijtwinkel Wetteren.** The homepage title "Tapijtenwinkel Wetteren" matches the query, and the address shows in the header. The gaps:
   - The homepage has no LocalBusiness JSON-LD. It exists on /nl/tapijten-2, /nl/kunstgras-3, /nl/vloerkleden and /nl/decoratiewinkel, but not on /.
   - Opening hours appear only in the footer. Wednesday is silently missing; there is no "Wo gesloten".
   - The map is blocked behind cookie consent and there is no "Route plannen" link.
   - There are no shop-front or interior photos labelled as the shop, no parking info and no reviews.
   - The SERP for this query is dominated by directories, so the Google Business Profile and directory citations will matter more than the page itself.

   Fix:
   - Add a "Bezoek onze winkel" block above the fold: address, today's hours ("Vandaag open 11-19u / woensdag gesloten"), a Google Maps directions link (plain link, no consent needed) and a call button.
   - Add LocalBusiness/HomeGoodsStore schema to /.
   - Add a shop photo and parking notes.
   - Claim and update the openingsuren.vlaanderen and openingsurengids.be listings.
   - Run `/seo local` for the GBP review.

## User stories (from SERP signals)
1. *Awareness/consideration (Q3)*: "As a garden owner near Wetteren, I want to know what kunstgras costs per m2, including laying, so I can budget before asking for quotes." Signal: Trustup, Werkspot and Slimster price guides take the non-shop slots, with per-m2 figures in the snippets.
2. *Decision (Q3)*: "As a homeowner who does not want to DIY, I want a shop that sells *and* lays the grass, with a quote form." Signal: Homedeal/Slimster quote platforms, and Gamma's "Wat moet de hovenier doen?"/"zelf kunstgras leggen" pages split DIY from installation.
3. *Decision (Q2)*: "As an online buyer, I want to filter rugs by size (160x230, 200x290) and see prices immediately, so I can compare with IKEA/Action." Signal: every result is a retailer product page or listing; bol ranks size-filtered listings ("250 cm en langer", "50 tot 100 cm").
4. *Decision (Q1/Q5)*: "As a local shopper, I want opening hours, route and the made-to-measure option confirmed before I drive over." Signal: directory results show hours and "momenteel gesloten" flags, and competitors' "rug shop near Ghent" and "showroom" pages exist.
5. *Consideration (Q4)*: "As a boho-interior fan, I want to know if a Moroccan rug is authentic vintage wool or a print, with size and photos." Signal: Catawiki and Marktplaats listings lead with origin (Beni Ourain/Boujad), age and condition.

## Persona scores (Relevance / Clarity / Trust / Action, 25 each), weakest first

| Persona (mapped page) | R | C | T | A | Total |
|---|---|---|---|---|---|
| Vintage/boho rug seeker (/nl/catalog-14/marrokaanse-vintage) | 3 | 3 | 3 | 1 | **10** |
| Garden owner, kunstgras + installation (/nl/kunstgras-3) | 10 | 5 | 5 | 4 | **24** |
| Online buyer comparing prices (/nl/catalog-14/tapijten + product page) | 15 | 9 | 6 | 13 | **43** |
| Local homeowner visiting the shop (/ and /nl/decoratiewinkel) | 18 | 12 | 9 | 13 | **52** |

- **Vintage seeker:** the empty category fails on every dimension. Fix: restock or noindex and hide the nav item (see #2).
- **Garden owner:**
  - Relevant headline, but no price, no installation answer, no products and no quote path, only the generic contact form, which requires reCAPTCHA consent.
  - Improvements: price table, an "Wij leggen uw kunstgras" section (or an explicit "levering, niet geplaatst"), a quote form with m2 and postcode, project photos and a kunstgras webshop category.
- **Online buyer:**
  - Prices from 15 EUR are competitive and the size selector works.
  - Trust is low: 0 reviews, an empty shipping/payment page, no delivery cost before checkout.
  - Clarity is hurt by price-less cards and the lack of filters.
  - Improvements: fill bestellen-en-betalen, show delivery cost and time on product pages, collect reviews (Google and on-site), add filters and "vanaf" prices.
- **Local homeowner:**
  - Strongest fit (title, address, phone numbers in the header).
  - Weak points: the cookie wall hides the hero and the map, hours sit only in the footer, Wednesday closure is implicit, and there are no shop photos or reviews.
  - Improvements: a visit block with today's hours and a route link, shop photos, review stars, LocalBusiness schema on /.

**Systemic issue:** every landing page (tapijten-2, kunstgras-3, vloerkleden, decoratiewinkel) uses the same templated, product-free SEO copy pattern of four generic H2s and a "Bezoek ons of shop online" close. None answers price, size, delivery or installation, which are the facts the SERPs reward. `/seo content` is recommended for E-E-A-T, and `/seo schema` for the Product/AggregateRating/HomeGoodsStore gaps.

## SXO Gap Score: 39/100

| Dimension | Score | Evidence |
|---|---|---|
| Page type | 7/15 | Shop listing aligned for Q2. Q3 mismatched, Q4 empty, Q5 missing |
| Content depth | 5/15 | Templated copy. No prices, specs, delivery or installation info. Ordering page empty |
| UX signals | 6/15 | Cookie wall, weak hero CTA (visual.md), no filters, required "Bedrijf" field |
| Schema | 7/15 | LocalBusiness on 4 landing pages (not /), Product+Offer on product pages, BreadcrumbList. No AggregateRating |
| Media | 7/15 | Product photos and galleries exist. No kunstgras project photos, no labelled shop photos, no video |
| Authority | 3/15 | 0 product reviews, no review widget/GBP stars, unproven "goedkoper" claims |
| Freshness | 4/10 | Stock-driven site with empty categories and "Laatste stock". No dated content |

## Priority actions
1. CRITICAL: Rebuild /nl/kunstgras-3 as a price + installation + quote page, and add kunstgras products to the shop.
2. CRITICAL: Restock or noindex Marokkaanse vintage, hide it in the nav, fix the spelling and drop the duplicate URL.
3. HIGH: Fill /nl/bestellen-en-betalen (delivery cost and time, returns, payment). Add "vanaf" prices and size/colour filters to the listings. Make the form's "Bedrijf" field optional.
4. HIGH: Create /nl/tapijt-op-maat and link the "KAN OOK OP MAAT" badge to it.
5. MEDIUM: Add a visit block on / (today's hours, Wednesday closed, route link, call), LocalBusiness schema on /, GBP and directory clean-up (`/seo local`).
6. MEDIUM: Align the vocabulary: use "vloerkleden" in the shop H1 and title, and retitle /nl/vloerkleden as a gallery or turn it into a shop entry page.

## Limitations
- WebSearch is a US-based index, not google.be with Belgian geo. Local packs, ads, PAA and AI Overviews could not be observed. Consensus percentages are estimates from 12-18 results per query.
- No rankings, Search Console or GBP data, so the claim that Amira is not ranking is inferred from its absence in the samples.
- The site intermittently reset connections (one retry was needed). I rendered 9 pages and scored the other templates from crawl metadata.
- Reviews and pricing elsewhere (Google reviews, Facebook) were not checked.
- Wireframes were not requested. Generate a PDF report? Use `/seo google report`.

## Structured findings (audit-data.json, category "Search Experience")
```json
{"category":"Search Experience","sxo_gap_score":39,"findings":[
{"severity":"critical","id":"sxo-kunstgras-mismatch","url":"/nl/kunstgras-3","issue":"Text-only landing page for a shop/price/installation intent; no products, price per m2, installation info or quote CTA; no kunstgras webshop category (/nl/kunstgras-18 canonicalises to carpets)","fix":"Hybrid page: m2 price table, installation section, quote form, project photos, FAQ; add kunstgras shop category"},
{"severity":"critical","id":"sxo-marokkaans-empty","url":"/nl/catalog-14/marrokaanse-vintage","issue":"Empty category (Geen product gevonden), indexable, in sitemap and main nav, misspelt, duplicate URL","fix":"Restock with authenticity/size/material details or noindex and remove from nav; fix spelling"},
{"severity":"high","id":"sxo-plp-gaps","url":"/nl/catalog-14/tapijten","issue":"Price-less cards, no filters, 12 per page; empty bestellen-en-betalen; 0 reviews; Bedrijf required in info form; 'vloerkleed' page is a gallery","fix":"Vanaf prices, size/colour/material filters, shipping/returns content, reviews, optional company field, vocabulary alignment"},
{"severity":"high","id":"sxo-op-maat-missing","url":null,"issue":"No made-to-measure page despite 'KAN OOK OP MAAT' badge","fix":"Create /nl/tapijt-op-maat with process, pricing, lead time, quote form"},
{"severity":"medium","id":"sxo-local-visit","url":"/","issue":"No LocalBusiness schema on homepage, hours only in footer (Wednesday closure implicit), map behind consent, no shop photos/reviews; directories dominate SERP","fix":"Above-fold visit block with today's hours and route link, schema on /, GBP and directory clean-up"}
]}
```
