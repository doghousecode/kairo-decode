# Kairo Decode — Color Reference

## Brand / UI (KairoDecode.jsx)

| Hex | Usage |
|-----|-------|
| `#5b80e8` | **Decode blue** — "decode" wordmark, primary accent, indigo highlights |
| `#2a3a6a` | **Kairo navy** — "kairo" wordmark letters (k, r, o) |
| `#080810` | Page background (dark mode base) |
| `#080812` | Slight variant of page background |
| `#0d0d1c` | Card / surface background |
| `#16162a` | Elevated surface / input background |
| `#eef0ff` | Light mode background |
| `#f5f6ff` | Light mode surface |

## Tag Colors

| Hex | Tag |
|-----|-----|
| `#3b82f6` | Behaviour (blue) |
| `#8b5cf6` | Architecture (violet) |
| `#ec4899` | Technique (pink) |
| `#f59e0b` | Economics (amber) |
| `#f97316` | *(reserved / orange)* |

## App Shell (globals.css / layout.js)

| Hex | Usage |
|-----|-------|
| `#0a0a0a` | Root background |
| `#0d0d0d` | Body background (password page, splash) |
| `#171717` | Foreground / text base |
| `#ededed` | Light foreground |
| `#ffffff` | White |

## Notes
- Most opacity variations are expressed as `rgba(var(--rgb), 0.xx)` where `--rgb` is `240,240,240` (dark mode) or `10,10,10` (light mode)
- "decode" label in header: `color: #5b80e8`, Jost 700 italic, 2.2rem
- Wordmark PNG: `/kairo-wordmark-cropped.png` (transparent background)
