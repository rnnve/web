# Rynnie

A personal corner of the web: a portfolio, live activity, and a browser start page. Built with Next.js, React, TypeScript, and Tailwind CSS.

[Visit the site](https://rynni.cc) · [Open New Tab](https://rynni.cc/newtab) · [Previous versions](https://git.rynni.cc/rinne/site-archived)

## Explore

| Page      | URL         | Features                                                                                                         |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Home      | `/`         | Introduction, Discord presence, Spotify playback, GitHub activity, featured repositories, and technology stacks. |
| Birthday  | `/birthday` | Countdown to December 31 using Bangkok time.                                                                     |
| Listening | `/listen`   | Current track, recent listening, and weekly favorites from Last.fm.                                              |
| Ask       | `/ask`      | Send an anonymous question to Discord.                                                                           |
| New Tab   | `/newtab`   | Local clock, web search, personal shortcuts, and a live video wallpaper.                                         |

The portfolio includes English and Thai text, Material 3 styling, and scroll snapping between the homepage’s three sections. Background and cursor effects adapt to motion preferences and device capabilities.

## A new home for your tabs

Use **[rynni.cc/newtab](https://rynni.cc/newtab)** or **[rynni.cc/nt](https://rynni.cc/nt)** as your browser’s custom new-tab URL. Some browsers require an extension to change this setting.

- Local time and date, with a greeting for the time of day.
- Google, DuckDuckGo, or Bing search.
- Up to eight shortcuts, edited through **Customize**.
- A full-screen live wallpaper with a play/pause control.
- Desktop and phone layouts that fit the screen without page scrolling.

Search preferences and shortcuts stay in the current browser’s local storage. The shortcut editor scrolls independently when needed.

The page uses system fonts and skips the portfolio loading screen, navigation, effects, and status requests. A local still image appears before the wallpaper streams from the CDN. Video playback is muted, loops inline, and pauses when the tab is hidden. Reduced-motion preferences keep the still image until you choose to play the video. The clock also pauses its timer in hidden tabs.

## Run locally

Use the Bun version specified in `package.json`.

```bash
bun install
bun run dev
```

Open `http://localhost:3000`. For access from another device or a different port:

```bash
bun run dev --hostname 0.0.0.0 --port 3001
```

If needed, add the accessing hostname or IP to `allowedDevOrigins` in `next.config.ts`. Use the hostname or IP alone, without a scheme or port.

For a production server:

```bash
bun run build
bun run start
```

Development and build commands generate the profile-picture manifest automatically from `public/pfp`.

## Configure

Optional server environment variables can be set in `.env.local` or through your hosting provider:

| Variable                  | Purpose                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`            | Increase GitHub API rate limits for repository and activity requests. Use a read-only token. |
| `ASK_DISCORD_WEBHOOK_URL` | Set the Discord webhook that receives anonymous questions. Overrides the built-in fallback.  |

When deploying your own copy, configure your own webhook. The fallback in the source is Base64-encoded, not encrypted.

Common changes:

| Change                                  | Location                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Homepage content                        | `app/page.tsx`                                                            |
| Featured GitHub repositories            | `app/config/portfolio.ts`                                                 |
| Discord, Spotify, and Last.fm endpoints | `app/api/`                                                                |
| Profile images                          | `public/pfp/`                                                             |
| Portfolio navigation                    | `app/components/portfolio-navbar.tsx`                                     |
| Portfolio background and cursor         | `app/components/site-background.tsx`, `app/components/cursor-effects.tsx` |
| New-tab interface and styles            | `app/newtab/new-tab.tsx`, `app/newtab/new-tab.module.css`                 |
| Wallpaper video and still image         | `app/newtab/live-wallpaper.tsx`, `public/newtab-wallpaper.webp`           |
| Routes and development origins          | `next.config.ts`                                                          |

Shared portfolio settings, fonts, navigation, and effects live in `app/components/portfolio-shell.tsx`. `app/components/route-shell.tsx` gives the new-tab page its separate, lightweight layout. Data adapters and request utilities live in `app/lib/`; widget polling lives in `app/hooks/use-portfolio-status.ts`.

## Routes and discovery

| Alias                            | Redirects to   |
| -------------------------------- | -------------- |
| `/nt`                            | `/newtab`      |
| `/listening`, `/songs`, `/music` | `/listen`      |
| `/sitemap`, `/sm.xml`            | `/sitemap.xml` |

All aliases use permanent redirects.

Next.js generates `/sitemap.xml` from `app/sitemap.ts` and `/robots.txt` from `app/robots.ts`. The sitemap includes the canonical home, birthday, listening, and ask pages at `https://rynni.cc`. The new-tab page has `noindex` metadata and is omitted, as are API endpoints and aliases.

Update the sitemap entries and the sitemap URL in `app/robots.ts` when changing the production domain or adding indexable pages.

## Check changes

```bash
bun run lint
bunx tsc --noEmit
bun test
bun run format:check
bun run build
```

Use `bun run format` to apply Prettier. Tests cover data normalization, API behavior, browser preferences, and date calculations. Generated files, dependencies, and build output are excluded from formatting.

## Deploy

Deploy to Vercel or another host with a Next.js server runtime. Install dependencies with Bun, set any environment variables, and run `bun run build`. API routes need server execution, so a static-only export does not provide the full site.

The portfolio footer displays the deployment commit when available, falling back to the local Git commit at build time.
