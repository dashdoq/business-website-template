# Design: woolup.shop

Editorial luxe, gegoten in een klassieke webshop-opbouw. Zwart komt rechtstreeks uit het logo. Ecru is de kleur van ongeverfde wol. Loden, het groene vilt van gevolde wol, is het enige accent.

## Kleuren
De tokens staan in `src/app/globals.css` (`@theme`).

| Token | Waarde | Gebruik |
| --- | --- | --- |
| `ink` | `#000000` | Tekst, knoppen, footer, logo |
| `paper` | `#FFFFFF` | Paginagrond, productkaarten |
| `ecru` | `#EEE8DC` | Hero, promoblok, meldingen |
| `tile` | `#F4F2EE` | Achtergrond van productfoto's, sorteerbalk |
| `line` | `#DCD6CB` | Randen en scheidingslijnen, verkochte steken in de voorraadmeter |
| `stone` | `#67615A` | Secundaire tekst (contrast ≥ 5:1 op wit) |
| `loden` | `#45513B` | Alleen de badges "Nieuw" en "Laatste paren" |

Productkleuren (naturel, loden, oker en zo verder) staan bij de producten in `src/content/products.ts`. Ze worden alleen gebruikt voor swatches en de placeholder-sokken.

## Typografie
- **Koppen:** Sofia Sans Extra Condensed (variabel), gewicht 750–800, strakke regelafstand. Klassen: `display-xl`, `display-lg`, `display-md`
- **Productnamen, knoppen en navigatie:** dezelfde condensed letter in hoofdletters met wat extra spatiëring (`caps`), zoals in de referentie-webshop
- **Lopende tekst en prijzen:** Sofia Sans (variabel), 17px basis. Prijzen en aantallen gebruiken tabular numbers

Beide fonts komen uit `@fontsource-variable` en worden met de site meegeleverd, dus er is geen externe fontdienst nodig.

## Opbouw
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
- **Hoeken:** 2px, of rond voor swatches, zoekveld en ronde knoppen. Geen zware schaduwen

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
