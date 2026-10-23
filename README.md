# Ryn's personal site

Design by Me and With the helping of Codex for coding.

A personal site built with Next.js, React, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

The profile-picture manifest is generated automatically before development and production builds from the images in `public/pfp`.

## Vercel deployment

Deploy the repository as a standard Next.js project. The site uses a fixed dark pink palette and does not require theme-related environment variables or external storage.

Optionally set `GITHUB_TOKEN` to a read-only GitHub token so the public activity graph and repository cards are not constrained by GitHub's low unauthenticated API rate limit. The site retains usable GitHub fallbacks when the token is absent.
