# TasteSell

**Daily Shop Brief for SEA sellers — trend, selling plan, and content bundle in 60 seconds.**

Built for the Agnes AI Hackathon. Powered by Agnes multimodal API (text, image, video).

---

## Problem Statement

Millions of phone-first sellers across Southeast Asia run shops on TikTok Shop, Shopee, and WhatsApp — but most never break through cold start. With zero reviews and zero followers, they don't know what to post today, what angle to use, or how to write taste-native content in their language. In a taste economy where infinite supply makes narrative the moat, the gap isn't product quality — it's daily content strategy matched to what's trending right now.

## Project Description

**TasteSell** is a daily AI strategist that gives SEA e-commerce sellers one **Shop Brief** every morning:

1. **Trend Signal** — what's winning in their category this week
2. **Selling Plan** — Agnes auto-picks selling style, target buyer, and explains why
3. **Content Bundle** — Hook Line, Script, and post-ready copy for TikTok, Shopee, and WhatsApp, plus hero image and Hook Video

Sellers enter a product name, price, and category. Agnes runs a five-step agent pipeline with live SSE progress — cascading results appear as each step completes. Built on Agnes-2.0-Flash, Agnes-Image-2.1-Flash, and Agnes-Video-V2.0 with transparent fallbacks for demo reliability.

**Demo persona:** Rina, Jakarta — vitamin C serum, zero reviews, skincare category.

**North Star alignment:** Trends expire daily. Sellers open Agnes every morning for a fresh Shop Brief. That's DAU.

---

## Quick Start

```bash
cp .env.example .env.local
# Add your AGNES_API_KEY from https://platform.agnes-ai.com

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Generate Shop Brief**.

---

## Tech Stack

- Next.js 15 (App Router)
- Agnes API via `https://apihub.agnes-ai.com/v1`
- SSE streaming orchestrator (`POST /api/shop-brief`)
- TypeScript + Tailwind CSS

---

## Agnes Capabilities Used

| Capability | Model | Use |
|---|---|---|
| Text + reasoning | `agnes-2.0-flash` | Trend scan, Selling Plan, Channel Copy |
| Image | `agnes-image-2.1-flash` | Hero product image |
| Video | `agnes-video-v2.0` | 10-second Hook Video |

---

## Pitch (3 min)

> *"Rina sells vitamin C serum in Jakarta. Zero reviews. She doesn't know what to post today. TasteSell gives her the trend, the selling plan, and content for TikTok, Shopee, and WhatsApp — in Bahasa, in 60 seconds. CapCut made everyone a creator. Agnes makes everyone a taste-native seller."*

---

## License

MIT
