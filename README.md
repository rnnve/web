# Rynnie

Personal site: portfolio, live listening, synced lyrics, docs, and a browser start page. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

[Website](https://rynni.cc) · [New Tab](https://rynni.cc/newtab) · [Previous versions](https://git.rynni.cc/rinne/site-archived)

## Pages

| Route       | What it does                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `/`         | Intro, live Spotify and Discord status, GitHub contributions, selected repos, and the technology stack. |
| `/listen`   | Last.fm history and track/artist rankings.                                                              |
| `/birthday` | Bangkok-time countdown and anonymous wishes during the birthday window.                                 |
| `/ask`      | Anonymous questions sent to Discord.                                                                    |
| `/docs`     | Fumadocs guides with search and MDX.                                                                    |
| `/newtab`   | Clock, search, shortcuts, and an interactive ShapeGrid background.                                      |
| `/redirect` | Named destinations, or any HTTP(S) URL via `?url=`.                                                     |

`/nt` redirects to `/newtab`. `/listening`, `/songs`, and `/music` redirect to `/listen`. `/r/:path*` rewrites to `/redirect/:path*`. `/sitemap` and `/sm.xml` redirect to `/sitemap.xml`.

English is the default. Add `#th` or `#en` (`#lang=th` and `#lang=en` also work) to pick a language. Navbar links keep that choice. There is no language button.

The playing song’s cover sets the accent on portfolio pages. Missing, unreadable, or near-black artwork restores the default white accent. Navigation is an icon rail on the left on desktop and a bottom dock on mobile.

## Development

Use Bun 1.4.4, as specified in [package.json](package.json).

```bash
bun install
bun run dev
```

Open [localhost:3000](http://localhost:3000). To use another port or reach the site from another device:

```bash
bun run dev --hostname 0.0.0.0 --port 3001
```

Add that hostname or IP to `allowedDevOrigins` in [next.config.ts](next.config.ts) when needed. Dev and production builds regenerate the profile image manifest from `public/pfp/`.

Read [AGENTS.md](AGENTS.md) before changing code. Next.js guides are in `node_modules/next/dist/docs/`.

```bash
bun run lint
bunx tsc --noEmit
bun test
bun run format:check
bun run build
```

`bun run format` applies Prettier.

## Environment

Set these optional variables in `.env.local` or on the host. Restart after changes. Keep secrets out of client code and Git.

| Variable                       | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `GITHUB_TOKEN`                 | Read-only token for higher GitHub API limits.  |
| `SPICYLYRICS_API_KEY`          | Spicy Lyrics key, used only by the lyrics API. |
| `LRC_RED_CONTACT_EMAIL`        | Contact email required by lrc.red.             |
| `ASK_DISCORD_WEBHOOK_URL`      | Webhook for anonymous questions.               |
| `BIRTHDAY_DISCORD_WEBHOOK_URL` | Webhook for birthday wishes.                   |

Set your own webhooks when deploying a copy. Built-in webhook defaults are Base64-encoded, not encrypted.

The browser subscribes to `wss://api.rynni.cc/ws/spotify` and `wss://api.rynni.cc/ws/discord` from `app/lib/status-stream.ts`. Last.fm and GitHub use the handlers in `app/api/`.

Lyrics are looked up in this order: [Spicy Lyrics](https://developers.spicylyrics.org/docs) when a key and Spotify track ID exist, then [lrc.red](https://lrc.red/api) when the contact email is set, then [LRCLIB](https://lrclib.net/docs.txt). Unconfigured providers are skipped. Credentials stay on the server.

## New tab

Set [rynni.cc/newtab](https://rynni.cc/newtab) or [rynni.cc/nt](https://rynni.cc/nt) as the browser new-tab URL. Some browsers need an extension for that. The page has a clock, a greeting, search, and up to eight shortcuts saved in local storage. It uses its own layout, without portfolio navigation or status polling.

## Docs and deploy

Add MDX pages in `content/docs` and list them in `content/docs/meta.json`. The canonical origin is `https://rynni.cc` (`SITE_URL` in `app/lib/og/resolver.ts`).

The site needs a Next.js server. API routes and server rendering do not work as a static export.

```bash
bun install
bun run build
bun run start
```

Brand logos come from the `@logoforge` registry in `components.json` and live in `components/logos/`.
