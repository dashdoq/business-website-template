# Content Quality and On-Page SEO: amiradecocarpets.be

Audit date: 2026-11-21. Language evaluated: Dutch (Flemish). Platform: Proxi webshop template.
Method: data from raw/crawl-snapshot.jsonl (102 URLs), plus 17 pages fetched live (raw mode, no browser, at most 1 request per second): homepage, /nl/tapijten-2, /nl/kunstgras-3, /nl/vloerkleden, /nl/amira-deco-carpets, /nl/decoratiewinkel, /nl/bestellen-en-betalen, /nl/algemene-voorwaarden, /nl/catalog-14/tapijten, /nl/catalog-14/lopers, and products malagha, malagha-2229, molly, harmony-grey, harmony-beige-2319, sahara-mist.
Main-content word counts below were measured from the H1 to the footer. They exclude the cookie modal, navigation, cart and login widgets, and duplicated DOM blocks. trafilatura's `extracted_text` picked up the cookie-policy modal as the main content on this template, so it was not used.
Visual issues are in findings/visual.md and are not repeated here.

## Scores

| Area | Score |
|---|---|
| **Content Quality** | **32 / 100** |
| E-E-A-T (weighted) | 34 / 100 |
| AI citation readiness | 22 / 100 |
| **On-Page SEO** | **35 / 100** |

E-E-A-T breakdown. The weights are this skill's internal model. Google publishes no numeric weights.

| Factor | Weight | Score | Basis |
|---|---|---|---|
| Experience | 20% | 30 | Real shop photos in the gallery and some concrete details: Belgian and German carpets, artificial grass 2 and 3 cm thick, a physical shop in Wetteren. No customer photos, projects, reviews (every product shows "0 beoordelingen") or stories from the owner. |
| Expertise | 25% | 25 | No product specs anywhere: material, pile height, origin, care, weight, suitability for underfloor heating. The copy is generic and gives no buying advice (size, material, maintenance). |
| Authoritativeness | 25% | 20 | No reviews, no brand or supplier names, no press. The only social profile is a Facebook *group*. |
| Trustworthiness | 30% | 55 | Good: full NAP, 2 phone numbers, email, VAT number BE1027627601 and opening hours in the footer. The terms name the seller and address, and HTTPS is in place. Bad: "Bestellen en betalen" is empty, there is no visible information on shipping costs or delivery times, MOLLY has no price, some sizes cannot be added to the cart, and price and quality claims are unsubstantiated. |

Weighted E-E-A-T: 0.2x30 + 0.25x25 + 0.25x20 + 0.3x55 = 34.

Templated metadata check (`metadata_template.py`, 102 pairs): `site_risk` is low, `templated_ratio` is 0.0 and `shared_cta_phrases` is empty. There is 1 `brand_suffix_in_description`. The low risk mostly reflects that 83 of 102 crawled URLs have **no description at all** (`missing-metadata` x83), so there was little to compare. The descriptions that do exist do share a hand-written formula ("Amira Deco-Carpets is gespecialiseerd in {X} in Wetteren. Ontdek ..." on 4 pages), but they are not a bulk template.

## Measured main-content length

| URL | Page type | Crawler `words` | Real main content | Floor | Verdict |
|---|---|---|---|---|---|
| / | Homepage | 2654 | ~300 unique words (the same 5-paragraph block appears twice in the DOM) | 500 | Thin |
| /nl/tapijten-2 | Category landing | 2094 | ~300 | 800 | Thin |
| /nl/kunstgras-3 | Category landing | 2082 | ~290 | 800 | Thin |
| /nl/vloerkleden | Gallery | 2068 | ~250 | 500 | Thin, and the title does not match the page |
| /nl/decoratiewinkel | Contact | 2071 | ~250 + form | n/a | OK for contact |
| /nl/amira-deco-carpets | About | 1903 | **~90** | 500 | Very thin |
| /nl/bestellen-en-betalen | Info | 1797 | **0** (H1 only) | n/a | Empty page |
| /nl/algemene-voorwaarden | Legal | 3822 | ~2000 | n/a | OK |
| /nl/catalog-14/tapijten | Shop category | 1990 | 1 sentence of intro (17 words) + tiles | 300 | Thin |
| /nl/catalog-14/lopers | Shop category | 1920 | 0 words of intro, 3 products | 300 | Thin |
| Product pages (6 sampled) | Product | 2013-2084 | **0 words of description** (name, price, size and colour pickers only; the "Meer details" tab is empty) | 300 | Thin (all ~75 products) |

