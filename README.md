# Celebrity Bingo

Celebrity Bingo is a lightweight browser-based game helper for running a celebrity bingo session. It includes a host/admin view for drawing categories and a player board view for marking answers.

## Features

- **Host/Admin Mode**: Spin and announce category prompts with an interactive slot-machine style wheel.
- **Player Board Mode**: Automatically generate and stamp/mark bingo cards with selected categories.
- **Real-Time Synchronization**: Sync the drawn categories, board states, and lobby information between host and players instantly.
- **Local Persistence**: Remembers game progress and configuration automatically using browser local storage.
- **Premium Tabletop UI**: Sleek, playful tabletop board game design built with Tailwind CSS. Uses the clean **IBM Plex Sans Thai** font for a modern look.
- **Sound & Voice Callers**: Built-in sound effects and speech synthesis for automatic name callers.

## Tech stack

- **Vite** — Fast, modern frontend build tool.
- **Vanilla JavaScript** — Light and performant core logic.
- **Tailwind CSS (v4)** — Styling framework for premium aesthetics.
- **Lucide Icons** — Playful iconography.
- **Firebase Realtime Database** — Instant host-to-player game state sync.
- **Cloudflare Workers** — Fast serverless hosting, SPA routing fallback, and runtime configurations.

## Prerequisites

- Node.js 18+ recommended
- npm

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Firebase configuration values if you want to use the online multiplayer sync:
   ```bash
   cp .env.example .env
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown in the terminal, usually:
   ```text
   http://localhost:5173
   ```

## Build for production

```bash
npm run build
```

The production build will be generated in the `dist` folder.

To preview the production build locally:

```bash
npm run preview
```

## Cloudflare deployment

Yes — this repository is suitable for deployment on Cloudflare Pages or Cloudflare Workers because it is a static Vite frontend with a lightweight Cloudflare Worker handling routing/configuration.

### Option 1: Cloudflare Pages

- Connect the repository in Cloudflare Pages.
- Use these build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
- If using the online multiplayer sync, configure the Firebase environment variables (`VITE_FIREBASE_*`) in the Pages Dashboard under **Settings** -> **Environment variables**.

### Option 2: Cloudflare Workers (Workers Assets)

This repository includes a Wrangler config (`wrangler.jsonc`) for serving static assets and dynamic configurations.

1. Configure environment variables in `wrangler.jsonc` (or add them as Cloudflare Secrets/Variables in the dashboard).
2. Install Wrangler if needed:
   ```bash
   npm install -g wrangler
   ```
3. Build the app:
   ```bash
   npm run build
   ```
4. Deploy:
   ```bash
   wrangler deploy
   ```

## Notes

- The app uses browser APIs such as `localStorage`, speech synthesis, and the Web Audio API, so it works best as a modern static frontend deployment.
- Firebase integration is fully optional; if config variables are missing or invalid, the app gracefully degrades to standalone offline mode.
