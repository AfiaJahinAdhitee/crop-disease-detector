# 🌿 Leafline

**AI-powered crop disease diagnosis for Bangladesh farmers.**

Upload a photo of an affected plant part — leaf, root, fruit, flower, or stem — and get an instant diagnosis powered by a custom-trained disease detection model, cross-checked with Google Gemini, complete with severity rating, treatment plan, and prevention advice in Bangla or English.

**🔗 Live app:** [crop-disease-detector-beryl.vercel.app]([https://crop-disease-detector-vojv.vercel.app/])

---

## Features

- 📸 **Photo-based diagnosis** — a custom-trained model handles tomato, potato, and pepper leaves; Gemini vision handles every other crop and plant part
- 🔍 **Dual-model cross-check** — when the custom model and Gemini disagree, both opinions are surfaced instead of silently picking one
- 🌦️ **Weather-aware advice** — pulls live weather for the user's district (Open-Meteo) and factors it into treatment guidance
- 🗺️ **Regional disease map & analytics dashboard** — see disease trends by region over time
- 📖 **Diagnosis history** — every scan is saved per-user with images, confidence scores, and treatment records
- 🌐 **Bangla & English UI** — full i18n support, including correctly-rendered Bangla typography
- 🔊 **Voice input & read-aloud** support for accessibility
- 🔐 **Custom auth system** — email OTP verification with JWT access/refresh tokens on top of Supabase
- 🎥 **Related videos** — YouTube search integration for treatment tutorials matched to the diagnosed disease

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (Postgres, Storage), custom JWT session layer |
| AI / ML | Google Gemini (vision), custom-trained CNN served via Hugging Face Space |
| Localization | i18next (Bangla / English) |
| Maps | Leaflet |
| Charts | Recharts |
| Email | Nodemailer (Gmail SMTP) — OTP delivery |
| Deployment | Vercel |

## Architecture Overview

```
┌─────────────┐      photo       ┌──────────────────────┐
│   Browser   │ ───────────────▶ │  /api/diagnose        │
│  (upload)   │                  │  Next.js route        │
└─────────────┘                  └──────────┬────────────┘
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
              ┌─────────────────┐   ┌────────────────┐   ┌──────────────────┐
              │ Custom model    │   │ Google Gemini  │   │ Open-Meteo        │
              │ (Hugging Face)  │   │ (cross-check)  │   │ (district weather)│
              └─────────────────┘   └────────────────┘   └──────────────────┘
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │ Supabase          │
                                   │ (Postgres + Storage)│
                                   └──────────────────┘
```

Leaf images for `tomato`, `potato`, and `pepper` are routed to the custom model first; if its prediction doesn't match the selected crop, or the plant part isn't a leaf, the request falls back to Gemini directly. Every diagnosis (image, disease, severity, confidence, treatment) is persisted to Supabase against the signed-in user.

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API](https://ai.google.dev/) key
- A Gmail account with an [app password](https://myaccount.google.com/apppasswords) for OTP emails
- A [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key

### Setup

```bash
git clone https://github.com/AfiaJahinAdhitee/crop-disease-detector.git
cd crop-disease-detector
npm install
cp .env.example .env.local   # then fill in your values — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access — keep secret |
| `JWT_SECRET` | Signs custom session tokens |
| `OTP_SECRET` | HMAC secret for email OTP codes |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | SMTP sender for OTP emails |
| `GEMINI_API_KEY` | Google Gemini vision API |
| `HF_MODEL_URL` | Hugging Face Space endpoint for the custom disease model |
| `YOUTUBE_API_KEY` | YouTube search for treatment videos |

See [`.env.example`](.env.example) for details and setup instructions for each.

### Database

Run the SQL in [`supabase/schema.sql`](supabase/schema.sql) followed by the migrations in [`supabase/migrations/`](supabase/migrations) (in order) against your Supabase project to create the required tables, storage bucket, and grants.

## Deployment

The app is deployed on [Vercel](https://vercel.com), building from the `afif-v-2` branch. To deploy your own instance:

1. Import this repository into Vercel
2. Add all environment variables listed above under **Settings → Environment Variables**
3. Deploy — Vercel auto-detects the Next.js framework and build settings

## Team

An independent project built by three BUET CSE students:

| | |
|---|---|
| **Afif Siddique** | [GitHub](https://github.com/canafifcode) · [LinkedIn](https://www.linkedin.com/in/afif-siddique/) · [Facebook](https://www.facebook.com/afif.siddique.75) |
| **Afia Jahin Adhitee** | [GitHub](https://github.com/AfiaJahinAdhitee) · [LinkedIn](https://www.linkedin.com/in/afia-jahin-adhitee-690b70395/) · [Facebook](https://www.facebook.com/afiajahinadhitee) |
| **Al Shahriar Alif** | [GitHub](https://github.com/AlShahriarAlif2004) · [Facebook](https://www.facebook.com/afil.islam) |

Read more on the [About page](https://crop-disease-detector-beryl.vercel.app/about).

## License

No license has been chosen yet — all rights reserved by the authors.