Readability (Flesch-Douma, Dutch, on unique body copy): homepage 57, /nl/tapijten-2 45, /nl/kunstgras-3 59, /nl/vloerkleden 51, /nl/decoratiewinkel 58, about 64. The average sentence is 13-16 words, which is fine. /nl/tapijten-2 is hardest to read because of long compounds and a final paragraph of 6 sentences in a row. The target for a consumer shop is 60-70. Readability is a minor issue compared with thinness.

---

## Content Quality findings

### C1. Product pages have no descriptive content. CRITICAL
Evidence: /nl/catalog-14/tapijten/malagha, /molly, /harmony-grey, /harmony-beige-2319, /sahara-mist, /malagha-2229. The pattern holds across every sampled product and, from the crawl's identical word totals, across all ~75 products. Each page shows only the name, price, size and colour selectors, an empty "Meer details" tab and a generic lead form. The Product JSON-LD has `"description": ""` and `"brand": {"slogan": ""}`.
Impact: There is nothing to rank for beyond a brand-less model name. Shoppers and AI systems get no facts to quote. The QRG would rate this Lowest/Low main content for a YMYL-adjacent purchase.
Fix: Write a 120-250 word description per product model (not per colour), in Dutch. Cover:
- material (polypropyleen, wol, jute, chenille, bouclé),
- poolhoogte (pile height) in mm,
- origin (België or Duitsland, which the site already claims),
- suitable rooms,
- underfloor heating, washable or not,
- care instructions,
- delivery or pickup note.
Add a spec table with Materiaal, Poolhoogte, Herkomst, Onderhoud, Maten, Gewicht. Fill the "Meer details" tab or remove it. Start with the 10 best sellers.

### C2. Empty "Bestellen en betalen" page; shipping and returns are not visible. CRITICAL (trust)
Evidence: /nl/bestellen-en-betalen contains only the H1 "Bestellen en betalen". It is linked from every footer.
Related evidence:
- /nl/catalog-14/tapijten/malagha-2229 shows "Omwille van het gewicht van het product kan dit niet toegevoegd worden aan de winkelmand. Neem contact met ons op" (a product that cannot be ordered online).
- /nl/catalog-14/tapijten/molly shows no price at all.
- The terms only say that delivery costs are charged to the customer, without giving amounts.
Fix: Write this page (~400 words):
- payment methods (Bancontact, Payconiq, kaart, overschrijving: list whichever actually apply),
- delivery area, costs and lead time,
- pickup in Wetteren,
- what happens with heavy or large sizes (delivery on quote),
- 14-day right of withdrawal and how to return,
- custom sizes ("op maat").

Link it from product pages next to the price.

### C3. About page is too thin to establish who is behind the shop. HIGH
Evidence: /nl/amira-deco-carpets has about 90 words. It gives no owner name, founding year, team photo, story or sourcing explanation.
Fix: Write 400-600 words covering:
- who runs the shop (name and photo),
- since when,
- where the carpets come from (which Belgian and German producers),
- what the showroom offers (size of the shop, samples to take home, measuring service),
- delivery radius (Gent, Aalst and Dendermonde are already mentioned on the homepage).

Add 2-3 genuine shop or team photos and link to Google reviews.

### C4. Generic, interchangeable marketing copy with AI-typical phrasing. HIGH
Evidence (quoted from the pages):
- /nl/tapijten-2: "Wacht niet langer en geef je interieur de upgrade die het verdient!"
- /nl/kunstgras-3: "Uw droomtuin begint hier!"
- /nl/vloerkleden: "de mogelijkheden zijn eindeloos" and "jouw interieur naar een hoger niveau te tillen"
- Homepage: "Wacht niet langer om jouw woonruimte te transformeren."

