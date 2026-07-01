# Leafline

AI-powered crop disease diagnosis for Bangladesh farmers.

Upload a photo of an affected plant part (leaf, root, fruit, flower, or stem) and get an instant diagnosis powered by Google Gemini and a custom-trained model.

## Features

- Photo-based disease detection for common Bangladesh crops
- Severity rating, treatment plan, and prevention advice
- Bangla & English UI with voice input support
- Diagnosis history with per-user storage
- Regional disease map and analytics dashboard
- Weather data per district via Open-Meteo

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 15** App Router
- **React 19**
- **Supabase** (Postgres + Storage)
- **Google Gemini** AI
- **Tailwind CSS v4**
- **i18next** (bn/en)
