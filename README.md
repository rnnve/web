# Rynnie

A personal corner of the web: a portfolio, live activity, and a browser start page. Built with Next.js, React, TypeScript, and Tailwind CSS.

[Visit the site](https://rynni.cc) · [Open New Tab](https://rynni.cc/newtab) · [Previous versions](https://git.rynni.cc/rinne/site-archived)

## Todo
[] Currently playing status Lyrics viewer

## Explore

| Page      | URL         | Features                                                                                                         |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Home      | `/`         | Introduction, Discord presence, Spotify playback, GitHub activity, featured repositories, and technology stacks. |
| Birthday  | `/birthday` | Birthday countdown using Bangkok time and anonymous birthday wishes.                                             |
| Listening | `/listen`   | Current track, recent listening, and weekly favorites from Last.fm.                                              |
| Ask       | `/ask`      | Send an anonymous question to Discord.                                                                           |
| New Tab   | `/newtab`   | Local clock, web search, personal shortcuts, and a live video wallpaper.                                         |

The portfolio includes English and Thai text, Material 3 styling, and scroll snapping between the homepage’s three sections. Background and cursor effects adapt to motion preferences and device capabilities.

Navigation stays fixed above the scrolling content, including the last section. The desktop row shows up to three page links; additional pages appear in a More dropdown. The phone menu lists all pages.

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

| Variable                       | Purpose                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`                 | Increase GitHub API rate limits for repository and activity requests. Use a read-only token. |
| `ASK_DISCORD_WEBHOOK_URL`      | Set the Discord webhook that receives anonymous questions. Overrides the built-in fallback.  |
| `BIRTHDAY_DISCORD_WEBHOOK_URL` | Override the built-in webhook for anonymous birthday wishes from `/birthday`.                |

When deploying your own copy, configure your own webhooks. The defaults in the server source are Base64-encoded, not encrypted.

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

## Markdown for agents

Public pages support content negotiation. Request the same URL with `Accept: text/markdown` to receive Markdown with `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`. Browsers keep HTML by default; API responses, assets, sitemaps, and React navigation requests keep their original formats.

```bash
curl -i -H 'Accept: text/markdown' https://rynni.cc/
curl -i -H 'Accept: text/html' https://rynni.cc/
```

`proxy.ts` fetches the page's server-rendered HTML and converts its main content, preserving headings, links, and page metadata while omitting scripts, navigation, and form controls. Live widgets remain limited to the content present in server-rendered HTML. Markdown responses use `private, no-store` so shared caches do not mix them with browser pages. Token counts are not emitted because a model-specific tokenizer is not configured.

This runs in the application and does not require Cloudflare. If the domain is later proxied through Cloudflare, its optional [Markdown for Agents setting](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) can provide conversion at the edge instead.

## Performance and accessibility

The portfolio loading screen uses a static CSS pattern and the existing symbol artwork, without a canvas renderer. It starts a 180 ms fade on the first hydrated frame, with no minimum display timer and no wait for live widgets. The heading renders directly instead of animating individual letters. The dotted page background uses a small SVG texture with a CSS transform animation; touch devices and reduced-motion preferences get a static texture instead of a full-screen WebGL renderer.

The GitHub showcase and technology stack are memoized so Spotify polling does not rebuild them every second. GitHub date labels share one formatter per language. Discord avatars use Next.js image optimization, and page zoom remains enabled.

## Check changes

```bash
bun run lint
bunx tsc --noEmit
bun test
bun run format:check
bun run build
```

Use `bun run format` to apply Prettier. Tests cover data normalization, API behavior, browser preferences, and date calculations. Generated files, dependencies, and build output are excluded from formatting.

## Open Graph previews

Public pages share their metadata with the PNG renderer at `/internal/og?path=/birthday` (1200×630). `app/lib/og/resolver.ts` is the source for page titles and descriptions, `app/lib/og/metadata.ts` builds absolute Open Graph and Twitter image URLs, and `app/components/og/og-template.tsx` controls the dark grid design. The home page's interactive content lives in `app/home.tsx` so its server page can export metadata.

When adding a public route, register its pattern and content loader in `PUBLIC_PAGES` and call `generatePageMetadata()` from the page's `generateMetadata()`. Patterns such as `/projects/[slug]` receive decoded route parameters; reuse the same public data loader as the page. Only registered routes can supply image content. No user-specific preferences, anonymous messages, arbitrary URLs, or private routes are loaded.

Try `/internal/og?path=/`, `/internal/og?path=/birthday`, or `/internal/og?path=/listen`. Unknown routes receive the generic site image; malformed paths or unsupported query parameters receive a fallback PNG with HTTP 400. Successful images use a one-day shared cache, unknown routes a one-minute cache, and errors are not cached. Images render locally with `next/og` and the existing Geist fonts; the endpoint needs the Node.js server runtime. `SITE_URL` in the resolver is the canonical origin for all social image URLs.

The project currently has no dynamic content pages. Resolver tests cover `[slug]` sources, missing records, and loader failures without adding placeholder routes.

## Deploy

Deploy to Vercel or another host with a Next.js server runtime. Install dependencies with Bun, set any environment variables, and run `bun run build`. API routes need server execution, so a static-only export does not provide the full site.

The portfolio footer displays the deployment commit when available, falling back to the local Git commit at build time.