All 4 landing pages follow the same skeleton: "{X} van/bij Amira Deco-Carpets in Wetteren is dé ...", then "Bij Amira Deco-Carpets ...", then a closing rhetorical question and CTA. Flagged per the QRG (11 Sept 2025): generic phrasing, no original insight, repetitive structure across pages, few first-hand signals.
Fix: Replace the filler with concrete, checkable facts:
- price ranges per size (for example "160x230 vanaf € 49"),
- materials in stock,
- brands or origin,
- custom-size service and lead time,
- kunstgras: roll widths, thickness, price per m², whether installation is offered.

Add a short "Hoe kies je de juiste maat?" section with real guidance on /nl/tapijten-2. Cut the closing CTA paragraph to one line.

### C5. Unsubstantiated price and quality claims. HIGH
Evidence:
- Homepage: "outletprijzen tot wel 70% goedkoper"
- /nl/kunstgras-3: "vaak goedkoper dan in andere winkels" and "Perfecte kwaliteit gegarandeerd"
- /nl/kunstgras-3: "Onze deskundige medewerkers"
- /nl/tapijten-2: "hoge kwaliteit tegen lage prijzen"

Fix: Back each claim with something specific (a crossed-out reference price, a named guarantee, a review quote) or remove it. Check percentage-off claims against the Belgian rules on price-reduction announcements (Boek VI WER) before using them.

### C6. Inconsistent form of address (je/jouw vs u/uw), even within one page. MEDIUM
Evidence:
- Homepage: H1 "in uw interieur", body "je/jouw".
- /nl/tapijten-2: H1 "voor uw interieurdecoratie", body "je".
- /nl/kunstgras-3 and /nl/decoratiewinkel: "u".
- /nl/vloerkleden and /nl/amira-deco-carpets: "je".
- Product UI: "Kies je maat" next to "Gelieve in te loggen om uw verlanglijst".

Fix: Pick one form for the whole site. "je" fits a modern Flemish interior shop. Apply it to all copy, headings and meta tags. The UI strings belong to the Proxi template; change them in the language settings if the platform allows.

### C7. Spelling and language errors. MEDIUM
Evidence:
- "MARROKAANSE VINTAGE" should be **Marokkaanse**. It appears in the nav label, category H1, title and URL /nl/catalog-14/marrokaanse-vintage.
- "bohemien" should be **bohémien** (homepage).
- Category names are inconsistently cased: KINDERTAPIJTJES, LOPERS and WASBAAR BADKAMER in capitals vs Sierkussens and Dekens.
- Colour names are in English in product names: GREY, IVORY, CREAM, BLACK. Flemish shoppers search "grijs", "ivoor", "crème", "zwart".

Fix: Correct the spelling and 301-redirect to /nl/catalog-14/marokkaanse-vintage. Use sentence case for categories. Keep the supplier model name but add the Dutch colour word ("Harmony vloerkleed grijs").

### C8. Indexable empty categories. MEDIUM
Evidence: The shop sidebar shows KINDERTAPIJTJES (0), MARROKAANSE VINTAGE (0) and WASBAAR BADKAMER (0). All 3 URLs are in the sitemap, self-canonical and indexable: /nl/catalog-14/kindertapijtjes, /nl/catalog-14/marrokaanse-vintage, /nl/catalog-14/wasbaar-badkamer.
Fix: Fill them with products, or hide them from navigation and set noindex until they have stock. Do not leave soft-404-like pages in the sitemap.

### C9. Near-duplicate colour-variant product pages. MEDIUM
Evidence:
- 4 indexable URLs titled "HARMONY": /harmony, /harmony-grey, /harmony-ivory-2314, /harmony-beige-2319. harmony-grey vs harmony-beige share 93% of 4-word shingles.
- 3 "TUNIS" URLs: tunis-ivory-2238, tunis-beige, tunis-grey.
- 2 "BARLEY" URLs: barley, barley-775.
- All are self-canonical and in the sitemap.

