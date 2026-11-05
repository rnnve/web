# Rynnie

My personal website, portfolio, and browser start page. Built with Next.js App Router, React, TypeScript, and Tailwind CSS, with Material 3 styling and English/Thai language support on the portfolio pages.

[Website](https://rynni.cc) · [New tab](https://rynni.cc/newtab) · [Older versions](https://git.rynni.cc/rinne/site-archived)

## Pages

| Route          | What’s there                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | Introduction, live Discord and Spotify status, GitHub activity, projects, and technology stacks. Scrolling snaps between the three main sections. |
| `/birthday`    | Birthday countdown using Bangkok time.                                                                                                            |
| `/listen`      | Current listening activity, recent tracks, and weekly favorites from Last.fm.                                                                     |
| `/ask`         | Anonymous questions delivered to Discord.                                                                                                         |
| `/newtab`      | A responsive browser start page with a clock, search, shortcuts, and live wallpaper.                                                              |
| `/sitemap.xml` | Generated sitemap for indexable pages.                                                                                                            |
| `/robots.txt`  | Crawler instructions and the sitemap location.                                                                                                    |

Aliases redirect permanently to their canonical routes:

| Alias                            | Destination    |
| -------------------------------- | -------------- |
| `/nt`                            | `/newtab`      |
| `/listening`, `/songs`, `/music` | `/listen`      |
| `/sitemap`, `/sm.xml`            | `/sitemap.xml` |

## Local development

Install [Bun](https://bun.sh) and use the version pinned in `package.json`.

```bash
bun install
bun run dev
```

The default development address is `http://localhost:3000`. To choose another port or allow access from another device:

```bash
bun run dev --hostname 0.0.0.0 --port 3001
```

Add the accessing hostname or IP to `allowedDevOrigins` in `next.config.ts` when needed. Entries contain only the hostname or IP, without a scheme or port.

Production builds use the standard Next.js commands:

```bash
bun run build
bun run start
```

Both development and build commands regenerate the profile-picture manifest from `public/pfp`. Add or remove images there instead of editing `app/generated/pfp-images.ts`.

## Configuration

The site can run with its built-in service endpoints and fallback states. Configure these optional server environment variables locally in `.env.local` or in your hosting provider:

| Variable                  | Purpose                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`            | Read-only token to increase the GitHub API rate limit for activity and repositories.  |
| `ASK_DISCORD_WEBHOOK_URL` | Discord webhook used to deliver anonymous questions. Overrides the built-in fallback. |

The fallback webhook is Base64-encoded in the source, which is not secret storage. Configure your own webhook when deploying your own copy.

Discord, Spotify, and Last.fm endpoints are configured in `app/api/`. Featured GitHub repositories are selected in `app/config/portfolio.ts`. The footer reads deployment commit metadata, falling back to the local Git commit at build time.

## New-tab page

Set your browser’s custom new-tab URL to `https://rynni.cc/newtab` or `https://rynni.cc/nt`, using your browser’s settings or a new-tab extension where required.

The page fits the viewport without document scrolling on desktop and phone. It includes local time and date, Google/DuckDuckGo/Bing search, and up to eight editable shortcuts. Customize opens an editor that can scroll independently. Search-engine preferences and shortcuts are stored only in that browser’s local storage.

The page is statically prerendered and uses system fonts. It skips the portfolio loading screen, navigation, animated effects, and status requests. Search and default shortcuts work before JavaScript loads. The clock updates once per minute and pauses its timer in hidden tabs.

The wallpaper streams from `https://cdn.rynni.cc/assets/wallpapers/kanade.mp4` after the page paints, with `public/newtab-wallpaper.webp` as its initial still image. Video playback is muted, loops inline, and pauses when the tab is hidden. A play/pause control is available at the bottom of the page. Reduced-motion preferences show the still image until playback is requested. Update the video URL in `app/newtab/live-wallpaper.tsx` and replace the still image when changing wallpapers.

## Sitemap

Next.js generates `/sitemap.xml` from `app/sitemap.ts` during production builds. It includes the canonical homepage, birthday, listening, and ask URLs under `https://rynni.cc`. Update those entries when adding indexable pages or changing the production domain.

`app/robots.ts` generates `/robots.txt` and advertises the sitemap. The new-tab page is marked `noindex` and is omitted from the sitemap, along with API endpoints and redirect aliases. `/sitemap` and `/sm.xml` redirect to `/sitemap.xml`.

## Project structure

| Location                             | Responsibility                                                         |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `app/layout.tsx`                     | Root metadata, viewport defaults, and global styles.                   |
| `app/components/route-shell.tsx`     | Keeps the new-tab page separate from portfolio chrome.                 |
| `app/components/portfolio-shell.tsx` | Portfolio fonts, settings, loading screen, navigation, and effects.    |
| `app/page.tsx`                       | Homepage content and section composition.                              |
| `app/newtab/`                        | New-tab interface, preferences, wallpaper playback, and scoped styles. |
| `app/api/`                           | Status, listening, anonymous question, and profile-image handlers.     |
| `app/hooks/use-portfolio-status.ts`  | Homepage polling and loading state.                                    |
| `app/lib/`                           | Data normalization, caching, settings, and shared utilities.           |
| `app/config/portfolio.ts`            | Featured repository names and ordering.                                |
| `app/styles/`                        | Portfolio theme, page styles, and effect styles.                       |
| `app/sitemap.ts`, `app/robots.ts`    | Generated crawler metadata.                                            |
| `public/`                            | Static assets, profile images, and wallpaper poster.                   |
| `scripts/`                           | Profile-picture manifest generation.                                   |
| `tests/`                             | Data adapters, API behavior, preferences, and date calculations.       |

Portfolio background and cursor effects are configured in `app/components/site-background.tsx` and `app/components/cursor-effects.tsx`. Their renderers load separately and respect device capabilities and motion preferences.

The homepage polls Discord every 15 seconds, Spotify every second, and GitHub every five minutes while visible. Returning to the tab refreshes the widgets. Requests are deduplicated, and temporary service failures retain available fallbacks. Spotify uses live responses rather than restoring a previously playing track.

## Checks

```bash
bun run lint
bunx tsc --noEmit
bun test
bun run format:check
bun run build
```

Use `bun run format` to apply Prettier. Build output, dependencies, the lockfile, and generated profile manifests are excluded from formatting.

## Deployment

Deploy as a standard Next.js application on Vercel or another host that supports its server runtime. The API routes require server execution; a static-only export does not provide them. Set any optional environment variables in the hosting provider, then build with `bun run build`.
