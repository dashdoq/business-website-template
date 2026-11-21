# Actieplan amiradecocarpets.be

Gerangschikt van kritiek naar laag. "Proxi" betekent dat de aanpassing via de support van het Proxi-platform moet gebeuren; de rest kan de zaak zelf in het beheer van de site doen.

## Kritiek (week 1)

| # | Actie | Wie |
|---|---|---|
| 1 | Pagina "Bestellen en betalen" vullen: betaalmethodes, leveringskosten en -termijnen, afhalen in Wetteren, retour binnen 14 dagen (tekst in `findings/geo.md`) | Zaak |
| 2 | Prijzen en voorraad invullen voor de 27 producten zonder prijs; "Laatste stock" correct markeren; bestelflow testen (MALAGHA-maat) | Zaak |
| 3 | Categorie "Marrokaanse vintage" vullen of uit menu en sitemap halen; spelling "Marokkaanse" | Zaak |
| 4 | `{url}`-links (404) laten herstellen; canonical van `/nl/kunstgras-18` corrigeren | Proxi |
| 5 | Kunstgraspagina herwerken: soorten, prijs per m², plaatsing, offerteformulier | Zaak |
| 6 | Snelheid: dubbele jQuery/GSAP/Font Awesome verwijderen, scripts met `defer`, publieke caching van HTML | Proxi |

## Hoog (week 2-3)

| # | Actie | Wie |
|---|---|---|
| 7 | Homepage: één H1 "Tapijten en kunstgras in Wetteren"; HomeGoodsStore-JSON-LD plaatsen (`findings/schema.md`) | Zaak/Proxi |
| 8 | Titels en meta-descriptions voor homepage en 10 kernpagina's (zie `FULL-AUDIT-REPORT.md`) | Zaak |
| 9 | Productsjabloon voor titels en meta-descriptions toepassen | Zaak |
| 10 | Beschrijvingen (80-150 woorden) voor de 10 belangrijkste producten | Zaak |
| 11 | Menu en interne links naar canonieke `/nl/catalog-14/`-URL's; dubbele paden (`/nl/nl/...`) met 301 | Proxi |
| 12 | Product-markup: één blok per pagina met prijs, EUR, merk, beschrijving, juiste beschikbaarheid | Proxi |
| 13 | Google-bedrijfsprofiel claimen en invullen; Gouden Gids corrigeren naar "Amira Deco-Carpets", Wetteren | Zaak |
| 14 | Cookiebanner kleiner op mobiel; duidelijke CTA-knop en belknop in de hero | Proxi |
| 15 | Hero-afbeelding met srcset; eerste slide vast; vaste afmetingen voor productafbeeldingen | Proxi |
| 16 | Labels op formuliervelden en echte knoppen in winkelmandje, zoeken en login | Proxi |

## Gemiddeld (maand 2)

| # | Actie | Wie |
|---|---|---|
| 17 | "Over ons" uitbreiden: verhaal, mensen, foto's, herkomst van de tapijten | Zaak |
| 18 | FAQ-blokken op homepage en categorieën (maten, onderhoud, levering, kunstgras plaatsen) | Zaak |
| 19 | Pagina's "Tapijt op maat" en "Levering en plaatsing in Oost-Vlaanderen" | Zaak |
| 20 | Algemene teksten herschrijven met feiten; onbewezen claims schrappen; één aanspreekvorm | Zaak |
| 21 | Kleurvarianten samenvoegen tot één product met kleurkeuze; lege categorieën verbergen | Zaak |
| 22 | Openingsuren met "woensdag gesloten" en een link "Routebeschrijving" naast de kaart | Zaak |
| 23 | Reviews vragen na elke aankoop; officiële Facebook-pagina koppelen en dubbele pagina's opruimen | Zaak |
| 24 | Alt-teksten, echte miniaturen (20-30 KB), og:image per product | Zaak/Proxi |
| 25 | Redirect `https://amiradecocarpets.be` rechtstreeks naar `https://www.`; strengere CSP; HSTS includeSubDomains | Proxi |
| 26 | Crawlbare paginering op categoriepagina's; Google Merchant Center koppelen | Proxi |
| 27 | "Bedrijf" optioneel maken in het infoformulier | Proxi |

## Laag (backlog)

| # | Actie | Wie |
|---|---|---|
| 28 | Disallow-regels voor wishlist/account ook onder `User-agent: *` | Proxi |
| 29 | IndexNow activeren of Bing Webmaster Tools koppelen | Zaak/Proxi |
| 30 | Links vragen bij leveranciers, UNIZO, handelaarsvereniging en lokale pers (Wetteren/Gent) | Zaak |
| 31 | Overwegen AhrefsBot toe te laten voor betere linkdata | Zaak |

## Opvolging

- Google Search Console en Bing Webmaster Tools koppelen en maandelijks bekijken.
- Na de technische aanpassingen opnieuw meten met PageSpeed Insights.
- Elk kwartaal een nieuwe SEO-controle.
