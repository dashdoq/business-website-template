# Design: woolup.shop

Editorial luxe in een vlakke, moderne webshop-opbouw, naar de referentie van de klant: lichte grijze tegels, dunne lichte randen, zacht afgeronde hoeken en bijna geen schaduw. Zwart komt rechtstreeks uit het logo. Ecru is de kleur van ongeverfde wol. Loden, het groene vilt van gevolde wol, is het enige accent.

## Kleuren
De tokens staan in `src/app/globals.css` (`@theme`).

| Token | Waarde | Gebruik |
| --- | --- | --- |
| `ink` | `#000000` | Tekst, knoppen, footer, logo |
| `paper` | `#FFFFFF` | Paginagrond, productkaarten |
| `ecru` | `#F2EEE7` | Hero, nieuwsbriefblok, meldingen |
| `tile` | `#F5F5F3` | Achtergrond van productfoto's, sorteerbalk, waardenblok |
| `line` | `#E8E6E1` | Randen en scheidingslijnen, verkochte steken in de voorraadmeter |
| `stone` | `#66635D` | Secundaire tekst (contrast ≥ 5:1 op wit) |
| `loden` | `#45513B` | Alleen de badges "Nieuw" en "Laatste paren" |

Productkleuren (naturel, loden, oker en zo verder) staan bij de producten in `src/content/products.ts`. Ze worden alleen gebruikt voor swatches en de placeholder-sokken.

## Typografie
- **Koppen:** Sofia Sans Extra Condensed (variabel), gewicht 750–800, op een rustige schaal. Klassen: `display-xl`, `display-lg`, `display-md`
- **Productnamen, knoppen, navigatie en badges:** Sofia Sans in kleine hoofdletters (12–13px), halfvet, met wat extra spatiëring (`caps`), zoals in de referentie-webshop
- **Titels van filterpanelen en de winkelmand:** halfvet, gewone schrijfwijze
- **Lopende tekst en prijzen:** Sofia Sans (variabel), 17px basis. Prijzen en aantallen gebruiken tabular numbers

Beide fonts komen uit `@fontsource-variable` en worden met de site meegeleverd, dus er is geen externe fontdienst nodig.

## Opbouw
- **Hero en blokken:** afgeronde vlakken binnen de paginabreedte, niet van rand tot rand. De hero heeft een zwart pillabel "Drop Nº 01"; het promoblok is een witte kaart met een zachte schaduw, zoals "Product of the Year" in de referentie
- **Header:**
  - een zwarte USP-balk
  - logo, zoekbalk, navigatie (Home, Shop, Over ons, Contact) en de winkelmand met teller
  - op mobiel een hamburgermenu
- **Productkaart:**
  - een vierkante tegel met badges: korting linksboven; Nieuw, Laatste paren of Uitverkocht rechtsboven
  - de naam in hoofdletters, de prijs (met doorgestreepte oude prijs) en kleurstipjes
  - een omlijnde knop "In winkelmand", die eerst om een maat vraagt
- **Carrousel:** horizontaal scrollen met snap; ronde pijlknoppen op de rand op desktop
- **Shop:**
  - zijbalk met zoeken, categorieën (met aantallen), kleur, maat en prijs (min/max plus snelkeuzes)
  - een balk met het aantal resultaten, "Toon" en "Sorteer op"
  - filterchips en paginering
  - alle filters staan in de URL
- **Hoeken:** de standaardradii van Tailwind:
  - 4px voor badges
  - 6px voor knoppen, velden, maatknoppen en paginering
  - 8px voor productkaarten, filterpanelen en de sorteerbalk
  - 12–16px voor de hero, het promoblok, het waardenblok en de nieuwsbrief
  - rond voor swatches, de zoekbalk, filterchips en carrouselpijlen
- **Schaduw:** alleen een heel zachte schaduw onder het promoblok, de carrouselpijlen en het prijslabel in de hero. Al het andere is vlak, met lichte randen

## Het ene opvallende element
De **voorraadmeter in breisteken** (`DropMeter`): een rij gebreide V-steken. Donkere steken zijn paren die nog beschikbaar zijn, lichte steken zijn al verkocht. Hij staat in de hero (de hele drop), in het promoblok en op de productpagina. Verder blijft alles rustig.

## Regels
- Hoofdletters alleen voor productnamen, knoppen, navigatie en badges; koppen in zinsvorm
- Teksten staan in `src/content/`, niet in componenten
- Placeholders tonen de woolup-sok in de productkleur, met "Foto volgt"
- Toegankelijkheid:
  - zichtbare focus-ring
  - toetsenbordbediening van menu, lades, tabs en carrousel
  - Esc sluit lades
  - `prefers-reduced-motion` wordt gerespecteerd
- Beweging alleen als reactie op een handeling: lade in- en uitschuiven, een maatrij die verschijnt
