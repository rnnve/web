# Rynnie

My personal website: a portfolio, live listening activity, synchronized lyrics, and a browser start page. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

[Website](https://rynni.cc) · [New Tab](https://rynni.cc/newtab) · [Previous versions](https://git.rynni.cc/rinne/site-archived)

## Pages

| Route       | What it does                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `/`         | Introduction, live Spotify and Discord status, GitHub activity, selected repositories, and technology stack.  |
| `/listen`   | Last.fm listening history, current or last played track, and track/artist rankings across selectable periods. |
| `/lyrics`   | Experimental lyrics viewer for the currently playing Spotify song.                                            |
| `/birthday` | Birthday countdown in Bangkok time and anonymous wishes during the birthday window.                           |
| `/ask`      | Anonymous questions delivered to Discord.                                                                     |
| `/newtab`   | Clock, search, shortcuts, and a video wallpaper for a browser start page.                                     |
| `/redirect` | Redirect screen for named destinations or a URL supplied through `?url=`.                                     |

The portfolio uses a custom glassmorphism theme with translucent panels, fine borders, Geist typography, and plain CSS controls. It defaults to English and supports Thai through URL language selection, with a compact navigation rail on the left on desktop and a dock at the bottom on mobile. Only the current page has a background highlight; other icons brighten on hover. Page changes have no fade or slide animation. The background uses React Bits’ `PatternWaves` silk preset with subtle white marks and interactive cursor ripples. Background and cursor effects respect motion preferences; the wave renderer pauses while the tab is hidden.

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

Spotify, Discord, and Last.fm data currently come from configured public endpoints at `api.rynni.cc`; GitHub data comes from GitHub's API. Change the corresponding handlers under `app/api/` to use different accounts or services.

## Lyrics

The `/lyrics` viewer follows live Spotify playback and looks up providers in this order:

1. **[Spicy Lyrics](https://developers.spicylyrics.org/docs)** when `SPICYLYRICS_API_KEY` and a Spotify track ID are available.
2. **[lrc.red](https://lrc.red/api)** when `LRC_RED_CONTACT_EMAIL` is configured.
3. **[LRCLIB](https://lrclib.net/docs.txt)** as the final fallback; no API key is needed.

Unavailable or unconfigured providers are skipped. lrc.red results are matched by title, artist, and duration when available to avoid covers and differently timed versions. Its timed LRC files feed the viewer; an unusable result continues to LRCLIB. Successful lookups are cached, and provider rate-limit cooldowns are respected.

Timed lyrics highlight the current line in white and other lines in gray. **Following song** toggles automatic scrolling. The playback clock filters repeated samples and small timing differences while handling seeks and song changes. Plain lyrics are shown when timing is unavailable, with separate states for instrumental tracks, missing lyrics, and service failures.

The homepage Spotify widget shows the previous, current, and next lyric on the right, with the current lyric always in the middle. It omits playback device details, the progress bar, and provider text. Long lyric lines pan horizontally instead of being cut off; reduced-motion users can scroll them manually. The preview opens `/lyrics` for the full view, and both views share cached lyrics requests.

The browser receives normalized lyrics and provider/contributor credits. Provider credentials stay on the server. `/lyrics` is experimental, has `noindex` metadata, and is omitted from the sitemap.

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
| Lyrics UI and API                   | `app/lyrics/`, `app/api/lyrics/route.ts`                                                           |
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

The sitemap in [app/sitemap.ts](app/sitemap.ts) includes home, birthday, listening, and ask. New-tab and lyrics pages have `noindex` metadata and are omitted. Update the canonical site URL and sitemap configuration when deploying under a different domain.

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