The MALAGHA variants (-2226 to -2231) are handled correctly. They canonicalize to /malagha and are not in the sitemap.
Fix: Merge the colour variants into one product with a colour selector, as already done for MALAGHA, or canonicalize to the main model. If they stay separate, give each a distinct title, H1 and description that name the colour.

### C10. Homepage body copy duplicated in the DOM. LOW
Evidence: The 5 H2 sections ("Breng sfeer en warmte in huis" through "Neem vandaag nog actie!") and the H1 appear twice in the homepage HTML. That gives roughly 600 words of HTML for about 300 unique words.
Fix: Render the block once and use CSS for responsive or "Meer info" toggles.

### C11. No freshness or update signals. LOW
Evidence: No dates, no blog or advice section, no "nieuw binnen" content. The date detector returned 2002-01-01, which is a platform artifact and not a real date.
Fix: Add a "Nieuw binnen" or "Advies" section with 1-2 posts a month, for example "Welke maat tapijt onder je zetel?", "Kunstgras leggen: 2 of 3 cm?" or "Tapijt onderhouden en wassen". Date each post and name its author.

### C12. AI citation readiness: 22/100. MEDIUM
What is missing:
- quotable facts (specs, prices per size, delivery terms),
- FAQs,
- a clear Q&A heading hierarchy,
- complete Product structured data: no description, empty brand, no `price` or `priceCurrency` in `offers`.

The homepage has **no JSON-LD**, while the subpages carry LocalBusiness. That LocalBusiness data is good: NAP, hours and VAT.
Fix:
- Add an FAQ block of 5-8 questions to /nl/tapijten-2 and /nl/kunstgras-3: levering, maatwerk, onderhoud, prijzen, afhalen.
- Add spec tables to products.
- Hand the schema fixes (Product price, brand and description; LocalBusiness on the homepage) to the schema audit.

---

## On-Page SEO findings

### O1. Meta descriptions missing on 83 of 102 crawled URLs. HIGH
Evidence:
- Every product page, plus /nl/algemene-voorwaarden, /nl/catalog-14/lopers, /kindertapijtjes, /laatste-stock, /online-shop, /buitenkleed-indoor-amp-outdoor-stock, /wasbaar-badkamer and /marrokaanse-vintage.
- /nl/confidentiality_ws has a 17-character description, but it is noindex.
- /nl/bestellen-en-betalen has 71 characters.

Fix: Write descriptions for every category and info page (examples below). For products, use the template below so Proxi fills it automatically from fields.

### O2. Product titles are only the product name. HIGH
Evidence: "MALAGHA" x7, "HARMONY" x4, "TUNIS" x3, "BARLEY" x2, "MOLLY", "SIGN", "FEEL", "LIMA". None has a product type, colour, brand or shop name.
Titles that do not match the H1:
- /nl/catalog-14/tapijten/milano: title "MILANO", H1 "LINA"
- /ash-mirage-2355: title "DESIGN VINTAGE", H1 "Ash Mirage"

Fix: Apply the product title template below. Correct the mismatched titles.

### O3. Duplicate titles and keyword cannibalization between info pages and shop categories. HIGH
Evidence:
- "Tapijt bestellen | Amira Deco-Carpets" x4: /nl/catalog-14/tapijten, /nl/tapijten, /nl/tapijten-19 and /nl/kunstgras-18.
- "Online shop" x4.
- "Tapijtenwinkel Wetteren | Amira Deco-Carpets" x3: the homepage, /nl/catalog-14 (empty canonical) and the review form /catalog/c/review/form/ca/14/ar/605, which is indexable.
- /nl/tapijten-2 ("Tapijten Wetteren") and /nl/catalog-14/tapijten ("Tapijt bestellen") both target "tapijten" and both appear as "Tapijten" in the menu.

Fix:
- Give the two pages distinct intents. /nl/tapijten-2 is the local and advice landing ("Tapijten in Wetteren"). /nl/catalog-14/tapijten is the transactional listing ("Tapijten online kopen"). Cross-link them with descriptive anchors.
- Noindex the review-form URLs.
- Give /nl/catalog-14 a canonical to the homepage, or 301 it.

