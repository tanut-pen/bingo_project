# Celebrity Bingo

Celebrity Bingo is a lightweight browser-based game helper for running a celebrity bingo session. It includes a host/admin view for drawing categories and a player board view for marking answers.

## Features

- Host/admin mode for spinning and announcing category prompts
- Player board mode for marking bingo squares
- Local persistence with browser storage so progress is remembered
- Responsive layout with a tabletop-style UI
- Optional sound and voice announcements

## Tech stack

- Vite
- Vanilla JavaScript
- Tailwind CSS
- Lucide icons

## Prerequisites

- Node.js 18+ recommended
- npm

## Run locally

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the local development server
   ```bash
   npm run dev
   ```
3. Open the local URL shown in the terminal, usually:
   ```text
   http://localhost:5173
   ```

## Build for production

```bash
npm run build
```

The production build will be generated in the dist folder.

To preview the production build locally:

```bash
npm run preview
```

## Cloudflare deployment

Yes — this repository is suitable for deployment on Cloudflare Pages or Cloudflare Workers because it is a static Vite frontend with no server-side runtime requirement.

### Option 1: Cloudflare Pages

- Connect the repository in Cloudflare Pages
- Use these build settings:
  - Build command: npm run build
  - Output directory: dist

### Option 2: Cloudflare Workers (Workers Assets)

This repository includes a Wrangler config for static assets.

1. Install Wrangler if needed:
   ```bash
   npm install -g wrangler
   ```
2. Build the app:
   ```bash
   npm run build
   ```
3. Deploy:
   ```bash
   wrangler deploy
   ```

If you prefer, you can also deploy the built dist folder directly from Cloudflare Pages.

## Notes

The app uses browser APIs such as localStorage, speech synthesis, and the Web Audio API, so it works best as a static frontend deployment.
