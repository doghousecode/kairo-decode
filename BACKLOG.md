# Kairo Decode — Backlog

Features discussed but not yet implemented, roughly in priority order.

---

## Assets / Branding

**Kairo wordmark — light/mint variant**
- Create a dark/forest version of the short `kairo` wordmark (currently only white exists)
- Needed for the footer in mint mode (currently using a CSS brightness filter as a workaround)

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

## UX / Polish

**Streaming ticker is in English during generation**
- By design: terms always generate in English first, translate second
- No action needed — acceptable trade-off; translation kicks in immediately after
- Noted here in case we ever want to revisit (e.g. show a "translating…" overlay instead of raw English stream when UI lang ≠ en)