### O4. Homepage H1 problems. HIGH (known; summarized here)
Evidence: There are 3 H1 elements. One is empty and two are identical, both reading "Ontdek de beste tapijtenwinkel voor comfort en stijl in uw interieur || Amira Deco-|| Carpets", with the "||" animation markup in the text. The visible hero heading "Sfeer en comfort voor ieder interieur" is an H2, and it repeats as an H2 on every info page.
Fix: Use one H1 in the hero: **"Tapijten en kunstgras in Wetteren"**. Put the slogan in a `<p>`. Remove the empty H1 and the "||" markup. Remove the sitewide slogan H2 from the subpages.

### O5. Product H1 contains the price, and the heading outline is polluted by widgets. MEDIUM
Evidence:
- H1 "MALAGHA 35,00 EUR", "HARMONY GREY 35,00 EUR", "Sahara Mist 15,00 EUR": the price is inside the `<h1>`.
- Every page has H2/H3/H4 headings for UI widgets: "Inloggen" (H2, up to 3 times), "Winkelmandje" (H3), "Product is toegevoegd aan uw winkelmand" (H4), "Gelieve in te loggen om uw verlanglijst aan te vullen" (H4).
- Product pages have no content H2s at all.

Fix: Move the price out of the H1 into its own element. Turn the cart, login and wishlist widget headings into `<p>`/`<div>` (a Proxi template change). Add content H2s on products such as "Eigenschappen", "Maten en prijzen" and "Onderhoud".

### O6. Wrong internal link targets and broken template links. HIGH
Evidence:
- On /nl/kunstgras-3 the in-text link "kunstgras" points to /nl/kunstgras-18, which canonicalizes to and displays the **Tapijten** listing (H1 "Tapijten"). There is no artificial-grass category in the shop.
- On /nl/tapijten-2 the in-text "webshop" link goes to /nl/tapijten-19, another duplicate of the carpet listing.
- `href="{url}"` placeholders are present in the cart template on every page. The crawler found 404s at /{url} and /nl/catalog-14/{url}.
- The relative href `nl/online-shop` in the sticky CTA ("Ontdek ons assortiment!") resolves to /nl/catalog-14/nl/online-shop on shop pages, creating duplicate URLs.

Fix:
- Point kunstgras links at a real kunstgras product or category, or at a quote/contact anchor.
- Link /nl/tapijten-2 directly to /nl/catalog-14/tapijten.
- Retire /nl/kunstgras-18 and /nl/tapijten-19 with 301s.
- Fix the `{url}` placeholder.
- Make the CTA href absolute: /nl/catalog-14/online-shop.

### O7. Navigation links point to non-canonical URLs. MEDIUM
Evidence: The main menu links /nl/tapijten, /nl/lopers, /nl/sierkussens, /nl/dekens, /nl/kindertapijtjes, /nl/marrokaanse-vintage, /nl/laatste-stock and /nl/online-shop. Each one canonicalizes to its /nl/catalog-14/... equivalent. Every internal link therefore points at a duplicate.
Fix: Point the menu items at the canonical /nl/catalog-14/... URLs, or 301 the short URLs.

### O8. Weak anchor text. MEDIUM
Evidence:
- Product tiles on category pages link with the image only. The product name exists only as `alt`/`title`, not as visible text. /ariel-chenille has a "nophoto.webp" placeholder.
- The homepage cards use "Lees meer" twice, for Tapijten and Kunstgras.
- The info pages use "webshop" as the anchor.

Fix: Show the product name and size range as a text link under each tile. Replace "Lees meer" with "Bekijk onze tapijten" and "Meer over kunstgras". Use descriptive anchors such as "tapijten online bestellen" and "lopers voor gang en hal". Add contextual links from /nl/tapijten-2 to the Lopers, Buitenkleden and Laatste stock categories.

### O9. Page and title mismatches. MEDIUM
Evidence:
- /nl/vloerkleden is the gallery (menu label "Galerij"; H1 "Vloerkleden en kunstgras inspiratie") but is titled "Vloerkleden Wetteren".
- /nl/decoratiewinkel is the contact page (menu "Contact"; H1 "Contacteer onze decoratiewinkel") but is titled "Decoratiewinkel Wetteren".
- The homepage og:description has missing spaces ("huisBij", known).
- /nl/kunstgras-3 H1 "Kunstgras voor uw droomtuin" contains no location or spec.

