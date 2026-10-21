# MYNEST — My Personal Dashboard

A premium, futuristic personal productivity dashboard built with React, TypeScript, and Vite. All data is stored locally in your browser — no account, no server, no tracking.

## Features

- **Dashboard** — Date, greeting, task summary, habit progress, and quick actions
- **Notes** — Create, edit, search, pin, and delete notes with categories
- **Tasks** — Add, edit, complete, delete, search, and filter tasks with priority and due dates
- **Habits** — Track daily habits with streaks, 7-day view, and 30-day completion percentage
- **Focus Timer** — Working 25-minute Pomodoro timer with start, pause, resume, and reset
- **Daily Planner** — Build a time-based schedule with completion tracking
- **Journal** — Write, browse, edit, delete, and search daily journal entries with moods
- **Tools** — Working calculator, word/character counter, and goal progress tracker
- **Settings** — Light/dark theme, editable display name, JSON export/import, and data reset

## Tech Stack

- React 18 + TypeScript
- Vite 7 (build tool)
- Tailwind CSS 3 (styling)
- Lucide React (icons)
- Browser localStorage (data persistence — no backend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install and Run Locally

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

The output goes to the `dist/` folder.

## Deploying to GitHub Pages

### Step 1 — Create a GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository (e.g. `mynest`).
2. Note the repository name — you'll need it below.

### Step 2 — Push Your Code

Download or clone this project to your computer, then:

```bash
git init
git add .
git commit -m "Initial commit — MYNEST dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mynest.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `mynest` with your actual GitHub username and repository name.

### Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub.
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Source**, select **GitHub Actions**.

### Step 4 — Add the Deploy Workflow

Create a file at `.github/workflows/deploy.yml` in your repository with this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Step 5 — Push and Wait

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push
```

Go to the **Actions** tab in your repository. Once the workflow finishes, your site will be live at:

```
https://YOUR_USERNAME.github.io/mynest/
```

### Important: Base Path

This project uses `base: './'` in `vite.config.ts`, which means it works with **any** repository name and subpath without configuration changes. You do **not** need to change anything for GitHub Pages.

If you later deploy to a custom domain (e.g. `myapp.com`), the relative base still works.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## Data & Privacy

- All your data (notes, tasks, habits, journal, etc.) is stored in your browser's `localStorage`.
- No data is ever sent to a server. There is no backend.
- Use **Settings → Export Data** to download a JSON backup.
- Use **Settings → Import Data** to restore from a backup.
- Clearing your browser data will erase everything — export a backup first.

## License

Free to use and modify for personal use.
