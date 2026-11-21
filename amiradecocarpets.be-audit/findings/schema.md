# Structured Data Audit: amiradecocarpets.be (2026-11-21)

## Current implementation (97/100 OK pages have JSON-LD; JSON-LD only, no Microdata/RDFa checked)
| Page type | Pages | Blocks |
|---|---|---|
| Homepage `/` | 1 (+4 other no-schema) | NONE |
| Category (`/nl/catalog-14/tapijten`) | 22 | 2x BreadcrumbList (duplicate) |
| Product (`/nl/catalog-14/tapijten/malagha`) | 68 | 3x Product (205 Product blocks total) + 2x BreadcrumbList |
| Info pages (tapijten-2, kunstgras-3, vloerkleden, amira-deco-carpets, decoratiewinkel, bestellen-en-betalen, algemene-voorwaarden, +1 gallery URL) | 8 | LocalBusiness |
| Review form `/catalog/c/review/form/ca/14/ar/605` | 1 | Product (should be noindex/ no schema) |
No truncated/invalid JSON blocks found. @context is https://schema.org everywhere.

Fully fetched /nl/catalog-14/tapijten/malagha (5 blocks): Product x3 (block 1 offer has NO price/priceCurrency; blocks 3-4 identical with price "35" EUR InStock), BreadcrumbList x2 identical.

## Validation errors
**High**
1. Homepage has no schema; the LocalBusiness block lives on 8 inner pages (@id "https://www.amiradecocarpets.be" is the homepage URL, but it is not emitted there). Entity is not declared where Google expects it.
2. Product pages emit 3 Product blocks for one product; 1 of 3 (69 of 205 blocks) has Offer without price/priceCurrency, which is a Google Merchant/Product-snippet error ("Missing field price"). Duplicate entities risk conflicting data.
3. Product `brand` is `{"slogan": ""}`: no @type, no name = invalid object; all 205 blocks.
4. Product `description` empty in 190/205 blocks.
**Medium**
5. Offer lacks `itemCondition`, `priceValidUntil`, `shippingDetails` (OfferShippingDetails), `hasMerchantReturnPolicy`; Product lacks `sku`/`mpn`/`gtin`, `aggregateRating`/`review` (0 found). Shop ships via Mondial Relay (see cookie list) so shippingDetails is warranted; /nl/bestellen-en-betalen holds the terms.
6. `price` is a string ("35"); acceptable but number-like string preferred without ambiguity; for rugs sold by size, price likely varies by variant (consider AggregateOffer/ProductGroup with variants). Verify 35 is the actual/min price.
7. Breadcrumb item URLs (`/nl/malagha`, `/nl/tapijten`) differ from the crawled URLs (`/nl/catalog-14/tapijten/malagha`); and Offer url `/nl/malagha`. Confirm canonical target matches; mismatched URLs dilute signals. Breadcrumb uses `item` as object with @id (valid, but string URL form is the documented one). Duplicate BreadcrumbList on every product/category page.
8. LocalBusiness: generic type (use HomeGoodsStore), no `geo`, no `logo`, `priceRange`, `hasMap`, second phone missing; `openingHours` and `openingHoursSpecification` duplicate each other; Wednesday omitted (site shows closed days hidden; ok but should be stated); single sameAs (a Facebook *group* URL, not a page). `image` is photo-microdata.jpg (verify exists).
**Low**
9. Review-form URL carries a Product block; no WebSite, Organization/logo, WebPage/CollectionPage, SearchAction anywhere.
10. No FAQPage found (none recommended; no Google SERP feature since May 2026).

## Missing opportunities
- Homepage: HomeGoodsStore + WebSite + Organization (below).
- Dedupe Product/BreadcrumbList emission in Proxi template; fix brand (`{"@type":"Brand","name":"..."}`), supply description, sku.
- Offer: shippingDetails + hasMerchantReturnPolicy (fill from /nl/bestellen-en-betalen; do not guess terms).
- Category pages: CollectionPage/ItemList optional.
- Product reviews: only add AggregateRating if real, visible reviews exist.

## Homepage JSON-LD (facts from footer + existing LocalBusiness; PLACEHOLDERS to fill before use)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HomeGoodsStore",
      "@id": "https://www.amiradecocarpets.be/#store",
      "name": "Amira Deco-Carpets",
      "url": "https://www.amiradecocarpets.be/",
      "description": "Amira Deco-Carpets is gespecialiseerd in tapijten in Wetteren. Ontdek ons unieke aanbod van stijlvolle en duurzame tapijten voor elk interieur.",
      "image": "https://www.amiradecocarpets.be/media/images/Amira-Deco-Carpets-social.jpg",
      "logo": "LOGO_URL_PLACEHOLDER",
      "telephone": "+32468301683",
      "email": "info@amiradecocarpets.be",
      "vatID": "BE1027627601",
      "priceRange": "PRICE_RANGE_PLACEHOLDER",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Westremstraat 59",
        "postalCode": "9230",
        "addressLocality": "Wetteren",
        "addressRegion": "Oost-Vlaanderen",
        "addressCountry": "BE"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": "LATITUDE_PLACEHOLDER", "longitude": "LONGITUDE_PLACEHOLDER" },
      "hasMap": "GOOGLE_MAPS_URL_PLACEHOLDER",
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Thursday","Friday","Saturday","Sunday"], "opens": "11:00", "closes": "19:00" }
      ],
      "contactPoint": [
        { "@type": "ContactPoint", "contactType": "customer service", "telephone": "+32468301683", "availableLanguage": "nl" },
        { "@type": "ContactPoint", "contactType": "customer service", "telephone": "+32483028868", "availableLanguage": "nl" }
      ],
      "sameAs": ["https://www.facebook.com/groups/770881053657480?locale=nl_BE"],
      "parentOrganization": { "@id": "https://www.amiradecocarpets.be/#org" }
    },
    {
      "@type": "Organization",
      "@id": "https://www.amiradecocarpets.be/#org",
      "name": "Amira Deco-Carpets",
      "url": "https://www.amiradecocarpets.be/",
      "logo": "LOGO_URL_PLACEHOLDER",
      "email": "info@amiradecocarpets.be",
      "telephone": "+32468301683",
      "vatID": "BE1027627601",
      "sameAs": ["https://www.facebook.com/groups/770881053657480?locale=nl_BE"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.amiradecocarpets.be/#website",
      "url": "https://www.amiradecocarpets.be/",
      "name": "Amira Deco-Carpets",
      "inLanguage": "nl-BE",
      "publisher": { "@id": "https://www.amiradecocarpets.be/#org" }
    }
  ]
}
```
Notes: Wednesday is omitted because the footer hides closed days (data-closedaysnotshow=1); confirm closed. Second phone 0483 02 88 68 is in the footer. Remove the SearchAction (no verified site search). Replace the inner-page LocalBusiness @id with `#store` and type HomeGoodsStore.

## Schema score: 52/100
(Product/Breadcrumb coverage is broad, but invalid brand, duplicate/priceless Offers, no homepage entity, no shipping/return data.)
