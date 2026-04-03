# Phase 9: SEO + Social Surface - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the platform discoverable via Hebrew SEO, structured data, and AEO (Answer Engine Optimization). Create city landing pages for Tel Aviv and Kfar Saba. Embed Instagram feed on homepage. Add share buttons (WhatsApp, native share, copy link, Facebook/Instagram) on key pages. Cover all relevant acroyoga keywords in Israel in Hebrew.

</domain>

<decisions>
## Implementation Decisions

### City landing pages
- **Cities:** Tel Aviv and Kfar Saba only (per requirements)
- **Access:** Fully public — no login required, essential for SEO indexing
- **Content:** Hero with city name + CTA, upcoming jams in that city, member count/community stats, FAQ section, relevant skills display
- **URL structure:** Claude's discretion (pick SEO-optimal for Hebrew)

### Meta tags & structured data
- **OG image:** One branded AcroHavura image (1200x630) used everywhere
- **hreflang:** Hebrew + English on all pages
- **JSON-LD schemas:** Organization, Event (for jams), LocalBusiness (per city), FAQPage (on FAQ sections)
- **Hebrew keywords:** Claude researches the full Hebrew acroyoga keyword landscape in Israel using available skills — cover all relevant search terms

### AEO (Answer Engine Optimization)
- Target AI search engines (ChatGPT, Perplexity, etc.) with well-structured content
- FAQ sections should be written to directly answer common Hebrew acroyoga questions
- Structured data helps AI crawlers understand content

### Instagram embed
- **Account:** @acroshay on Instagram
- **Placement:** Homepage / landing page only
- **Layout:** Grid of recent posts (6-9 posts), 3x2 or 3x3
- **Style:** Match brutalist design aesthetic

### Share buttons
- **Pages with share:** Jam detail pages, city landing pages, quiz results page
- **Platforms:** WhatsApp, Native share (Web Share API), copy link, Facebook/Instagram
- **UI pattern:** Floating share button → bottom sheet with platform options
- **Share preview:** Use OG meta tags for rich previews in WhatsApp/social

### Claude's Discretion
- City page URL structure (SEO-optimal for Hebrew)
- Exact Hebrew keywords and meta descriptions
- Instagram embed implementation approach (API vs embed widget)
- Share button animation and positioning
- AEO content structure and FAQ question selection
- OG image design

</decisions>

<specifics>
## Specific Ideas

- Cover ALL relevant acroyoga keywords in Israel in Hebrew — not just generic terms but city-specific, role-specific (בייס, פלייר), and activity-specific (ג'אם אקרויוגה, סדנת אקרויוגה, etc.)
- FAQ sections should target "מה זה אקרויוגה" type questions that people actually search for
- Instagram account is @acroshay — embed their actual feed
- WhatsApp is the primary share channel in Israel — make it prominent

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-seo-social-surface*
*Context gathered: 2026-04-04*
