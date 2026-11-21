# GEO / AI-search readiness: amiradecocarpets.be (checked 2026-11-21)

Scope: passage citability of the homepage, /nl/amira-deco-carpets, /nl/tapijten-2, /nl/kunstgras-3 and /nl/vloerkleden (plus /nl/decoratiewinkel, /nl/bestellen-en-betalen, /nl/algemene-voorwaarden and one product page). Also covered: entity clarity, Q&A content, off-site brand signals and estimated visibility on AI platforms.
Robots, llms.txt basics, SSR and agent UX come from findings/agentic.md and are not repeated here.
Method: raw HTML fetched with render_page.py (--mode never, no Playwright, at most 1 request/s). The main content was extracted after removing the cookie-consent modal, because trafilatura's `extracted_text` returns only the modal. Brand search used Brave, KBO public search and Bing. Bing results through the proxy were unusable (unrelated pages), and Brave hit HTTP 429 on "tapijtwinkel Wetteren". DataForSEO was not available, so platform scores are estimates and were not measured live.

## Snapshot of what an AI system can extract today

| Page | Real body words | Paragraphs (words) | Checkable facts |
|---|---|---|---|
| Home | 262 | 55, 50, 47, 38, 47 | Wetteren, "outletprijzen tot 70%", made to size, home delivery, serves Gent/Aalst/Dendermonde |
| Over ons | 102 | 45, 39, 18 | Wetteren only. No founding year, people, store size or brands |
| Tapijten | 276 | 43-86 | Rugs "uit Belgie en Duitsland", runners, children's rugs, outdoor rugs |
| Kunstgras | 268 | 46-66 | Thicknesses "2cm en 3cm", UV-resistant. No price, no installation info, no products in the webshop |
| Vloerkleden (nav: "Galerij") | 226 | 46-68 | None beyond Wetteren |
| Bestellen en betalen | **0** | page is empty (H1 only) | none |

Off-site entity facts:
- KBO 1027.627.601 is "Amira Deco" CommV. Start date 15-09-2025, active, Westremstraat 59, 9230 Wetteren, NACE 47.530 (retail of carpets, rugs and floor coverings).
- Social profiles found: TikTok @amiradecocarpets (videos since at least Oct 2024), Instagram @amiradecocarpets (posts since Jan 2024), two near-identical Facebook pages "Amira Deco-Carpets" (about 732/733 likes, IDs 100064292671139 and 105135994677135, plus page 61565906481999 in a video URL) and a Facebook group.
- Not found: review platform pages (Trustpilot, Trustlocal), directories (Goudengids, Cylex, Infobel), YouTube, Reddit, Wikipedia/Wikidata, or press mentions.
- For "kunstgras Wetteren" (Brave), Amira is absent from all 19 results. Kunstgrasservice (Wetteren, with a show garden) holds about 14 of them, and Ben's Deco (Herdershoekstraat, Wetteren, also sells carpets) appears as a local carpet competitor.

## Findings

### High: "Bestellen en betalen" page is empty, so delivery and payment questions cannot be answered
/nl/bestellen-en-betalen has only its H1. It is linked from llms.txt and the footer of every page. The only real delivery and returns facts are buried in legal wording in the Algemene voorwaarden: levering overal in Belgie, leveringskosten ten laste van de klant, levering binnen enkele dagen op werkdagen 8u-18u, 15 dagen herroepingsrecht, 2 jaar wettelijke garantie. Elsewhere the site mentions "Afhalen of levering mogelijk" and Mondial Relay appears in the cookie list. An AI asked "levert Amira Deco-Carpets aan huis / wat kost levering" will find nothing usable.
Fix: publish this text (fill in the [brackets]; facts not in brackets come from the terms):

