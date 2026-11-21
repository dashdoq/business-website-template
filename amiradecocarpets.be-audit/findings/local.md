# Local SEO - amiradecocarpets.be (2026-11-21)
Tier: free (no DataForSEO, no GBP API). Business type: brick-and-mortar + webshop with home delivery (hybrid-lite). Vertical: retail (carpets/rugs/artificial grass/deco); no vertical-specific schema type applies beyond HomeAndConstructionBusiness/Store.

## Score: 44/100
| Dimension | Weight | Score |
|---|---|---|
| GBP signals | 25 | 8/25 (map gated behind cookie consent, no GBP link/review link, GBP unverifiable) |
| Reviews & reputation | 20 | 2/20 (no reviews/rating on site, no aggregateRating, no review CTA) |
| Local on-page | 20 | 14/20 (Wetteren in title/H1/meta on all key pages; Gent/Aalst/Dendermonde only in one sentence; no service-area page) |
| NAP & citations | 15 | 9/15 (site-internal NAP consistent; Gouden Gids name/locality differ; others unverified) |
| Local schema | 10 | 6/10 (LocalBusiness on sub-pages, not on homepage; no geo, no sameAs beyond FB group) |
| Local links/authority | 10 | 5/10 (only FB group; no Instagram/social, no local mentions verified) |

## NAP (as published)
- Name: Amira Deco-Carpets | Address: Westremstraat 59, 9230 Wetteren (Oost-Vlaanderen) | Phones: 0468 30 16 83 and 0483 02 88 68 (both "Gsm") | E-mail: info@amiradecocarpets.be | BTW BE1027627601
- Hours (footer): Ma, Di, Do, Vr, Za, Zo 11u00-19u00; Wednesday not listed (closed-days are hidden by the CMS setting data-closedaysnotshow=1).

| Source | Name | Address | Phone | Hours |
|---|---|---|---|---|
| Footer (all pages) | Amira Deco-Carpets | Westremstraat 59, 9230 Wetteren | both | Mo-Tu,Th-Su 11-19 |
| Contact page /nl/decoratiewinkel | same | same | both | same |
| Algemene voorwaarden | same | same | both | n/a |
| llms.txt | same | same | only 0468 30 16 83 | none |
| JSON-LD (sub-pages) | same | same | only +32468301683 | same as footer |
| Homepage JSON-LD | NONE | | | |
| Gouden Gids (fetched) | "Amira Deco" | Westremstraat 59, 9230 "Westrem (Wetteren)" | +32 468 301 683 | 11-19 |

Findings:
- LOW: second phone missing from schema/llms.txt (not a conflict, but incomplete).
- MEDIUM: Gouden Gids uses "Amira Deco" and locality "Westrem"; harmonise name to "Amira Deco-Carpets" and locality "Wetteren" (Westrem is a deelgemeente; mention it as "Westrem (Wetteren)" in text only).
- MEDIUM: Wednesday closure is implicit. Not verified whether Wednesday is really closed, and Sunday opening 11-19 is unusual; owner must confirm. Add "Woensdag: gesloten" explicitly (turn off the hide-closed-days setting) and set holiday hours.
- No street-level address on product pages other than footer; OK.

