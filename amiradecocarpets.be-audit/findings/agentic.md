# Agent-readiness: amiradecocarpets.be (checked 2026-11-21)

Lighthouse Agentic Browsing: unavailable (PSI HTTP 429 daily quota, mobile and desktop; no API key). Not scored.
Agent-UX heuristic: 48/100, status complete (separate from Lighthouse). Rendered without Chromium sandbox (running as root).

## Access policy (robots.txt, fetched OK on retry)
- Training: allowed (User-agent * group; AI crawlers inherit it; only admin/stats/media-private/pdf paths disallowed)
- Search: allowed, same group
- User-triggered agents: allowed by robots; WAF/UA behavior NOT tested (--ua-matrix not authorized). Note: Vary: User-Agent header is present.
- AhrefsBot: fully disallowed. No Content-Signal line (draft, checked 2026-09-23) - optional.
- Sitemap declared.

## Findings
- High: 7 inputs without accessible label, 4 div-onclick widgets, 4 unnamed interactive nodes (a11y tree). Agents cannot reliably use search/login/cart. Fix: ask Proxi support/theme template to add label/aria-label to searchcatalog, pager and login inputs, and use button elements. Replaces 60 points of Agent-UX penalties.
- Medium: robots.txt and the first agentic_check fetch hit connection resets (intermittent). Agents may treat a failed robots fetch as disallow-all or retry. Fix: ask host/Proxi whether rate limiting or WAF resets; allowlist legit crawlers.
- Medium: Response sets PHPSESSID cookie even on robots.txt and sends cache-control no-store plus public (conflicting); CSP is fully permissive. Low agent impact; mention to platform.
- Low: llms.txt passes (200, text/plain, 3040 bytes, valid; llms-full.txt 404, optional). Content is Dutch with trailing truncated ellipses in descriptions; several catalog entries lack descriptions. Includes VAT/address/phone. Fix: add descriptions, shipping/returns link.
- Low: Server-rendered content OK (3091 words without JS); real 404s not confirmed (probe returned connection error).
- Opportunity (not defects): no Markdown delivery (no Vary: Accept, no .md), no WebMCP (6 forms, 0 annotated; draft W3C CG, checked 2026-09-23), no ai-catalog.json (404, ARD spec), /.well-known api-catalog/oauth/agent-card/ucp all 404 and not applicable. No JSON-LD on homepage (structured data helps agents reading products; hosted-platform setting or injected script).
- No Critical findings.
