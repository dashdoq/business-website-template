# SEO-audit amiradecocarpets.be

**Datum:** 21 november 2026
**Type zaak:** lokale winkel met webshop (tapijten, vloerkleden en kunstgras), Westremstraat 59, 9230 Wetteren, op het Proxi-platform
**SEO-gezondheidsscore: 45/100**

De PDF-versie van dit rapport staat in `SEO-auditrapport-amiradecocarpets.be.pdf`. De gedetailleerde bevindingen per onderdeel (met bewijs-URL's) staan in `findings/`; schermafbeeldingen in `screenshots/`.

## Scores

| Categorie | Score | Gewicht |
|---|---|---|
| Technische SEO | 66 | 22% |
| Contentkwaliteit | 32 | 23% |
| On-page SEO | 35 | 20% |
| Gestructureerde data (schema) | 52 | 10% |
| Prestaties (Core Web Vitals) | 38 | 10% |
| AI-zoekgereedheid | 44 | 10% |
| Afbeeldingen | 48 | 5% |
| **Gewogen totaal** | **45** | |
| Lokale SEO (aanvullend) | 44 | niet gewogen |
| Webshop (aanvullend) | 36 | niet gewogen |
| Zoekintentie / SXO (aanvullend) | 39 | niet gewogen |

## Samenvatting

De site is technisch bereikbaar en indexeerbaar: robots.txt laat zoekmachines en AI-crawlers toe, de sitemap is correct en de inhoud is zonder JavaScript leesbaar. De grootste problemen zitten in de **inhoud** en de **webshop**: productpagina's hebben geen tekst, veel producten tonen geen prijs, de pagina over bestellen en levering is leeg, en kunstgras en Marokkaanse vintage sluiten niet aan op wat zoekers verwachten. Daarnaast is de site traag op mobiel en zijn er enkele template-fouten die alleen Proxi kan oplossen.

### Vijf kritieke problemen

1. **Productpagina's zonder inhoud.** Alle 69 productpagina's hebben geen beschrijving en geen meta-description; titels zijn enkel de productnaam ("MALAGHA"). 27 producten tonen geen prijs.
2. **Lege pagina "Bestellen en betalen".** Levering, betaling, afhalen en retour staan alleen in juridische taal in de algemene voorwaarden.
3. **Template-fouten.** Op bijna elke pagina staan links naar een letterlijke `{url}` (404). Categorieën bestaan onder twee URL-patronen en `/nl/kunstgras-18` verwijst als canonical naar de tapijtencategorie.
4. **Traag op mobiel.** LCP 4,7 s en TBT 650 ms (labmeting) door 22 blokkerende stylesheets, 38 scripts, dubbel geladen jQuery en GSAP, en HTML zonder caching.
5. **Zoekintentie gemist.** Kunstgras heeft geen producten, prijzen of info over plaatsing; de categorie "Marrokaanse vintage" is leeg maar staat in het menu en de sitemap.

### Vijf snelle verbeteringen

1. Eén correcte H1 op de homepage: "Tapijten en kunstgras in Wetteren".
2. Nieuwe titels en meta-descriptions voor de homepage en 10 kernpagina's (zie hieronder).
3. HomeGoodsStore-JSON-LD op de homepage (code in `findings/schema.md`).
4. Lege vintagecategorie verbergen of vullen en de spelling corrigeren naar "Marokkaanse".
5. Openingsuren volledig tonen (met "woensdag gesloten") en een gewone link "Routebeschrijving" naast de kaart.

## Technische SEO (66/100)

**Goed:** geldige sitemap met 78 indexeerbare URL's, correcte 404's, HTTPS met HSTS, server-side rendering.

| Ernst | Probleem | Oplossing |
|---|---|---|
| Hoog | Links naar `/{url}`, `/nl/catalog-14/{url}`, `/nl/nl/{url}` op bijna elke pagina geven 404 | Melden bij Proxi-support |
| Hoog | Menu linkt naar `/nl/dekens`, `/nl/lopers` … terwijl `/nl/catalog-14/...` canoniek is; `/nl/nl/online-shop` geeft 200; `/nl/kunstgras-18` → canonical tapijten | Interne links naar canonieke URL's, dubbele paden 301, canonical kunstgras-18 corrigeren |
| Gemiddeld | `https://amiradecocarpets.be` → `http://www` → `https://www` (2 stappen) | Eén 301 naar `https://www.` |
| Gemiddeld | CSP staat alles toe, HSTS zonder includeSubDomains, HTML `no-store`, af en toe verbroken verbindingen | Bij Proxi navragen |
| Laag | Disallow voor wishlist/account staat alleen bij AhrefsBot | Ook onder `User-agent: *` zetten |
| Laag | Geen IndexNow | Activeren of Bing Webmaster Tools koppelen |

## Contentkwaliteit (32/100)

Echte hoofdinhoud (zonder het verborgen cookievenster): ca. 300 woorden op de homepage, 250-300 op landingspagina's, ca. 90 op "Over ons" en 0 op productpagina's en "Bestellen en betalen".

| Ernst | Probleem |
|---|---|
| Kritiek | Productpagina's zonder beschrijving (materiaal, maten, onderhoud) |
| Kritiek | "Bestellen en betalen" leeg |
| Hoog | "Over ons" te dun: wie zit achter de winkel? |
| Hoog | Algemene, uitwisselbare teksten en onbewezen claims ("tot 70% goedkoper") |
| Hoog | Geen veelgestelde vragen (8 voorbeeldvragen in `findings/geo.md`) |
| Gemiddeld | Wisseling tussen "je" en "u"; "Marrokaanse" fout gespeld; 3 lege categorieën geïndexeerd |
| Gemiddeld | Kleurvarianten (HARMONY x4, TUNIS x3, MALAGHA 2226-2233) zijn 93% identiek |

## On-page SEO (35/100)

- 83 van 102 URL's zonder meta-description.
- Producttitels zijn alleen de naam in hoofdletters.
- Homepage heeft drie H1's (één leeg, twee dubbel met `||`-animatiecode); de zichtbare hero-kop is geen H1.
- Dubbele titels: "Tapijt bestellen | Amira Deco-Carpets" (4x), "Online shop" (4x); `/nl/tapijten-2` en `/nl/catalog-14/tapijten` concurreren.
- De kunstgraslink op `/nl/kunstgras-3` leidt naar tapijten; producttegels linken alleen via de afbeelding.

### Voorgestelde titels en meta-descriptions

Feiten gemarkeerd met [controleren] eerst nakijken.

| URL | Titel | Meta-description |
|---|---|---|
| / | Tapijten en kunstgras in Wetteren \| Amira Deco-Carpets | Tapijtenwinkel in Wetteren met vloerkleden, lopers en kunstgras aan outletprijzen. Kom langs in de Westremstraat of bestel online met levering aan huis. |
| /nl/tapijten-2 | Tapijten in Wetteren, ook op maat \| Amira Deco-Carpets | Vloerkleden uit België en Duitsland: lopers, kindertapijten, wollen en buitentapijten, ook op maat. Bekijk ze in onze winkel in Wetteren of bestel online. |
| /nl/catalog-14/tapijten | Tapijten online kopen \| Webshop Amira Deco-Carpets | Bestel je vloerkleed online: moderne, vintage en ronde tapijten in alle maten, vanaf € 15. Afhalen in Wetteren of levering aan huis. |
| /nl/kunstgras-3 | Kunstgras in Wetteren, 2 en 3 cm dik \| Amira Deco-Carpets | UV-bestendig kunstgras van 2 of 3 cm voor tuin, terras en speelhoek. Kom het voelen in onze winkel in Wetteren of vraag advies en een prijs op maat. |
| /nl/vloerkleden | Galerij: onze winkel en vloerkleden \| Amira Deco-Carpets | Foto's van onze tapijtenwinkel in Wetteren en een greep uit onze vloerkleden, sierkussens en dekens. Kom de collectie in het echt bekijken en voelen. |
| /nl/decoratiewinkel | Contact en openingsuren \| Amira Deco-Carpets Wetteren | Westremstraat 59, 9230 Wetteren. Open ma, di en do t/m zo van 11u tot 19u, woensdag gesloten [controleren]. Bel 0468 30 16 83 of mail info@amiradecocarpets.be. |
| /nl/amira-deco-carpets | Over ons \| Amira Deco-Carpets, tapijtenwinkel in Wetteren | Maak kennis met Amira Deco-Carpets in Wetteren: tapijten, woontextiel en kunstgras met persoonlijk advies en eerlijke prijzen. Kom langs of shop online. |
| /nl/bestellen-en-betalen | Bestellen, levering en betalen \| Amira Deco-Carpets | Zo bestel je bij Amira Deco-Carpets: betaalmethodes, leveringskosten en -termijnen, afhalen in Wetteren en retourneren binnen 14 dagen. |
| /nl/catalog-14/lopers | Lopers voor gang en hal \| Amira Deco-Carpets | Jute en geweven lopers voor gang, hal en keuken, voor binnen en buiten, vanaf € 20. Bestel online of kom ze bekijken in onze winkel in Wetteren. |
| /nl/catalog-14/buitenkleed-indoor-amp-outdoor-stock | Buitenkleden voor terras en tuin \| Amira Deco-Carpets | Weerbestendige indoor- en outdoorkleden van 160x230 tot 240x305 cm, vanaf € 49. Ideaal voor terras, balkon of veranda. Afhalen in Wetteren mogelijk. |
| /nl/catalog-14/laatste-stock | Laatste stock: tapijten in solden \| Amira Deco-Carpets | Laatste stuks aan scherpe prijzen: vloerkleden, buitenkleden en ronde tapijten zolang de voorraad strekt. Bestel online of haal af in Wetteren. |

**Sjabloon voor producten**
- Titel: `{Modelnaam} {producttype} {kleur} | Amira Deco-Carpets`, bv. "Harmony vloerkleed grijs | Amira Deco-Carpets".
- Meta-description: `{Modelnaam} {producttype} in {kleur(en)}, van {kleinste maat} tot {grootste maat} cm, vanaf € {prijs}. {materiaal/onderhoud}. Bestel online of kom het voelen in onze winkel in Wetteren.`
- H1: modelnaam, producttype en kleur, zonder prijs.

## Gestructureerde data (52/100)

JSON-LD staat op 97 van 100 pagina's, maar niet op de homepage. Product-markup is onvolledig: 69 van 205 blokken zonder prijs, `brand` leeg in alle blokken, `description` leeg in 190, en 2-3 dubbele blokken per pagina. Geen verzend- of retourgegevens. LocalBusiness staat alleen op 8 infopagina's, zonder geo of logo. **Kant-en-klare homepage-code:** `findings/schema.md` (logo, geo, kaartlink en prijsklasse zijn nog in te vullen).

## Prestaties (38/100)

Labmetingen, geen velddata (PageSpeed Insights gaf een quotumfout zonder API-sleutel):

| Pagina | LCP | CLS | TBT |
|---|---|---|---|
| Homepage mobiel | 4,7 s | 0,06 | 650 ms |
| Homepage desktop | 2,9 s | 0,01 | 271 ms |
| Categoriepagina's | — | 0,27-1,46* | 240-626 ms |

\*Deels verstoord door de meetomgeving.

Oorzaken: HTML met `no-store` (TTFB 0,6-0,86 s), 22 blokkerende stylesheets en 38 scripts, jQuery 1.7.2 én 1.9.1, GSAP 2x, 3 Font Awesome-bestanden, een hero van 951 KB zonder srcset, en productrasters zonder vaste afmetingen.

## AI-zoekgereedheid (44/100)

AI-crawlers zijn toegelaten en er is een `llms.txt`. Maar er staan weinig citeerbare feiten op de site, er zijn geen FAQ's, en buiten de site zijn er nauwelijks vermeldingen of reviews. Voor "kunstgras Wetteren" verschijnt de winkel niet. Formulieren zijn moeilijk bruikbaar voor AI-agents (agent-UX 48/100: velden zonder label, klikbare div's).

