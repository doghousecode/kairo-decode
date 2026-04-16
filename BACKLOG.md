# Kairo Decode — Backlog

Features discussed but not yet implemented, roughly in priority order.

---

## Translation & Localisation

**Loc coverage checker**
- Daily automated check across all languages and Kairo properties
- Detects terms added without translations (or with untranslated content matching English source)
- Emails a report to the team
- Could live as part of a broader analytics dashboard (see below)

**Eliminate English flash on first load**
- Without localStorage there's a ~1s flash of English while Supabase fetches
- Fix: re-introduce localStorage as a read-through cache, but only ever populated from confirmed Supabase data (never written from local state)
- Gives instant render on repeat visits without the stale-data risk that caused the previous corruption issues

---

## Export

**Export / print glossary as PDF**
- Let users export the current filtered view (or full glossary) as a formatted PDF
- Could also support "copy all" or export to Notion/markdown

---

## Analytics Dashboard

**Visitors page → full analytics**
- Currently basic; expand to show IP, location, device type
- Cover all Kairo properties (not just Decode)
- Loc coverage report panel (see above) as a tab or section
- Could run loc checks on a schedule and surface results here

---

## Social / Attribution

**Contributor attribution**
- Show name or initials on terms a specific person added
- Opt-in at add-time (name field on the add flow)
- Could display as a subtle byline on the card

---

## UX / Polish

**Streaming ticker is in English during generation**
- By design: terms always generate in English first, translate second
- No action needed — acceptable trade-off; translation kicks in immediately after
- Noted here in case we ever want to revisit (e.g. show a "translating…" overlay instead of raw English stream when UI lang ≠ en)