Fix: Align each title and H1 with the page's real purpose (see the rewrites below). If a "vloerkleden" landing page is wanted, make it a separate page with real content. Write og:description by hand.

### O10. Opening hours omit Wednesday. LOW
Evidence: The footer and LocalBusiness data list Ma, Di and Do-Zo 11u-19u. Wednesday is missing rather than marked closed.
Fix: Add "Wo: gesloten" to the footer and contact page, if that is correct.

---

## Proposed titles and meta descriptions (Dutch / Flemish)

All titles are 42-57 characters and all descriptions 132-154 characters. They use "je" consistently. Check facts marked [controleren] before publishing.

| URL | Title | Meta description |
|---|---|---|
| / | Tapijten en kunstgras in Wetteren \| Amira Deco-Carpets | Tapijtenwinkel in Wetteren met vloerkleden, lopers en kunstgras aan outletprijzen. Kom langs in de Westremstraat of bestel online met levering aan huis. |
| /nl/tapijten-2 | Tapijten in Wetteren, ook op maat \| Amira Deco-Carpets | Vloerkleden uit België en Duitsland: lopers, kindertapijten, wollen en buitentapijten, ook op maat. Bekijk ze in onze winkel in Wetteren of bestel online. |
| /nl/catalog-14/tapijten | Tapijten online kopen \| Webshop Amira Deco-Carpets | Bestel je vloerkleed online: moderne, vintage en ronde tapijten in alle maten, vanaf € 15. Afhalen in Wetteren of levering aan huis. |
| /nl/kunstgras-3 | Kunstgras in Wetteren, 2 en 3 cm dik \| Amira Deco-Carpets | UV-bestendig kunstgras van 2 of 3 cm voor tuin, terras en speelhoek. Kom het voelen in onze winkel in Wetteren of vraag advies en een prijs op maat. |
| /nl/vloerkleden (gallery) | Galerij: onze winkel en vloerkleden \| Amira Deco-Carpets | Foto's van onze tapijtenwinkel in Wetteren en een greep uit onze vloerkleden, sierkussens en dekens. Kom de collectie in het echt bekijken en voelen. |
| /nl/decoratiewinkel (contact) | Contact en openingsuren \| Amira Deco-Carpets Wetteren | Westremstraat 59, 9230 Wetteren. Open ma, di en do t/m zo van 11u tot 19u, woensdag gesloten [controleren]. Bel 0468 30 16 83 of mail info@amiradecocarpets.be. |
| /nl/amira-deco-carpets | Over ons \| Amira Deco-Carpets, tapijtenwinkel in Wetteren | Maak kennis met Amira Deco-Carpets in Wetteren: tapijten, woontextiel en kunstgras met persoonlijk advies en eerlijke prijzen. Kom langs of shop online. |
| /nl/bestellen-en-betalen | Bestellen, levering en betalen \| Amira Deco-Carpets | Zo bestel je bij Amira Deco-Carpets: betaalmethodes, leveringskosten en -termijnen, afhalen in Wetteren en retourneren binnen 14 dagen. |
| /nl/catalog-14/lopers | Lopers voor gang en hal \| Amira Deco-Carpets | Jute en geweven lopers voor gang, hal en keuken, voor binnen en buiten, vanaf € 20. Bestel online of kom ze bekijken in onze winkel in Wetteren. |
| /nl/catalog-14/buitenkleed-indoor-amp-outdoor-stock | Buitenkleden voor terras en tuin \| Amira Deco-Carpets | Weerbestendige indoor- en outdoorkleden van 160x230 tot 240x305 cm, vanaf € 49. Ideaal voor terras, balkon of veranda. Afhalen in Wetteren mogelijk. |
| /nl/catalog-14/laatste-stock | Laatste stock: tapijten in solden \| Amira Deco-Carpets | Laatste stuks aan scherpe prijzen: vloerkleden, buitenkleden en ronde tapijten zolang de voorraad strekt. Bestel online of haal af in Wetteren. |

