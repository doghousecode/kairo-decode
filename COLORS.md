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
| `#c8e8d4` | **Mint mode** background gradient base |
| `#d8f0e3` | Mint mode surface / header |
| `#0f5a46` | Mint mode accent text (buttons, links) |

## Tag Colors

| Hex | Tag |
|-----|-----|
| `#3b82f6` | Behaviour (blue) |
| `#6366f1` | Model (indigo) |
| `#0ea5e9` | Dev Tool (sky) |
| `#8b5cf6` | Architecture (violet) |
| `#a855f7` | Inference (purple) |
| `#ec4899` | Technique (pink) |
| `#f59e0b` | Economics (amber) |
| `#f97316` | Training (orange) |
| `#ef4444` | Risk (red) |
| `#14b8a6` | Core Concept (teal) |

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
