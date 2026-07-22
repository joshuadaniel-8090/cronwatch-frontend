# CronWatch Frontend

The web dashboard for CronWatch — a cron job and URL uptime monitoring SaaS. Built with Next.js (App Router), TypeScript, and Tailwind. Talks to the [cronwatch-backend](../cronwatch-backend) FastAPI service, with auth handled by Supabase.

## Prerequisites
- Node.js 20+
- A running instance of `cronwatch-backend` (locally or deployed)
- A Supabase project (shared with the backend)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Set `NEXT_PUBLIC_API_URL` to your backend's URL (e.g. `http://localhost:8000` for local dev)
3. **Run the dev server:**
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run a production build
- `npm run lint` — lint with Next.js's ESLint config
