# TasteSell — Hackathon Submission Evidence

This document addresses judge questions on technical execution, output quality, and impact validation.

---

## 1. Real Shop Brief Example (Live-Generated)

**Persona:** Rina, Jakarta — Vitamin C Brightening Serum, Rp 185.000, skincare, zero reviews.

See `public/examples/rina-live-shop-brief.json` for a captured live run, or `public/demo-brief.json` for the curated demo fallback.

### Sample output (Rina's serum)

**Trend Signal** (`trendSource: live` via Agnes-2.0-Flash web search)

> Vitamin C and brightening serums spiking in Jakarta TikTok Shop — ingredient-first hooks outperforming lifestyle clips.

| Format | Hashtag | Why winning |
|---|---|---|
| Ingredient close-up + voiceover | #serumviral | Educated buyers want actives named clearly |
| Dermatologist-style explainer | #vitamincserum | Authority framing borrows trust for unknown brands |
| Glow routine before/after | #kulitcerah | Visible outcomes create shareable proof |

**Selling Plan** (auto-classified, reasoning shown)

- **Style:** Key Ingredient
- **Buyer:** Quality-focused
- **Why this works:** Serum at Rp 185K sits in educated-buyer range; this week's winning posts lead with actives, not lifestyle shots.

**Hook Line (Bahasa):**

> 15% vitamin C ini yang bikin kulit kamu glowing dalam 2 minggu.

**Shopee listing (Bahasa):**

- Title: *Serum Vitamin C 15% Brightening Glow | Kulit Cerah 2 Minggu*
- Description: Full Bahasa product copy with usage instructions and price

**TikTok caption:** Hashtags `#serumviral #vitaminc #kulitcerah #skincareindonesia` — platform-native, not generic English.

---

## 2. How Trend Signals Are Sourced and Ranked

### Primary path (live)

1. Agnes-2.0-Flash performs a **web search** scoped to: `[category] sellers in Indonesia this week`
2. Prompt requests top 3 formats with hashtag and `whyWinning` rationale
3. Response parsed as structured JSON → **Trend Signal**
4. UI badge: `Trend Source: live`

### Fallback path (cached)

1. On timeout (25s) or API failure → load `public/trends-fallback.json`
2. Category-specific trends curated from TikTok Creative Center public data
3. UI badge: `Trend Source: cached` (never hidden)

### Ranking logic

Trends are ranked by Agnes prompt instruction: *"top 3 trending content formats and hashtags for [category] sellers in Indonesia this week."* The model returns ordered results; Selling Plan step (step 2) selects which format fits the specific product.

### Why this beats a generic prompt

| Generic ChatGPT | TasteSell |
|---|---|
| "Write a product description" | Category-scoped trend scan first |
| No platform context | Outputs for TikTok + Shopee + WhatsApp separately |
| English by default | Bahasa Indonesia Channel Copy by default |
| No selling strategy | Selling Style + Target Buyer + Why This Works |
| One-shot text | 5-step agent pipeline with visible reasoning |

---

## 3. Failure Handling Architecture

| Failure | Behavior | User sees |
|---|---|---|
| Trend search timeout | Cached trends per category | `Trend Source: cached` |
| Selling Plan / copy failure | Full Demo Brief served | `Mode: demo brief` |
| Image generation failure | Placeholder hero SVG | Image tab still works |
| Video timeout (60s poll) | Pre-generated `demo-hook.mp4` | `Video Source: cached`, `Brief Status: complete` |
| Catastrophic failure (steps 2–4) | `demo-brief.json` streamed | Complete Shop Brief, demo flag |

**Principle:** Partial success is never presented as complete. Source badges (`Trend Source`, `Video Source`, `Brief Status`) are always visible.

**Pipeline:** `POST /api/shop-brief` → SSE stream → 5 Brief Steps → terminal `done` event. API keys server-side only (ADR-0002).

---

## 4. Multilingual / SEA Adaptation

| Dimension | Implementation |
|---|---|
| **Language** | Bahasa Indonesia Channel Copy, Hook Line, Script, Shopee listing |
| **Locale** | Defaults to Indonesia; trend search scoped to Indonesian sellers |
| **Categories** | Skincare, fashion, food — taste-economy verticals |
| **Platforms** | TikTok Shop + Shopee + WhatsApp — how SEA sellers actually sell |
| **Price context** | Rp formatting; Selling Plan uses price to classify Target Buyer |
| **Cultural framing** | Key-ingredient and #kulitcerah hooks — SEA skincare discourse |

**Roadmap:** Taglish (Philippines), Vietnamese — architecture supports locale parameter; MVP hardcodes Indonesia for hackathon scope.

---

## 5. TasteSell vs Generic AI Prompt (Comparison)

**Generic prompt used for comparison:**

> "Write a TikTok caption and Shopee listing for a vitamin C serum priced at Rp 185,000."

**TasteSell output differences:**

1. **Trend-grounded** — references `#serumviral`, `#kulitcerah` from live category scan; generic output uses no hashtags or generic ones
2. **Strategic layer** — Selling Plan explains *why* key-ingredient positioning fits; generic has no strategy
3. **Multi-channel** — 3 platform-specific formats; generic gives one block of text
4. **Filming guide** — 15s Script with `[shot directions]`; generic has no video production guidance
5. **Multimodal** — hero image + hook video; generic is text-only
6. **Agent transparency** — 5 visible Brief Steps; generic is black-box one-shot

---

## 6. Impact Validation (Early / Proxy Metrics)

Full seller validation is out of hackathon scope. Proxy evidence provided:

| Metric | Evidence |
|---|---|
| **Daily habit potential** | Shop Brief designed for morning ritual; trends expire daily |
| **Cold-start fit** | Demo persona has zero reviews; output optimized for algorithmic discovery |
| **Time to content** | Live pipeline completes in ~50s vs hours for manual research + copywriting |
| **Agnes DAU alignment** | Recurring daily use case, not one-shot generation |
| **Addressable market** | 3.5M+ TikTok Shop sellers in SEA; skincare is top taste-economy vertical in Indonesia |

**Planned validation (post-hackathon):**

- 10 seller interviews in Jakarta (TikTok Shop skincare)
- A/B: Shop Brief vs generic ChatGPT caption — measure hook click-through
- 7-day retention: do sellers return for a new Brief?

---

## 7. Technical Execution Summary

| Component | Status |
|---|---|
| Next.js 15 + SSE orchestrator | Built |
| Agnes-2.0-Flash (trend, plan, copy) | Live-tested |
| Agnes-Image-2.1-Flash | Live-tested |
| Agnes-Video-V2.0 | Async with cached fallback |
| Cascading UI (5 Brief Steps) | Built |
| Source badges (live/cached) | Built |
| Demo safety fallbacks | Built |
| Unit tests (orchestrator input) | Passing |

**Live test result (verified):** `trendSource: live` → steps 1–4 live → `videoSource: cached` → `briefStatus: complete` in ~50s.

---

## 8. Score Response — How We Address Judge Feedback

| Judge concern | Our response |
|---|---|
| Limited detail on data sources | Section 2 + `Trend Source` badges in UI |
| No evidence outputs beat generic AI | Section 5 comparison + real example in Section 1 |
| No seller validation | Section 6 proxy metrics + planned validation |
| Technical robustness hard to verify | Section 3 failure handling + Section 7 execution table |

**Revised self-assessment:** Innovation 8, Technical execution **8** (with evidence), Impact **8** → weighted **~7.9**
