# INGBELG — Node.js web app

Latest export: 15 October 2026 · version 1.0.9. Includes the Dutch/French interface, fixed desktop contact widgets, responsive laptop layout, and vertical sound/motion controls beneath the sidebar page numbers. Includes the mobile gallery and compact fun facts. The single ZotteTools button opens three calculators with centered tabs and individual URLs.

## Deploy the ZIP on Hostinger

In Websites, create a Web App and choose **Upload your website files**. Upload the complete ZIP.

Use these settings:

| Setting | Value |
| --- | --- |
| Framework | Vite / React |
| Node.js | 24.x |
| Root directory | `.` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

For a running Node.js process, choose the **Other** application type and use the same build settings, with **Entry file** `server.mjs` and **Start command** `npm start`. The server listens on `0.0.0.0` and the host-provided `PORT` (3000 locally). The entry file is at the project root.

No API keys are required. For public deployment, set the build environment variable `SITE_URL` to your final HTTPS domain, without a path, and rebuild. This updates canonical links, language alternates, social URLs, structured data and sitemap URLs together. Without this variable, the build uses the current Sites address. The ZIP contains the project source and a prebuilt `dist` folder. Do not upload only `dist` when using Hostinger's project upload workflow.

Official setup guide: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

## Run the supplied production build

With Node.js 24 or newer installed, extract the ZIP and run:

```sh
node server.mjs
```

Open http://localhost:3000. The supplied build runs without installing packages on Node.js 24 or newer.

## Edit and rebuild

```sh
npm ci
npm run check
npm run build
npm test
npm start
```

For local development: `npm run dev`.

## Files

- `app/experience.tsx`: interface, forms, gallery and interactions.
- `app/i18n.tsx`: Dutch and French translations; Dutch is the default.
- `app/world.tsx`: Three.js / React Three Fiber scene and responsive camera.
- `app/globals.css`: responsive theme and floating contact widgets.
- `app/project-data.ts`: business details, gallery data and Renculator budget allowances.
- `app/zotte-tools.tsx`: the shared NL/FR calculator popup.
- `app/premium-calculation.ts`: verified 2026 Flemish premium calculations and official source links.
- `app/workforce-calculation.ts`: editable workforce planning assumptions.
- `app/tool-routing.ts` and `app/use-tool-navigation.ts`: calculator URLs and Back/Forward navigation.
- `tests/`: calculation boundary checks and production server route checks.
- `public/images/`: original company logo and project photos.
- `server.mjs`: dependency-free Node.js production server.
- `dist/`: ready-built production app.

## Existing functionality

The contact form prepares an email draft in the visitor's mail application. The visitor reviews and sends that draft. Phone, email and WhatsApp links use the configured company contact details. This export does not add email delivery or a database.

Reviews and ratings are the existing sourced snapshot. The estimator provides illustrative budget ranges, excluding VAT. It is not an INGBELG quotation.

The interface uses stable Dutch and French URLs; French pages begin with `/fr`. Animation can be paused or reduced. Browsers without WebGL2 use the photo fallback. The popup fits the available viewport height and scrolls internally; the tool selector stays at the top. This update passed TypeScript checks, production builds, calculation boundary tests and direct-route server checks. Browser visual QA was not available for this update.

## ZotteTools and individual URLs

Only one calculator is visible at a time. Switching tabs preserves values during the current page session. The copy-link button shares the selected tool without any form data. Browser Back and Forward follow tool selections. Refreshing a direct URL opens that tool.

| Tool | Purpose | URL path |
| --- | --- | --- |
| Renculator | Bouwcalculator: illustrative construction budget | `/zottetools/renculator` |
| Premculator | Flemish renovation premium estimate | `/zottetools/premculator` |
| Wijculator | Labour hours, minimum team for a deadline, extra-worker comparison | `/zottetools/wijculator` |

Use these paths after your own domain. The included Node server serves all three paths directly. `npm run build` creates complete pre-rendered HTML for all 14 Dutch/French pages, including `dist/zottetools/<tool>/index.html` and their `/fr` equivalents, for static hosts that serve directory index files. Deploy at the domain root; assets use root-relative paths. On a static host without directory-index routing, map each known URL to its matching `<path>/index.html`; preserve the individual HTML files and return 404 for unknown paths. Do not rewrite every page to the home page, because each page has its own language, metadata and content.

The calculations run locally in the browser. Income and calculator values are not stored in localStorage, sent to a server, or included in a shared URL. The URL identifies the language. Cookie choices are stored for at most 180 days; optional comfort settings are saved only after consent. A user can explicitly add a result summary to the existing contact form; income is excluded from the Premculator summary. The email is sent only through the visitor's mail application after review.

## Premculator scope and upkeep

The built-in model covers **Mijn VerbouwPremie for owner-occupiers in Flanders**, for applications from **1 March through 31 December 2026**. It covers qualifying roof, external-wall, ground-floor/basement-ceiling insulation work and new window frames/external doors. Common apartment parts, glass-only replacement, heat pumps, other regional/local grants and other applicant types are outside this model. Out-of-period applications and other regions do not produce a numeric estimate.

