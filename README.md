# Rynnie

My personal website: a portfolio, live listening activity, synchronized lyrics, and a browser start page. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

[Website](https://rynni.cc) · [New Tab](https://rynni.cc/newtab) · [Previous versions](https://git.rynni.cc/rinne/site-archived)

## Pages

| Route       | What it does                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `/`         | Introduction, live Spotify and Discord status, current-year GitHub contributions, selected repositories, and technology stack. |
| `/listen`   | Last.fm listening history and track/artist rankings across selectable periods.                                                 |
| `/birthday` | Birthday countdown in Bangkok time and anonymous wishes during the birthday window.                                            |
| `/docs`     | Fumadocs guides with navigation, full-text search, and MDX content.                                                            |
| `/ask`      | Anonymous questions delivered to Discord.                                                                                      |
| `/newtab`   | Clock, search, shortcuts, and a video wallpaper for a browser start page.                                                      |
| `/redirect` | Redirect screen for named destinations or a URL supplied through `?url=`.                                                      |

The portfolio uses a custom glassmorphism theme with translucent panels, fine borders, Geist typography, and shadcn navigation controls. The playing song’s cover sets the shared accent across all portfolio pages, including the sliding navbar highlight. Near-black monochrome covers, missing or unreadable artwork, and stopped playback restore the default white accent. Each song change randomly selects either the top-left or bottom-right patch. That position stays fixed for the song, including artwork retries; different songs sharing a cover can choose different positions. Meaningful colored regions take priority over neutral borders and shadows. Dark cover colors are lightened for readable accents, and artwork extraction is cached per cover. Failed reads retry after 30 seconds, with a browser image-decoding fallback for unsupported bitmap formats. Accent changes fade over 2 seconds, with immediate updates for reduced-motion preferences. It defaults to English and supports Thai through URL language selection, with a compact navigation rail on the left on desktop and a dock at the bottom on mobile. The navbar uses shadcn ghost Buttons and Tooltips inside a translucent, blurred glass navigation panel; social icons have no background panel. Desktop routes include text labels, while mobile navigation stays compact. The current page retains its accent-colored sliding highlight; other controls use neutral ghost hover states. Page changes have no fade or slide animation. The shared portfolio background uses React Bits’ `ShapeGrid` with drifting rounded tiles, a white cursor trail, and click ripples. Reduced-motion preferences disable the drift and intro animation.

## Browser desktop

Visit `/-` for Rynnie OS, a standalone browser desktop that starts with no windows open. Listening, Ask, and Developing are available from desktop shortcuts and the taskbar. Files, Terminal, Settings, Portfolio, and New tab remain available in the launcher. Listening has its own searchable library, Ask has an anonymous mail composer, and Developing has a project explorer and contribution calendar. These are native WebOS interfaces that share data APIs with the site; no site pages are embedded. Portfolio and New tab also use compact desktop views. Notes is no longer included. The interface uses shared shadcn Cards, Buttons, Tabs, Selects, Switches, and Dropdown Menus with monochrome surfaces and small corner radii, and the same live Spotify-derived accent as the portfolio. Discord and Spotify widgets appear at the top right on desktop.

Windows support dragging within the workspace, focus, minimize, maximize, restore, and close, with animations that respect reduced-motion preferences. Minimized apps retain their contents. Show Desktop toggles between hiding and restoring windows. Search the launcher for apps or pages and press Enter to open the first result; Escape dismisses it. Listening and Developing have reload controls, and Terminal supports app launch commands and Up/Down command history. On mobile, apps fill the available workspace. The window animation preference is saved in this browser’s local storage and respects device reduced-motion settings. The terminal is a simulated command interface and does not execute shell commands. A bottom-left Desktop button on portfolio pages enters WebOS; its full-width bottom taskbar contains the launcher, app buttons, clock, and a power menu with Return to site, Restart desktop, and Cancel. There is no top bar. Switching between the site and desktop scales the current screen down, slides to the other workspace, and scales the new screen into place; ordinary site navigation stays instant. Reduced-motion preferences disable the slide, and browsers without view-transition support navigate normally. This route is excluded from search indexing.

## Brand logos

Brand artwork uses the `@logoforge` shadcn registry configured in `components.json`. Installed components live in `components/logos/`, with monochrome variants in navigation and status widgets and color variants in the technology stack. Last.fm, NameMC/Minecraft, and Elysia retain their existing artwork because LogoForge does not currently list them.

```bash
bunx --bun shadcn@latest registry add @logoforge
bunx --bun shadcn@latest add @logoforge/github
```

## Language

English is the default language. Use a URL fragment to choose explicitly:

- `/#th` or `/ask#th` for Thai.
- `/#en` or `/ask#en` for English.
- `/#lang=th` and `/#lang=en` are also accepted.

URLs without a language fragment display English, including when an older browser preference selected Thai. Navbar links carry the current language between pages. Section anchors such as `/#more` still work. The navbar has no language switcher button.

## Development

Use Bun **1.4.4**, as specified in [package.json](package.json).

```bash
bun install
bun run dev
```

Open [localhost:3000](http://localhost:3000). To use another port or access the site from another device:

```bash
bun run dev --hostname 0.0.0.0 --port 3001
```

Add the accessing hostname or IP to `allowedDevOrigins` in [next.config.ts](next.config.ts) when needed. Development and production builds regenerate the profile image manifest from `public/pfp/`.

Read [AGENTS.md](AGENTS.md) before changing code. This project uses the Next.js guides bundled in `node_modules/next/dist/docs/`.

## Server configuration

Set these optional variables in `.env.local` or your hosting provider's environment. Restart the server after changing them. Keep secret keys and webhook URLs out of client code and Git.

| Variable                       | Purpose                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `GITHUB_TOKEN`                 | Optional read-only token to increase GitHub API rate limits.                  |
| `SPICYLYRICS_API_KEY`          | Spicy Lyrics secret key, used only by the lyrics API route.                   |
| `LRC_RED_CONTACT_EMAIL`        | Public contact email included in requests to lrc.red, as required by its API. |
| `ASK_DISCORD_WEBHOOK_URL`      | Override the webhook for anonymous questions.                                 |
| `BIRTHDAY_DISCORD_WEBHOOK_URL` | Override the webhook for birthday wishes.                                     |

Configure your own webhooks when deploying a copy. The built-in webhook defaults are Base64-encoded, not encrypted.

The browser subscribes to `wss://api.rynni.cc/ws/spotify` for playback and `wss://api.rynni.cc/ws/discord` for presence. The subscriptions are managed in `app/lib/status-stream.ts`. Last.fm and GitHub use the HTTP handlers under `app/api/`. The contribution calendar requests the current UTC year from `github-contributions-api.jogruber.de`, which supplies GitHub’s full public calendar; repository data comes directly from GitHub.

The listening page uses the shared shadcn Card, Badge, Button, and Select components. Listening history and each ranking period load once per browser tab and are restored across navigation and reloads. Use Refresh to clear these session snapshots and fetch fresh data. The contribution calendar derives each day’s color intensity from its count relative to the busiest day of the year.

## Lyrics

The Spotify widget follows live playback and looks up lyrics providers in this order:

1. **[Spicy Lyrics](https://developers.spicylyrics.org/docs)** when `SPICYLYRICS_API_KEY` and a Spotify track ID are available.
2. **[lrc.red](https://lrc.red/api)** when `LRC_RED_CONTACT_EMAIL` is configured.
3. **[LRCLIB](https://lrclib.net/docs.txt)** as the final fallback; no API key is needed.

Unavailable or unconfigured providers are skipped. lrc.red results are matched by title, artist, and duration when available to avoid covers and differently timed versions. Its timed LRC files feed the widget; an unusable result continues to LRCLIB. Successful lookups are cached, and provider rate-limit cooldowns are respected.

The homepage Spotify widget sits above the about panel on the right. Above the “Listening [song] by [artist]” row, the widget shows the previous, current, and next lyric. The current line stays highlighted in the middle until the next sung line starts and the lyrics slide up. Only the first artist is displayed; long titles use smaller text and an ellipsis, with the full title available on hover. Song titles and artist names open their Spotify pages, falling back to Spotify search when the provider omits a direct link. It omits playback device details, the progress bar, and provider text. The lyric area keeps a fixed height. The current lyric can wrap onto two lines, and hovering a clipped lyric reveals its full text. Reduced-motion preferences disable the slide-up transition. Missing, loading, instrumental, unavailable, or unsynced lyrics leave the lyric area blank.

The browser receives normalized lyrics and provider/contributor credits. Provider credentials stay on the server.

## Browser start page

Set [rynni.cc/newtab](https://rynni.cc/newtab) or [rynni.cc/nt](https://rynni.cc/nt) as your browser's new-tab URL. Some browsers require an extension to customize this.

The page includes a local clock, greeting, Google/DuckDuckGo/Bing search, and up to eight shortcuts managed through **Customize**. Preferences stay in browser local storage.

A local still image appears before the wallpaper video loads. The video is muted, loops inline, and pauses when the tab is hidden. Reduced-motion preferences keep the still image until playback is requested. This route uses its own layout without portfolio navigation, effects, or status polling.

## Project map

| Area                                | Files                                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Homepage                            | `app/page.tsx`, `app/home.tsx`                                                                     |
| Portfolio shell and route selection | `app/components/layout/portfolio-shell.tsx`, `app/components/layout/route-shell.tsx`               |
| Navigation                          | `app/components/layout/portfolio-navbar.tsx`, `app/components/layout/portfolio-navbar.module.css`  |
| Background and effects              | `app/components/layout/site-background.tsx`, `app/components/effects/`                             |
| Language and preferences            | `app/components/settings/`, `app/lib/site-settings.ts`                                             |
| Status polling and adapters         | `app/hooks/use-portfolio-status.ts`, `app/lib/spotify.ts`, `app/lib/status-handler.ts`             |
| Listening dashboard                 | `app/listen/`, `app/api/listen/route.ts`, `app/lib/lastfm.ts`                                      |
| Lyrics UI and API                   | `app/components/status/spotify-widget.tsx`, `app/api/lyrics/route.ts`                              |
| Lyrics providers and timing         | `app/lib/spicy-lyrics.ts`, `app/lib/lrc-red.ts`, `app/lib/lyrics.ts`, `app/lib/lyrics-playback.ts` |
| Featured repositories               | `app/config/portfolio.ts`                                                                          |
| Profile images and manifest         | `public/pfp/`, `scripts/generate-pfp-manifest.mjs`, `app/generated/pfp-images.ts`                  |
| New-tab page and wallpaper          | `app/newtab/`, `public/newtab-wallpaper.webp`                                                      |
| Named redirect destinations         | `app/redirect/destinations.ts`                                                                     |
| Shared colors and typography        | `app/globals.css`                                                                                  |

## Routes and metadata

Permanent redirects:

| Alias                            | Destination    |
| -------------------------------- | -------------- |
| `/nt`                            | `/newtab`      |
| `/listening`, `/songs`, `/music` | `/listen`      |
| `/sitemap`, `/sm.xml`            | `/sitemap.xml` |

`/r/:path*` rewrites to `/redirect/:path*`. Named destinations are configured in `app/redirect/destinations.ts`; `/redirect?url=` accepts an HTTP or HTTPS destination.

The sitemap in [app/sitemap.ts](app/sitemap.ts) uses the Next.js metadata convention and includes home, developing, birthday, listening, ask, and every documentation page. It emits unique absolute URLs on the canonical production origin, `https://rynni.cc`. The new-tab page and WebOS are omitted. Sitemap URLs, page canonicals, and the robots declaration share `SITE_URL` in `app/lib/og/resolver.ts`; update that constant when changing the production domain.

Submit `https://rynni.cc/sitemap.xml` in Search Console under the matching domain or URL-prefix property.

Open Graph images are rendered at `/internal/og?path=/`, with the same page metadata used by the site. The registry lives in `app/lib/og/resolver.ts`, metadata generation in `app/lib/og/metadata.ts`, and the image template in `app/components/og/og-template.tsx`. Register additional public pages in `PUBLIC_PAGES` to give them matching previews. Unknown paths receive the generic preview.

## Markdown responses

Request a public page with `Accept: text/markdown` to receive its server-rendered main content as Markdown:

```bash
curl -H 'Accept: text/markdown' https://rynni.cc/
```

[proxy.ts](proxy.ts) handles negotiation and conversion. Browser and React navigation requests retain HTML. Markdown responses use `private, no-store` and vary by `Accept`; live widget data is limited to what is available in the server-rendered page.

## Checks

```bash
bun run lint
bunx tsc --noEmit
bun test
bun run format:check
bun run build
```

`bun run format` applies Prettier. Tests cover API behavior, provider fallbacks, lyric parsing and playback timing, status normalization, browser preferences, redirects, metadata, Markdown conversion, and date calculations.

## Deployment

Use a host with a Next.js server runtime, such as Vercel. API handlers and server-rendered responses require server execution; a static export does not provide the full site.

```bash
bun install
bun run build
bun run start
```

Configure the required environment variables on the host, including `LRC_RED_CONTACT_EMAIL` if lrc.red should be enabled. Local `.env.local` settings are not committed. The footer shows the deployment commit hash when available, falling back to the local Git commit at build time.

## Documentation

Visit `/docs` for Fumadocs guides covering setup, WebOS, and customization. Add MDX pages in `content/docs` and update `content/docs/meta.json` to control sidebar order. `app/lib/docs-source.ts` loads the collection; `/api/search` indexes its pages for the built-in search dialog. The documentation has its own responsive sidebar and table of contents.

## Performance

The initial stylesheet contains the Latin and Thai font faces. The complete Japanese, Simplified Chinese, Traditional Chinese, and Korean font collection remains in `app/font-cjk-*.css`. Each family loads when needed by page text, including live lyrics; glyph coverage determines whether a fallback family is needed. Language-specific font order is preserved. Documentation styles load through the `/docs` layout. Navigation prefetches on pointer, keyboard focus, or touch intent rather than downloading every destination at startup.

The Aurora background retains its shader, colors, introduction, and pointer interaction. It uses an OffscreenCanvas worker when supported and automatically falls back to the same renderer on the main thread if workers are unavailable or fail to start. It renders at up to 30 frames per second, caches palette calculations, skips transparent regions, and adjusts its canvas resolution after sustained missed frames. It still pauses offscreen or in hidden tabs and respects reduced motion. Text, artwork, and other page content keep their native resolution.