Proposed H1s:
- Homepage: "Tapijten en kunstgras in Wetteren"
- /nl/tapijten-2: "Tapijten en vloerkleden in Wetteren"
- /nl/kunstgras-3: "Kunstgras kopen in Wetteren"
- /nl/catalog-14/tapijten: "Tapijten online kopen"
- /nl/decoratiewinkel: "Contact en openingsuren"
- /nl/vloerkleden: "Galerij: onze winkel en collectie"

### Product title and meta template (Proxi fields)

- **Title:** `{Modelnaam in Title Case} {producttype} {kleur NL} | Amira Deco-Carpets`. If the title is over 60 characters, drop the colour. Put the size in the title only for single-size items (outdoor rugs).
  - "Harmony vloerkleed grijs | Amira Deco-Carpets" (45)
  - "Malagha vloerkleed beige of grijs | Amira Deco-Carpets" (54)
  - "Bogo jute loper zwart | Amira Deco-Carpets" (42)
  - "Buitenkleed indoor/outdoor 160x230 cm | Amira Deco-Carpets"
- **Meta description:** `{Modelnaam} {producttype} in {kleur(en)}, van {kleinste maat} tot {grootste maat} cm, vanaf € {laagste prijs}. {1 USP: materiaal/onderhoud}. Bestel online of kom het voelen in onze winkel in Wetteren.` Keep it at or under 155 characters.
  - "Harmony vloerkleed in grijs, van 80x150 tot 200x290 cm, vanaf € 35. Bekijk alle maten en bestel online of kom het voelen in onze winkel in Wetteren." (148)
- **H1:** `{Modelnaam} {producttype} {kleur}` with no price, for example "Harmony vloerkleed grijs".

---

## Priority order

1. Critical: write the Bestellen en betalen page (C2). Add descriptions and spec tables to products, starting with the top 10 (C1).
2. High: add meta descriptions sitewide and the product title template (O1, O2). Fix the homepage H1 (O4). Fix the kunstgras-18, tapijten-19 and {url} links (O6). Resolve the title duplicates and cannibalization (O3). Expand the About page (C3). Rewrite the generic copy with facts and remove the unsupported claims (C4, C5).
3. Medium: use one form of address and fix the spelling (C6, C7). Handle empty categories and colour variants (C8, C9). Point the nav at canonical URLs and improve anchors (O7, O8). Align page titles (O9). Clean the heading outline (O5). Add an FAQ block (C12).
4. Low: remove the duplicate DOM block (C10). Add an advice/blog section for freshness (C11). Add Wednesday to the opening hours (O10).

## Structured findings (for audit-data.json, category "Content Quality")