> **Bestellen en betalen bij Amira Deco-Carpets**
> Je bestelt bij Amira Deco-Carpets via de webshop, per e-mail (info@amiradecocarpets.be), telefonisch (0468 30 16 83) of rechtstreeks in onze winkel aan de Westremstraat 59 in 9230 Wetteren. Online bestellingen kun je gratis afhalen in de winkel of laten leveren. We leveren overal in België, meestal binnen [X] werkdagen na je bestelling, op werkdagen tussen 8u en 18u. De leveringskosten bedragen [€ X / gratis vanaf € X] en zie je vóór je betaalt. Je betaalt veilig online met [Bancontact, Visa, Mastercard, ...] of in de winkel [cash/Payconiq/kaart].
>
> **Retourneren**
> Je hebt 15 kalenderdagen na levering om af te zien van je aankoop, zonder opgave van reden. Stuur het ongebruikte tapijt in de originele verpakking terug naar Westremstraat 59, 9230 Wetteren. De retourkosten betaal je zelf. We storten het aankoopbedrag binnen 30 dagen terug. Op alle producten geldt de wettelijke garantie van 2 jaar.

### High: no question-and-answer content anywhere
No page has an FAQ, question-style headings, or a direct answer in its opening sentences. AI Overviews, ChatGPT and Perplexity mostly lift passages that answer a question outright, such as "welke maat vloerkleed onder een bank?" or "kan kunstgras geplaatst worden?". Fix: add a FAQ block to the homepage or a dedicated /nl/veelgestelde-vragen page, plus 3-4 topic questions on each category page. Use visible HTML text, ideally as H3 questions. FAQPage schema is optional because Google no longer shows FAQ rich results for most sites, but visible Q&A is still extracted. Suggested items (sizes come from the webshop's own size selector; [brackets] = owner must confirm):

> **Welke maten vloerkleden hebben jullie?**
> De meeste vloerkleden bij Amira Deco-Carpets zijn verkrijgbaar in 80 x 150, 120 x 170, 160 x 230, 200 x 290 en 240 x 330 cm. Daarnaast hebben we ronde tapijten, lopers voor gangen en buitenkleden tot 240 x 305 cm. Andere afmetingen kunnen we [op maat laten maken / op aanvraag bestellen]. Vraag gerust naar de mogelijkheden in de winkel in Wetteren.
>
> **Welke maat vloerkleed kies ik voor onder mijn bank?**
> Kies een vloerkleed dat minstens de voorpoten van je bank en fauteuils raakt. Voor een gewone zithoek is 160 x 230 cm de populairste maat. Bij een grote hoekbank of open woonruimte past 200 x 290 of 240 x 330 cm beter. Onder een eettafel moet het tapijt rondom ongeveer 60 cm groter zijn dan de tafel, zodat de stoelen erop blijven staan.
>
> **Hoe onderhoud ik mijn tapijt?**
> Stofzuig je tapijt wekelijks zonder borstelrol bij hoogpolige tapijten. Dep vlekken meteen met een vochtige doek in plaats van te wrijven. Voor hardnekkige vlekken verkopen we een tapijtreiniger (Cleaner 500 ml). Onze tapijten uit de reeks Wasbaar Badkamer mogen in de wasmachine op [30 °C]. [Eigenaar: aanvullen per materiaal.]
>
> **Leveren jullie aan huis?**
> Ja. Amira Deco-Carpets levert overal in België, meestal binnen [X] werkdagen. Je kunt je bestelling ook gratis afhalen in onze winkel aan de Westremstraat 59 in Wetteren.
>
> **Plaatsen jullie ook kunstgras?**
> [Ja: Wij leveren en plaatsen kunstgras in Wetteren en omstreken (Gent, Aalst, Dendermonde). Een vrijblijvende offerte vraag je aan via 0468 30 16 83.] / [Nee: Wij verkopen kunstgras van 2 en 3 cm dik per lopende meter, in rollen van [X] m breed. Je kunt het zelf leggen; we geven je graag advies over de ondergrond.]
>
> **Wat kost kunstgras per m²?**
> Kunstgras bij Amira Deco-Carpets kost vanaf [€ X per m²] voor 2 cm en [€ X per m²] voor 3 cm. Kom gerust langs in Wetteren om de stalen te voelen.
>
> **Wanneer is de winkel open?**
> De winkel in Wetteren is open op maandag, dinsdag, donderdag, vrijdag, zaterdag én zondag van 11u tot 19u. Op woensdag zijn we gesloten.
>
> **Kan ik een tapijt terugbrengen?**
> Ja, je hebt 15 dagen na levering om een ongebruikt tapijt in de originele verpakking terug te sturen. Je krijgt het aankoopbedrag binnen 30 dagen terug.

### High: passages are generic marketing copy with almost no extractable facts
Every opening paragraph could describe any carpet shop: "perfecte keuze voor elk interieur", "voor ieder wat wils", "de mogelijkheden zijn eindeloos". The few concrete claims ("tot 70% goedkoper", "op maat gemaakt", "2cm en 3cm", "Belgie en Duitsland") are never backed up with ranges, brands or prices. Fix: start each page with a 50-80 word fact block that answers "wie, wat, waar, voor hoeveel". Suggested replacements:

Homepage (directly under the H1):
> Amira Deco-Carpets is een tapijtwinkel en webshop aan de Westremstraat 59 in Wetteren (Oost-Vlaanderen). We verkopen vloerkleden, lopers, buitenkleden, kindertapijten, wasbare badmatten, kunstgras, sierkussens en dekens. De meeste tapijten kosten tussen [€ X] en [€ X] en zijn verkrijgbaar van 80 x 150 tot 240 x 330 cm. Je kunt online bestellen met levering in heel België, of langskomen in de winkel: zes dagen per week open van 11u tot 19u (woensdag gesloten).

Tapijten (/nl/tapijten-2):
> Bij Amira Deco-Carpets in Wetteren vind je meer dan [45] tapijtmodellen, waaronder hoogpolige tapijten (Heaven, Fluffy), vintage- en Marokkaanse ontwerpen, bouclé, chenille en ronde tapijten. Onze tapijten komen van fabrikanten uit België en Duitsland, zoals [merk/fabrikant]. Prijzen starten vanaf € 40 voor 80 x 150 cm [bevestigen]. Alle tapijten staan in de webshop met prijs per maat en kun je in de winkel bekijken.

Kunstgras (/nl/kunstgras-3):
> Amira Deco-Carpets verkoopt kunstgras in Wetteren in een dikte van 2 cm en 3 cm, UV-bestendig en waterdoorlatend [bevestigen]. Je koopt het per lopende meter van [X] m breed, vanaf [€ X per m²]. [Wij plaatsen het ook / Je kunt het zelf leggen.] Kom stalen bekijken in onze winkel aan de Westremstraat 59, of bestel online met levering in heel België.

Over ons (/nl/amira-deco-carpets), currently 102 words:
> Amira Deco-Carpets is een familiezaak [bevestigen] in Wetteren, opgericht in [jaar] door [voornaam, optioneel]. Sinds [jaar] verkopen we tapijten, vloerkleden en kunstgras vanuit onze winkel van [X m²] aan de Westremstraat 59. De onderneming is ingeschreven als Amira Deco CommV (BTW BE1027627601). Ons assortiment telt [X] modellen, met klanten uit Wetteren, Gent, Aalst en Dendermonde en via de webshop uit heel België.

### High: weak off-site entity graph and no review signals
- No third-party review or directory listings were found. A shop founded (as this legal entity) in Sep 2025 has almost no "Amira Deco-Carpets Wetteren" corroboration for AI systems to cross-check. Plain "Amira" searches also collide with Amira Learning and Amira Willighagen. AI answers for "tapijtwinkel Wetteren" mostly draw on Google Business Profile, Bing Places, reviews and directories.
- The site's only sameAs/social link is a Facebook *group*. The active TikTok and Instagram accounts and the Facebook page are not linked, and there are two duplicate Facebook pages.
- The trade name "Amira Deco-Carpets" and the legal name "Amira Deco CommV" are never connected on the site.
Fix (owner, about 1-2 days of work spread over weeks):
(1) Claim and complete a Google Business Profile with category "Tapijtwinkel" plus secondary categories such as "Kunstgraswinkel", photos, Wednesday marked closed, and the webshop URL. Then do the same in Bing Places (ChatGPT search and Copilot rely on the Bing index).
(2) Ask happy customers for Google reviews that mention the product and place ("vloerkleed", "kunstgras", "Wetteren").
(3) Merge or close the duplicate Facebook page and link Instagram, TikTok and Facebook from the footer and in sameAs.
(4) Add listings with identical NAP (name, address, phone) on Goudengids.be, Trustlocal.be, Cylex.be and Infobel.
(5) Repost the existing TikTok/Instagram videos to a YouTube channel. YouTube mentions correlate most strongly with AI citations, and the videos already exist.
(6) Get a local mention from Wetteren-focused media, the gemeente's lokale handelaars list, or UNIZO.

### Medium: structured data gaps (homepage has no schema; Product schema incomplete)
- The homepage has no JSON-LD. Inner pages do carry a LocalBusiness block (address, telephone, vatID, openingHoursSpecification without Wednesday), which is good, but the homepage is the URL that AI and knowledge panels anchor to. Fix: output the same block on the homepage and improve it: `"@type": ["HomeGoodsStore","LocalBusiness"]`, `legalName: "Amira Deco CommV"`, both phone numbers, `geo`, `hasMap`, `areaServed` (Wetteren, Gent, Aalst, Dendermonde, Belgie), `priceRange`, and `sameAs` with Instagram, TikTok and the Facebook page.
- Product JSON-LD (e.g. /nl/catalog-14/tapijten/heaven-651) has an empty `"description": ""`, a malformed `"brand": {"slogan": ""}` with no name, and an offer URL /nl/heaven-651 that differs from the canonical URL. The first Product block has no price, and the variant blocks repeat the same name. Fix (Proxi platform setting/support ticket): fill in description and brand, point the offer URL to the canonical, and use one Product with offers per size (or ProductGroup with `variesBy: size, color`).

### Medium: product pages have no text, so there is nothing to cite
The product page body is just "Heaven 40,00 EUR", a size and colour dropdown, and a contact form. There is no material, pile height, origin, washability or care information. og:description just repeats the product name, and the meta description is empty. Fix: add a 40-80 word description per model in this format:
> **Heaven** is een zacht hoogpolig tapijt van [100% polyester] met een poolhoogte van [X] cm. Verkrijgbaar in 11 kleuren en 5 maten (80 x 150 tot 240 x 330 cm), vanaf € 40. Geschikt voor woon- en slaapkamer, [niet] geschikt voor vloerverwarming. Onderhoud: regelmatig stofzuigen zonder borstel.

### Medium: kunstgras offer is unclear and outcompeted locally
The Kunstgras page promises "kunstgras van topkwaliteit", but the webshop catalog has no kunstgras category or products. /nl/kunstgras-18 shows the rug catalog under the title "Tapijt bestellen". The page says nothing on installation, price per m² or roll widths. For "kunstgras Wetteren", the local specialist Kunstgrasservice (show garden in Wetteren) holds about 14 of 19 Brave results. Fix: say explicitly what Amira offers (verkoop per meter / plaatsing / stalen in winkel) using the Dutch block above, add at least 2 kunstgras products to the webshop, and pick a differentiated angle such as "kunstgras op maat afgesneden, meenemen dezelfde dag" rather than competing head-on on installation.

### Medium: homepage heading and page-identity confusion
- The homepage has an empty H1 plus the same H1 duplicated with "||" separators in the markup ("... || Amira Deco-|| Carpets"). Fix: use one clean H1, e.g. "Tapijtwinkel Amira Deco-Carpets in Wetteren".
- /nl/vloerkleden is the "Galerij" in the navigation but is titled "Vloerkleden Wetteren" with H1 "Vloerkleden en kunstgras inspiratie". This mixed signal weakens it for "vloerkleed kopen Oost-Vlaanderen". Fix: make it a real vloerkleden page (sizes, styles, price range, link to webshop categories) and move the gallery to its own URL, or rename it consistently.
- H2s are statements ("Breng sfeer en warmte in huis", "Neem vandaag nog actie!"). Fix: rewrite 2-3 per page as questions, e.g. "Waar koop je een vloerkleed in Wetteren?", "Welke tapijten verkoopt Amira Deco-Carpets?", "Levert Amira Deco-Carpets aan huis?".

### Low: entity inconsistencies
- Opening hours list Ma, Di, Do-Zo but never say "woensdag gesloten". Add it in text and set Wednesday closed in Google Business Profile.
- The footer lists two mobile numbers (0468 30 16 83 and 0483 02 88 68), but schema and llms.txt list only the first. Pick a primary number and list the second as e.g. "kunstgras/levering" if that is its purpose.
- The map is behind cookie consent. That is fine because the address is in text, but add "Parkeren: [..]" or "Bereikbaar via [N9/E40]" for local "hoe kom ik er" answers.
- No visible dates anywhere (the extractor fell back to 2002-01-01). Add "Laatst bijgewerkt: [maand jaar]" to FAQ and info pages.

### Low: multi-modal
6 of 16 homepage images have empty alt text and the rest are generic ("Amira Deco-Carpets - Tapijtenwinkel"). Gallery images do not describe the product, room or size. There is no video on the site, although TikTok and Instagram videos exist. Fix: use descriptive Dutch alt text, e.g. "Beige hoogpolig vloerkleed Heaven 160x230 in woonkamer", and embed 1-2 short videos (shop walkthrough, kunstgras thicknesses) with a text summary underneath.

### Low: llms.txt and crawl reliability
- llms.txt is fine but should also link the FAQ page, the filled-in Bestellen en betalen page, and the social profiles.
- One of 9 page fetches in this audit (/nl/kunstgras-3) was reset by the server and worked on retry. Together with agentic.md this makes a pattern. AI crawlers that hit a reset may skip the page until their next crawl. Ask Proxi/the host about rate limiting.
- Duplicate URLs dilute signals: /nl/catalog-14 duplicates the homepage, and /nl/tapijten, /nl/tapijten-19 and /nl/kunstgras-18 share one catalog page. Canonicals should consolidate these (SEO technical scope).

## Platform outlook (estimated, not measured)

| Platform | Score | Reasoning |
|---|---|---|
| Google AI Overviews | 35/100 | Local queries ("tapijtwinkel Wetteren") come mainly from Google Business Profile and reviews (status not verified). The site has LocalBusiness schema on inner pages and clear NAP, but no Q&A passages. Kunstgras is dominated by Kunstgrasservice |
| ChatGPT Search | 28/100 | Depends on the Bing index and third-party corroboration. No directories or reviews were found, and the brand name collides with "Amira" entities |
| Perplexity | 33/100 | Can read the SSR pages and llms.txt, but finds few facts worth citing. Would cite the site only for a branded query |
| Bing Copilot | 28/100 | Same as ChatGPT. Bing Places/Webmaster status unknown |

Likely answer today for "tapijtwinkel Wetteren" or "vloerkleed kopen Oost-Vlaanderen": Amira is named only if the GBP/map data surfaces it, with no supporting detail. For "kunstgras Wetteren", Amira is not mentioned.

## Top 5 highest-impact changes

1. Claim and complete GBP and Bing Places, start collecting reviews, and link Instagram, TikTok and Facebook in the footer and sameAs. Effort: 1 day plus ongoing.
2. Fill /nl/bestellen-en-betalen with the delivery/payment/returns text above. Effort: 1 hour.
3. Add the 8-question Dutch FAQ (homepage or its own page) and 3-4 Q&As per category page. Effort: 2-3 hours.
4. Replace the opening paragraphs of home, Tapijten, Kunstgras and Over ons with the fact blocks above, and fix the duplicated homepage H1. Effort: 2 hours.
5. Add LocalBusiness/HomeGoodsStore JSON-LD on the homepage and fix the Product schema; add descriptions to the top 15 products. Effort: 1 day (part of it via a Proxi support ticket).

## Scores

GEO Health Score: **43/100**

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 30 | 7.5 |
| Structural readability | 20% | 50 | 10.0 |
| Multi-modal | 15% | 40 | 6.0 |
| Authority and brand signals | 20% | 25 | 5.0 |
| Technical accessibility | 20% | 70 | 14.0 |

**AI Search Readiness: 44/100**, calculated as 75% GEO (43) plus 25% agent-UX heuristic from agentic.md (48). There are no Critical findings: crawlers can read everything. The gap is that there is little worth citing and little off-site corroboration.

## Structured findings (for audit-data.json, category "AI Search Readiness")

```json
{
  "category": "AI Search Readiness",
  "score": 44,
  "subscores": {"geo_health": 43, "agent_ux": 48, "citability": 30, "structure": 50, "multimodal": 40, "authority": 25, "technical": 70},
  "platform_estimates": {"google_aio": 35, "chatgpt": 28, "perplexity": 33, "bing_copilot": 28},
  "findings": [
    {"severity": "high", "id": "geo-empty-ordering-page", "title": "Bestellen en betalen page is empty", "url": "/nl/bestellen-en-betalen", "fix": "Publish delivery, payment and returns text (Dutch draft in geo.md)", "effort": "1h"},
    {"severity": "high", "id": "geo-no-faq", "title": "No question-answer content on any page", "fix": "Add 8-item Dutch FAQ plus Q&As per category page", "effort": "2-3h"},
    {"severity": "high", "id": "geo-generic-passages", "title": "Opening passages are generic, with no extractable facts", "urls": ["/", "/nl/tapijten-2", "/nl/kunstgras-3", "/nl/amira-deco-carpets"], "fix": "50-80 word fact blocks (Dutch drafts in geo.md)", "effort": "2h"},
    {"severity": "high", "id": "geo-weak-entity-graph", "title": "No reviews or directories found; sameAs only a Facebook group; duplicate Facebook pages; legal name not on site", "fix": "GBP and Bing Places, reviews, link Instagram/TikTok/Facebook page, directory listings, YouTube", "effort": "1d + ongoing"},
    {"severity": "medium", "id": "geo-schema-gaps", "title": "No JSON-LD on homepage; Product schema has empty description, malformed brand, offer URL not canonical", "fix": "HomeGoodsStore JSON-LD on homepage; fix Product/Offer via Proxi", "effort": "0.5-1d"},
    {"severity": "medium", "id": "geo-thin-product-pages", "title": "Product pages contain only name, price and dropdowns", "fix": "40-80 word description per model", "effort": "ongoing"},
    {"severity": "medium", "id": "geo-kunstgras-unclear", "title": "Kunstgras: no products, price or installation info; competitor dominates", "fix": "Explicit offer block, add products, differentiated angle", "effort": "2h"},
    {"severity": "medium", "id": "geo-heading-identity", "title": "Duplicate/empty homepage H1; /nl/vloerkleden is the gallery with mixed title/H1", "fix": "Single clean H1; separate gallery from vloerkleden page; question-style H2s", "effort": "1h"},
    {"severity": "low", "id": "geo-nap-inconsistency", "title": "Wednesday-closed not stated; second phone missing from schema and llms.txt; no visible dates", "effort": "30m"},
    {"severity": "low", "id": "geo-multimodal", "title": "Empty or generic image alts; no on-site video", "effort": "1-2h"},
    {"severity": "low", "id": "geo-llms-crawl", "title": "llms.txt missing FAQ/ordering/social links; intermittent connection resets; duplicate catalog URLs", "effort": "1h + host ticket"}
  ]
}
```