The visitor enters qualifying net invoice costs, income, household/dependants and any relevant additional property ownership, and confirms five eligibility assumptions. Each work category has a €1,000 net minimum. Income categories 3 and 4 receive respectively 35% and 50% of capped costs: roof €11,500, wall €10,000, floor €3,000, windows/doors €10,500. Income categories 1 and 2 receive zero for these four categories in this period. The optional qualifying roof asbestos bonus is €8/m², with the roof total capped at 50% of the eligible roof invoice. These are conditional estimates, not approvals.

Official sources, checked 15 October 2026:

- [Owner-occupier rules and income thresholds](https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/wie-in-aanmerking-komt-voor-mijn-verbouwpremie/mijn-verbouwpremie-voor-eigenaar-bewoner)
- [Roof](https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-dak)
- [External wall](https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-buitenmuur)
- [Floor](https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-vloer)
- [Windows and doors](https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-ramen-en-deuren)
- [Official Flemish simulator](https://apps.energiesparen.be/simulator-mijnverbouwpremie)

Before extending the application-date window, verify the current official rules and update both the calculation module and its tests. Do not simply remove the date guard.

## Wijculator assumptions

The initial productivity rates and base crew sizes are editable planning assumptions, not INGBELG quotations, measured productivity, legal staffing requirements or guaranteed delivery dates.

- Labour hours = `(area × hours/m² × complexity + setup hours) × (1 + buffer/100)`.
- Workdays = `labour hours / hours per day × (sequential share + parallel share / team size)`.
- The minimum team is the smallest whole team, at least the chosen base size and at most 20, that meets the target workdays.
- Additional workers shorten only the parallel share. The comparison shows the chosen team versus the base team. Impossible deadlines are explicitly flagged.

The default sequential share is 10%, and the default buffer is 15%; both can be changed. Drying time, weather, site access, deliveries, trades coordination and safety constraints need a separate professional assessment.

## SEO and public launch

The build includes unique titles and descriptions, concise keyword tags, canonical URLs, reciprocal `nl-BE`/`fr-BE`/`x-default` links, Open Graph and Twitter sharing cards, `robots.txt`, an XML sitemap, a web manifest, and JSON-LD for the business, website, pages, breadcrumbs and calculator web applications. No ratings, opening hours or accreditations were invented. Local service copy, internal calculator links and a visible FAQ support discovery and project enquiries.

Dutch pages use `/`, `/zottetools/...`, `/privacy`, `/cookies` and `/accessibility`. French equivalents use `/fr`, `/fr/zottetools/...`, `/fr/privacy`, `/fr/cookies` and `/fr/accessibility`.

For your own domain, configure `SITE_URL` in the hosting build environment (for example, your final `https://www.your-domain.be` origin), then run `npm run build`. The current Sites publication is access-controlled; search engines cannot index content behind that sign-in. Public hosting is required for organic discovery. This export does not change the Sites sharing settings.

After launching on the final public domain:

1. Verify the domain in Google Search Console and submit `https://YOUR_DOMAIN/sitemap.xml`.
2. Inspect the homepage and one URL per language with Search Console. Validate structured data with Google's Rich Results Test and check sharing previews.
3. Keep your Google Business Profile website/contact details consistent, and link campaigns to the appropriate language/tool URL. UTM campaign parameters can be used on incoming links; they are excluded from canonical URLs.

No analytics, ad pixels, marketing accounts, advertising spend or outbound campaigns are configured. If adding a provider later, first document its identity, purpose and lifetime and add genuine opt-in controls that block every non-essential request until consent and handle withdrawal. Current consent covers only the implemented comfort preferences and must not be repurposed as consent for future trackers.

## Accessibility and cookie controls

Accessibility improvements include a main-content skip link, visible focus indicators, accessible landmarks and form labels, descriptive image alternatives, keyboard-operable tabs/dialogs, larger control targets, required-field guidance, reduced-motion and pause controls, a high-contrast setting and zoom-friendly layouts. Text, contact links and project summaries remain available alongside the decorative 3D scene. Keyboard, screen-reader and visual browser auditing remains a launch validation step; no WCAG certification is claimed.

The cookie banner provides equal-weight reject/accept buttons and preference settings. Essential consent storage expires after 180 days. Optional storage remembers reduced motion, animation pause and contrast only with consent. Withdrawal deletes saved comfort preferences and prevents subsequent optional writes, including when the browser cannot persist the new decision. Cookie settings remain accessible in the footer. The app uses no analytics or advertising trackers; separate hosting/authentication services may use necessary storage. Privacy/cookie pages describe the app's actual behavior and provide the company contact for privacy requests.

Checks completed for this build: TypeScript validation; client and server-side pre-render builds; all 14 production routes, metadata/language/canonical tests; consent expiry, rejection and blocked-storage tests; and the existing calculator tests. Browser visual and assistive-technology QA was unavailable in this editing environment.

Primary implementation references:

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google language alternate guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [W3C focus visibility guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [Belgian Data Protection Authority: cookies and similar technologies](https://www.autoriteprotectiondonnees.be/cookies-et-autres-traceurs)