```json
{
  "category": "Content Quality",
  "scores": {"content_quality": 32, "eeat": 34, "experience": 30, "expertise": 25, "authoritativeness": 20, "trustworthiness": 55, "ai_citation_readiness": 22, "on_page_seo": 35},
  "metadata_template_check": {"site_risk": "low", "templated_ratio": 0.0, "shared_cta_phrases": {}, "missing_metadata": 83, "pages_checked": 102},
  "findings": [
    {"id": "C1", "severity": "Critical", "title": "Product pages have 0 words of description; Product schema description and brand empty", "urls": ["/nl/catalog-14/tapijten/malagha", "/nl/catalog-14/tapijten/molly", "/nl/catalog-14/tapijten/harmony-grey", "/nl/catalog-14/tapijten/sahara-mist"]},
    {"id": "C2", "severity": "Critical", "title": "Bestellen en betalen page empty; no shipping/returns info; MOLLY has no price; some sizes cannot be added to cart", "urls": ["/nl/bestellen-en-betalen", "/nl/catalog-14/tapijten/malagha-2229", "/nl/catalog-14/tapijten/molly"]},
    {"id": "C3", "severity": "High", "title": "About page ~90 words, no people/history", "urls": ["/nl/amira-deco-carpets"]},
    {"id": "C4", "severity": "High", "title": "Generic AI-typical marketing copy with the same structure across landing pages", "urls": ["/", "/nl/tapijten-2", "/nl/kunstgras-3", "/nl/vloerkleden", "/nl/decoratiewinkel"]},
    {"id": "C5", "severity": "High", "title": "Unsubstantiated claims (tot 70% goedkoper, perfecte kwaliteit gegarandeerd)", "urls": ["/", "/nl/kunstgras-3", "/nl/tapijten-2"]},
    {"id": "C6", "severity": "Medium", "title": "Mixed je/u form of address", "urls": ["/", "/nl/tapijten-2", "/nl/kunstgras-3"]},
    {"id": "C7", "severity": "Medium", "title": "Spelling: Marrokaanse -> Marokkaanse; bohemien -> bohémien; English colour names", "urls": ["/nl/catalog-14/marrokaanse-vintage", "/"]},
    {"id": "C8", "severity": "Medium", "title": "Indexable empty categories (0 products)", "urls": ["/nl/catalog-14/kindertapijtjes", "/nl/catalog-14/marrokaanse-vintage", "/nl/catalog-14/wasbaar-badkamer"]},
    {"id": "C9", "severity": "Medium", "title": "Near-duplicate colour variants self-canonical (93% similarity)", "urls": ["/nl/catalog-14/tapijten/harmony-grey", "/nl/catalog-14/tapijten/harmony-beige-2319", "/nl/catalog-14/tapijten/tunis-grey"]},
    {"id": "C10", "severity": "Low", "title": "Homepage copy block duplicated in DOM", "urls": ["/"]},
    {"id": "C11", "severity": "Low", "title": "No freshness or update signals", "urls": ["/"]},
    {"id": "C12", "severity": "Medium", "title": "Low AI citation readiness: no FAQ, no specs, homepage has no JSON-LD, Offer lacks price", "urls": ["/", "/nl/catalog-14/tapijten/malagha"]},
    {"id": "O1", "severity": "High", "title": "83/102 URLs missing meta description", "urls": ["/nl/catalog-14/lopers", "/nl/algemene-voorwaarden", "/nl/catalog-14/tapijten/malagha"]},
    {"id": "O2", "severity": "High", "title": "Product titles are only the name; title/H1 mismatches", "urls": ["/nl/catalog-14/tapijten/milano", "/nl/catalog-14/tapijten/ash-mirage-2355"]},
    {"id": "O3", "severity": "High", "title": "Duplicate titles and cannibalization between tapijten-2 and catalog tapijten", "urls": ["/nl/tapijten-2", "/nl/catalog-14/tapijten", "/catalog/c/review/form/ca/14/ar/605"]},
    {"id": "O4", "severity": "High", "title": "Homepage 3 H1s with || markup; hero heading not H1", "urls": ["/"]},
    {"id": "O5", "severity": "Medium", "title": "Price inside product H1; widget headings pollute outline", "urls": ["/nl/catalog-14/tapijten/malagha"]},
    {"id": "O6", "severity": "High", "title": "Kunstgras link lands on carpet listing; {url} placeholder links; relative CTA href creates duplicates", "urls": ["/nl/kunstgras-3", "/nl/kunstgras-18", "/nl/tapijten-19", "/nl/catalog-14/nl/online-shop"]},
    {"id": "O7", "severity": "Medium", "title": "Main nav links to non-canonical URLs", "urls": ["/nl/tapijten", "/nl/lopers", "/nl/online-shop"]},
    {"id": "O8", "severity": "Medium", "title": "Image-only product anchors; generic 'Lees meer' and 'webshop' anchors", "urls": ["/nl/catalog-14/tapijten", "/"]},
    {"id": "O9", "severity": "Medium", "title": "Gallery and contact pages titled as Vloerkleden and Decoratiewinkel; og:description missing spaces", "urls": ["/nl/vloerkleden", "/nl/decoratiewinkel", "/"]},
    {"id": "O10", "severity": "Low", "title": "Opening hours omit Wednesday", "urls": ["/nl/decoratiewinkel"]}
  ]
}
```
