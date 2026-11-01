# Ryn's personal site

A personal site built with Next.js, React, and Tailwind CSS. Designed by me, with coding help from Codex.

[Older versions of the site](https://git.rynni.cc/rinne/site-archived)

## Local development

Use Bun, the package manager configured for this project:

```bash
bun install
bun run dev
```

The profile-picture manifest is generated automatically before development and production builds from the images in `public/pfp`. Update that folder rather than editing `app/generated/pfp-images.ts`.

## Finding your way around

| Location                            | Responsibility                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `app/page.tsx`                      | Homepage layout and introduction                                             |
| `app/layout.tsx`                    | Site metadata, fonts, global styles, and shared effects                      |
| `app/components/`                   | Widgets, navigation, loading screen, and visual effects                      |
| `app/hooks/use-portfolio-status.ts` | Live data requests, loading states, polling, and last-played Spotify storage |
| `app/lib/spotify.ts`                | Converts different Spotify payload formats into one widget view              |
| `app/lib/github.ts`                 | Selects repositories and builds activity graph cells                         |
| `app/lib/status-types.ts`           | Shared widget data types                                                     |
| `app/lib/status-handler.ts`         | Status API caching, request deduplication, and fallbacks                     |
| `app/config/portfolio.ts`           | Featured repository names in display order                                   |
| `app/api/`                          | Discord, Spotify, GitHub, and profile-image endpoints                        |
| `app/globals.css`                   | Base styles and shared site styling                                          |
| `app/styles/`                       | Homepage, theme, loading, and effect styles                                  |
| `scripts/generate-pfp-manifest.mjs` | Generates the profile-image list                                             |
| `tests/status.test.ts`              | Regression checks for data adapters and API fallbacks                        |

Each service widget has its own component: `discord-widget.tsx`, `spotify-widget.tsx`, and `github-widget.tsx`. `status-widgets.tsx` keeps their existing named exports available.

The status hook polls Discord every 15 seconds, Spotify every second, and GitHub every 5 minutes while the page is visible. Returning to the tab refreshes all three immediately. Widget API requests begin from HTML preload hints before hydration. Discord uses Next.js's persistent fetch cache with a 15-second refresh interval. Spotify bypasses browser, server, and response CDN caching so song changes are picked up on the next one-second poll. Discord responses also advertise short shared-CDN caching with background revalidation; GitHub advertises a 60-second shared cache. Actual freshness can include both the upstream cache age and CDN age.

Discord and Spotify upstream requests time out after 3 seconds without a blocking retry. Concurrent requests share the same in-flight fetch, and failures retain a process-local last successful value without caching empty errors. Browser requests have a 6-second deadline and also share overlapping requests.

Recent widget snapshots are restored from session storage for up to 5 minutes while live requests refresh them. Restored Spotify data appears as last played until playback is confirmed by a live response. Clearing or blocking browser storage does not prevent live widgets from loading.

## Background

The fixed background uses the supplied React Bits `PatternWaves` component with `ogl`. Adjust its preset, opacity, wave speed, and cursor settings in `app/components/site-background.tsx`. The renderer lives in `app/components/pattern-waves.jsx`, with styles in `app/styles/pattern-waves.css`.

The pattern loads in a separate browser bundle, stays behind page content, and uses a capped rendering resolution. Animation pauses in hidden tabs and becomes static when reduced motion is enabled. Browsers without WebGL2 keep the plain site background. Images, logos, and status colors keep their original colors.

## Navigation

`app/components/portfolio-navbar.tsx` composes the Aceternity Resizable Navbar with the site's section links, profile image, GitHub, and Socials. The reusable exports are in `app/components/ui/resizable-navbar.tsx`; `app/lib/utils.ts` provides the `clsx` and `tailwind-merge` class helper.

The navbar is fixed near the top of the viewport and contracts after 100 pixels of scrolling. Below the reference's `lg` breakpoint, it uses a mobile menu that closes on navigation, Escape, or an outside click. Motion is reduced when requested by the operating system. Tailwind's dark variant follows the site's `data-theme` attribute.

Reference adaptations:

- The primitives live under `app/components/ui`, with `cn` under `app/lib`, matching this repository's aliases and layout. The existing `PortfolioNavbar` serves as the integration instead of adding the demo's dummy page content.
- The caller selects fixed positioning with a 16-pixel top offset rather than the demo's sticky positioning. The reference's desktop/mobile widths, Tailwind utilities, spring settings, and normal-motion hover treatment are retained.
- The logo uses the site's local random profile image, Rynnie branding, and Next.js `Image`/`Link`; the sample Features/Pricing/Contact/Login/Book a call content is replaced with real section links, GitHub, and Socials.
- The mobile toggle is a labeled button with expanded/control attributes. The menu's provided `onClose` now handles Escape and outside clicks, and section links close it on selection.
- MotionConfig and reduced-motion checks disable resize/menu animation when requested; the supplied source did not include explicit preference handling. Tailwind's dark selector follows `data-theme` rather than system color preference, matching the site's existing theme.
- The old navbar-collapse stylesheet and its layout import were removed so the previous animation does not affect the new component.

## Cursor effect

`app/components/cursor-effects.tsx` configures the supplied React Bits `TargetCursor`: a rotating reticle that locks onto links, buttons, and elements with `.cursor-target`. Add `data-cursor-label` to a target for an optional hover label. There are no trails, glow canvases, or click bursts.

The component is in `app/components/target-cursor.jsx`, with styles in `app/styles/target-cursor.css`. It loads separately, lets clicks pass through, and uses the normal cursor for touch input or reduced motion. It pauses in hidden tabs and restores the system cursor when leaving the page.

`app/components/crosshair.jsx` supplies a separate viewport crosshair, enabled alongside TargetCursor in `cursor-effects.tsx`. Its guide lines and coordinates follow the pointer directly, with a gap around the reticle. TargetCursor handles target brackets; Crosshair's own target lock, click pulses, and smoothing are disabled. Both components share the touch and reduced-motion preference gate.

## Checking and formatting changes

```bash
bun run lint
bunx tsc --noEmit
bun test
bun run format:check
bun run build
```

Run `bun run format` to format source files consistently. Generated files, build output, and dependency files are excluded from formatting.

## Vercel deployment

Deploy the repository as a standard Next.js project. The site uses a fixed dark monochrome palette and does not require theme-related environment variables or external storage.

Optionally set `GITHUB_TOKEN` to a read-only GitHub token so the public activity graph and repository cards are not constrained by GitHub's low unauthenticated API rate limit. The site retains usable GitHub fallbacks when the token is absent.