## Afbeeldingen (48/100)

Ca. 34% van de afbeeldingen op productpagina's zonder alt-tekst; miniaturen van ca. 125 KB; geen srcset; placeholders bij 4 van de eerste 12 tapijten; geen og:image op productpagina's.

## Lokale SEO (44/100, aanvullend)

NAP is consistent op de site (Westremstraat 59, 9230 Wetteren; 0468 30 16 83 en 0483 02 88 68). Gouden Gids vermeldt "Amira Deco" in "Westrem (Wetteren)". Geen reviews op de site, alleen een link naar een Facebook-groep, de kaart verschijnt pas na cookie-toestemming en woensdag ontbreekt in de openingsuren. Het Google-bedrijfsprofiel kon niet gecontroleerd worden.

## Webshop en zoekintentie (aanvullend)

- **Webshop (36/100):** 27 producten zonder prijs, alles "op voorraad" (ook "Laatste stock"), één maat van MALAGHA niet bestelbaar, geen merk/GTIN/verzendgegevens voor Google Shopping, categoriepaginering alleen via JavaScript.
- **Zoekintentie (39/100):** alleen de tapijten-shoplijst past bij de zoekintentie. Kunstgras (geen prijzen of plaatsing), Marokkaanse vintage (leeg), "tapijt op maat" (geen pagina) en het bestelproces scoren zwak. Persona-scores: vintagezoeker 10, tuineigenaar 24, online koper 43, lokale bezoeker 52.

## Visueel en mobiel

De cookiebanner bedekt bij het eerste bezoek ca. 90% van het mobiele scherm. De CTA "Ontdek ons assortiment!" is een dunne tekstlink op een drukke foto. Ca. 45 tikdoelen zijn kleiner dan 44 px. Geen horizontaal scrollen en weinig verspringing op de homepage.

## Backlinks

Het domein komt niet voor in de Common Crawl-linkgrafiek, wat wijst op weinig externe links. Detaildata (verwijzende domeinen, ankerteksten) was niet beschikbaar zonder Moz, Search Console of Bing Webmaster Tools.

## Methode en beperkingen

- Eigen crawl van 216 pagina's, waaronder alle 78 sitemap-URL's (maximaal 4 verzoeken tegelijk, 1 s pauze).
- Labmetingen met Chromium/Playwright; geen CrUX-velddata, Search Console, Analytics, Moz of DataForSEO.
- Zoekresultaten via een algemene webindex, niet google.be.
- Nog te bevestigen door de zaak: is de winkel op woensdag gesloten en op zondag open?
