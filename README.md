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

| Location                            | Responsibility                                                  |
| ----------------------------------- | --------------------------------------------------------------- |
| `app/page.tsx`                      | Homepage layout and introduction                                |
| `app/layout.tsx`                    | Site metadata, fonts, global styles, and shared effects         |
| `app/components/`                   | Widgets, navigation, loading screen, and visual effects         |
| `app/hooks/use-portfolio-status.ts` | Live data requests, loading states, and polling                 |
| `app/lib/spotify.ts`                | Converts different Spotify payload formats into one widget view |
| `app/lib/github.ts`                 | Selects repositories and builds activity graph cells            |
| `app/lib/status-types.ts`           | Shared widget data types                                        |
| `app/lib/status-handler.ts`         | Status API caching, request deduplication, and fallbacks        |
| `app/config/portfolio.ts`           | Featured repository names in display order                      |
| `app/api/`                          | Discord, Spotify, GitHub, and profile-image endpoints           |
| `app/globals.css`                   | Base styles and shared site styling                             |
| `app/styles/`                       | Homepage, theme, loading, and effect styles                     |
| `scripts/generate-pfp-manifest.mjs` | Generates the profile-image list                                |
| `tests/status.test.ts`              | Regression checks for data adapters and API fallbacks           |

Each service widget has its own component: `discord-widget.tsx`, `spotify-widget.tsx`, and `github-widget.tsx`. `status-widgets.tsx` keeps their existing named exports available.

The status hook polls Discord every 15 seconds, Spotify every second, and GitHub every 5 minutes while the page is visible. Returning to the tab refreshes all three immediately. Widget API requests begin from HTML preload hints before hydration. Discord uses Next.js's persistent fetch cache with a 15-second refresh interval. Spotify bypasses browser, server, and response CDN caching so song changes are picked up on the next one-second poll. Discord responses also advertise short shared-CDN caching with background revalidation; GitHub advertises a 60-second shared cache. Actual freshness can include both the upstream cache age and CDN age.

Discord and Spotify upstream requests time out after 3 seconds without a blocking retry. Concurrent requests share the same in-flight fetch, and failures retain a process-local last successful value without caching empty errors. Browser requests have a 6-second deadline and also share overlapping requests.

Recent Discord and GitHub snapshots are restored from session storage for up to 5 minutes while live requests refresh them. Spotify waits for live playback status and shows “Nothing is playing” when stopped or paused, without restoring a last-played track. Clearing or blocking browser storage does not prevent live widgets from loading.

## Background

The fixed background uses the supplied React Bits `PatternWaves` component with `ogl`. Adjust its preset, opacity, wave speed, and cursor settings in `app/components/site-background.tsx`. The renderer lives in `app/components/pattern-waves.jsx`, with styles in `app/styles/pattern-waves.css`.

The pattern loads in a separate browser bundle, stays behind page content, and uses a capped rendering resolution. Animation pauses in hidden tabs and becomes static when reduced motion is enabled. Browsers without WebGL2 keep the plain site background. Images, logos, and status colors keep their original colors.

## Navigation

`app/components/portfolio-navbar.tsx` composes the navbar with the site's section links, profile image, GitHub, and Socials. The reusable exports are in `app/components/ui/resizable-navbar.tsx`; `app/lib/utils.ts` provides the `clsx` and `tailwind-merge` class helper.

The Material 3 styling lives in `app/styles/material-navbar.css` and uses the site's shared surface, text, shape, and elevation tokens. The navbar has opaque surfaces, pill-shaped navigation indicators, icons, filled and tonal actions, and a selected section that follows scrolling. Profile images retain their original colors.

The desktop bar contracts from 1120 to 860 pixels after 100 pixels of scrolling, with its maximum width constrained to the viewport. Below 1024 pixels, it becomes a compact top app bar and rounded menu. The menu closes on navigation, Escape, or an outside click. Reduced-motion settings disable resizing and menu animation.

The component began with the supplied Aceternity Resizable Navbar composition. Its exports, Motion resizing, real site links, local profile image via Next.js `Image`/`Link`, and accessible mobile controls are retained. Its visual styling now uses Material 3 tokens rather than the reference's transparent/blurred surfaces and Tailwind color defaults.

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