## GBP signals - not verifiable (no API, search engines blocked bots)
- CRITICAL: Could not confirm a Google Business Profile exists/verified. No Google Maps link, place ID, or "Bekijk op Google Maps / Routebeschrijving" link in HTML. Verify manually at business.google.com; Facebook "page" is actually a Facebook GROUP (facebook.com/groups/770881053657480), which is not a business page.
- HIGH: Map is a consent-gated modal ("Kaart weergeven" behind cookie category). No visible map for users who do not consent; no plain "Route plannen" link. Fix: add a normal link https://www.google.com/maps/dir/?api=1&destination=Westremstraat+59+9230+Wetteren (works without cookies) next to the address.
- Primary GBP category (#1 ranking factor): recommend "Tapijtwinkel" (Carpet store), secondary "Vloerkleedwinkel"/"Kunstgrasleverancier"/"Woonwinkel" as available. Unverified what is set today.
- Photos, posts, Q&A, products: not assessable.

## Reviews
- CRITICAL/HIGH: No rating, testimonials or review widget on site; no aggregateRating in LocalBusiness schema; review form exists only per product (/catalog/c/review/form/...). Rating count/velocity/response rate: not assessable.
- Fix: ask every in-store and webshop customer for a Google review (short link from GBP "Vraag om reviews"), print QR code at the counter, add a "Reviews" block with 3-5 real quotes + link to Google profile. Only add aggregateRating schema when it reflects real, visible Google/own reviews.
- Suggested Dutch CTA: "Tevreden over je tapijt of kunstgras? Laat een review achter op Google - het duurt maar een minuutje. Bedankt!"

## Citations (free checks only)
- Gouden Gids: FOUND (as "Amira Deco", see above).
- Infobel, Yelp, BBB (not relevant in BE), Facebook business page, Instagram, Trustpilot, Apple Maps, Bing Places, Foursquare, Tupalo, 2dehands/Marktplaats: NOT VERIFIED (search engines blocked automated queries). Check by hand.
- sameAs lists only the Facebook group. Add GBP, Facebook page, Instagram, Pinterest if they exist.
- Belgian-relevant extras: KBO/Crossroads Bank data (BTW BE1027627601 is published, good trust signal), Gouden Gids, Infobel, Cylex.be, Opendi.be, Trustoo/Kiyoh, Wetteren gemeentelijke winkelgids / UNIZO / Handelaars Wetteren.

## Local on-page
Good: "Wetteren" in title, H1/meta of home, tapijten, kunstgras, vloerkleden, over-ons, contact. Address in header and footer on every page. Homepage mentions "Gent, Aalst of Dendermonde" once.
- HIGH: No dedicated service-area/location pages (e.g., "Tapijten kopen in de buurt van Gent / Aalst / Dendermonde / Lokeren / Zele / Hamme"). Dedicated service pages are the #1 local organic factor. Avoid doorway pages: each needs unique content (travel time/route from that town, delivery details, local customers, FAQ).
- HIGH: Delivery terms/zone not stated (Belgium only? cost? free from X euro? pick-up in store?). Page /nl/bestellen-en-betalen exists; add "Levering in Oost-Vlaanderen en heel Belgie" details + "Afhalen in de winkel in Wetteren".
- MEDIUM: Titles/headings on contact page "Decoratiewinkel Wetteren" while business self-describes as tapijtenwinkel; the contact URL slug /nl/decoratiewinkel is non-obvious. Consider "Contact & openingsuren | Amira Deco-Carpets Wetteren".
- MEDIUM: ~60 product pages with very similar ~2000-word templates counted (largely boilerplate nav/footer), thin product copy, duplicate product titles (TUNIS x3, HARMONY x3, MALAGHA x6) - poor for local/product relevance; also junk URLs in crawl (/{url}, /nl/nl/online-shop, /nl/catalog-14/nl/online-shop).
- LOW: Dutch local-intent queries to target: "tapijten Wetteren", "tapijtenwinkel Wetteren", "kunstgras Wetteren", "kunstgras kopen Oost-Vlaanderen", "vloerkleed kopen Gent", "tapijt Dendermonde", "Marokkaanse vintage tapijten Wetteren", "buitenkleed outdoor Wetteren", "kunstgras plaatsen" (only if the shop installs - not stated).
- Suggested homepage Dutch paragraph: "Welkom bij Amira Deco-Carpets in Westrem (Wetteren). Kom langs in onze winkel aan de Westremstraat 59, of laat je tapijt of kunstgras thuis leveren in Gent, Aalst, Dendermonde, Lokeren en de rest van Oost-Vlaanderen."

## Local schema (local angle only; details by schema agent)
- LocalBusiness present on sub-pages with @id = site root, name, address, telephone, email, vatID, openingHoursSpecification, sameAs. MISSING on homepage (the page that matters most - HIGH).
- Missing: geo (5 decimals, do not guess - take from GBP), priceRange, areaServed (Gent, Aalst, Dendermonde, Oost-Vlaanderen), second phone as contactPoint, hasMap, aggregateRating (only if real), sameAs beyond FB group, more specific type (Store / HomeAndConstructionBusiness).
- Hours in schema omit Wednesday (consistent with footer).

## Top actions
1. CRITICAL: Confirm/claim/verify GBP; set category Tapijtwinkel; align NAP, hours (incl. Wednesday), photos; link it from the site.
2. CRITICAL: Start a review programme (Google short link + QR); show reviews on home/contact.
3. HIGH: Add LocalBusiness JSON-LD to the homepage with areaServed, geo, hasMap, sameAs.
4. HIGH: Replace/augment the cookie-gated map with a plain route link + an embedded map loaded on consent with a visible fallback.
5. HIGH: Create 3-5 unique service-area pages (Gent, Aalst, Dendermonde, Lokeren) + delivery page content.
6. HIGH: Create a real Facebook business page and Instagram; replace the Facebook group in sameAs.
7. MEDIUM: Fix directory name/locality inconsistencies (Gouden Gids "Amira Deco"/Westrem); claim Infobel, Cylex, Bing Places, Apple Business Connect.
8. MEDIUM: Show opening hours with explicit closed days; add holiday hours.
9. MEDIUM: Add second phone to schema/llms.txt; decide the primary phone.
10. LOW: Clean junk/duplicate URLs and duplicate product titles.

## Limitations
No DataForSEO/GBP API: GBP existence, category, rating, review count/velocity, response rate, local pack rankings, Infobel/Yelp/Facebook/Instagram presence and backlink data were NOT verified (search engines blocked automated queries; only Gouden Gids was fetched). Proximity (largest ranking factor) is outside the owner's control. Home map embed content was not viewable (consent gated). No coordinates invented.
