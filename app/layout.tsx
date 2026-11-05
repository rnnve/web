import type { Metadata, Viewport } from "next";
import RouteShell from "./components/route-shell";
import SiteFooter from "./components/site-footer";
import favicon from "./icon.webp";
import "./globals.css";
import { HOME_CONTENT, SITE_URL } from "./lib/og/resolver";
export const metadata: Metadata = {
  title: HOME_CONTENT.title,
  description: HOME_CONTENT.description,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      {
        url: favicon.src,
        type: "image/webp",
      },
    ],
  },
};
export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="[&_*]:box-border [scrollbar-width:none] [scroll-behavior:smooth] [background:var(--md-sys-color-surface)] [color:var(--md-sys-color-on-surface)] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:[width:0] [&::-webkit-scrollbar]:[height:0] [&_body::-webkit-scrollbar]:hidden [&_body::-webkit-scrollbar]:[width:0] [&_body::-webkit-scrollbar]:[height:0] [&_.root-empty]:[min-height:100svh] [&_button]:[font:inherit] [&_button]:[-webkit-tap-highlight-color:transparent] [&_input]:[font:inherit] [&_textarea]:[font:inherit] [&_select]:[font:inherit] [&_a]:[-webkit-tap-highlight-color:transparent] [&_button:focus-visible]:[outline:3px_solid_var(--md-sys-color-primary)] [&_button:focus-visible]:[outline-offset:3px] [&_a:focus-visible]:[outline:3px_solid_var(--md-sys-color-primary)] [&_a:focus-visible]:[outline-offset:3px] [&_.reveal-ready_[data-reveal]]:[opacity:0] [&_.reveal-ready_[data-reveal]]:[transform:translateY(38px)_scale(0.985)] [&_.reveal-ready_[data-reveal]]:[transform-origin:center_top] [&_.reveal-ready_[data-reveal]]:[transition:opacity_0.72s_cubic-bezier(0.22,_1,_0.36,_1),_transform_0.82s_cubic-bezier(0.22,_1,_0.36,_1)] [&_.reveal-ready_[data-reveal]]:[will-change:opacity,_transform] [&_.reveal-ready_[data-reveal].is-revealed]:[opacity:1] [&_.reveal-ready_[data-reveal].is-revealed]:[transform:translateY(0)_scale(1)] motion-reduce:[&_.reveal-ready_[data-reveal]]:[transition:none] [&_.contact_>_p:not(.eyebrow)]:relative [&_.contact_>_p:not(.eyebrow)]:[z-index:2] [&_.contact_>_p:not(.eyebrow)]:[max-width:560px] [&_.contact_>_p:not(.eyebrow)]:[margin:25px_0_0] [&_.contact_>_p:not(.eyebrow)]:[color:#c7ddcc] [&_.contact_>_p:not(.eyebrow)]:[font-size:14px] [&_.contact_>_p:not(.eyebrow)]:[line-height:1.7] motion-reduce:[&_*]:[scroll-behavior:auto]! motion-reduce:[&_*]:[animation-duration:0.01ms]! motion-reduce:[&_*]:[animation-iteration-count:1]! motion-reduce:[&_*]:[transition-duration:0.01ms]! motion-reduce:[&_*::before]:[scroll-behavior:auto]! motion-reduce:[&_*::before]:[animation-duration:0.01ms]! motion-reduce:[&_*::before]:[animation-iteration-count:1]! motion-reduce:[&_*::before]:[transition-duration:0.01ms]! motion-reduce:[&_*::after]:[scroll-behavior:auto]! motion-reduce:[&_*::after]:[animation-duration:0.01ms]! motion-reduce:[&_*::after]:[animation-iteration-count:1]! motion-reduce:[&_*::after]:[transition-duration:0.01ms]! [@media(hover:_none),_(pointer:_coarse)]:[&_a:hover]:[transform:none] [@media(hover:_none),_(pointer:_coarse)]:[&_button:hover]:[transform:none] [&:has(.home-page)]:[scroll-snap-type:y_proximity] motion-reduce:[scroll-behavior:auto] motion-reduce:[&:has(.home-page)]:[scroll-snap-type:none] [&_.status\\_online]:[background:#55d991] [&_.status\\_idle]:[background:#f2b84b] [&_.status\\_dnd]:[background:#f06570] [&_.status\\_offline]:[background:#73747c] [&_body]:[background:var(--md-sys-color-surface)] [&_body]:[color:var(--md-sys-color-on-surface)] [&_.root-empty]:[min-height:100svh] [&_.root-empty_.homeAvatar]:[width:76px] [&_.root-empty_.homeAvatar]:[border-color:var(--md-sys-color-primary)] [&_.root-empty_.homeAvatar]:[background-color:var(--md-sys-color-primary)] [&_.root-empty_.homeAvatar]:[box-shadow:none] [&_.root-empty_.homeLoading]:[gap:16px] [&_.root-empty_.homeLoading_div]:[min-height:112px] [&_.root-empty_.homeLoading_div]:[border:0] [&_.root-empty_.homeLoading_div]:[border-radius:var(--md-shape-extra-large)] [&_.root-empty_.homeLoading_div]:[background:linear-gradient(_105deg,_var(--md-sys-color-surface-container)_25%,_var(--md-sys-color-surface-container-high)_40%,_var(--md-sys-color-surface-container)_55%_)] [&_.root-empty_.homeLoading_div]:[background-size:240%_100%] [&_.root-empty_.homeLoading_div:last-child]:[min-height:112px] [&_.root-empty_.homeLoading_div:last-child]:[border:0] [&_.root-empty_.homeLoading_div:last-child]:[border-radius:var(--md-shape-extra-large)] [&_.root-empty_.homeLoading_div:last-child]:[background:linear-gradient(_105deg,_var(--md-sys-color-surface-container)_25%,_var(--md-sys-color-surface-container-high)_40%,_var(--md-sys-color-surface-container)_55%_)] [&_.root-empty_.homeLoading_div:last-child]:[background-size:240%_100%] [&_.root-empty_.developer-tools\\_\\_grid]:[gap:16px] [&_.root-empty_.developer-tool\\_\\_logo]:[width:48px] [&_.root-empty_.developer-tool\\_\\_logo]:[height:48px] [&_.root-empty_.developer-tool\\_\\_logo]:[padding:8px] [&_.root-empty_.developer-tool\\_\\_logo]:[border-radius:var(--md-shape-medium)] [&_.root-empty_.developer-tool\\_\\_logo]:[background:var(--md-sys-color-surface-container-highest)] [&_.root-empty_.developer-tool\\_\\_logo]:[filter:none] max-[521px]:[&_.root-empty_.developer-tools\\_\\_grid]:[grid-template-columns:1fr] [&:has(.nt-page)]:[overscroll-behavior:none] [&_body:has(.nt-page)]:[overscroll-behavior:none]"
    >
      <body className="has-[[data-loading-overlay]]:overflow-hidden [margin:0] [overflow-x:hidden] [background:var(--paper)] [color:var(--ink)] [font-family:var(--font-site)] [min-height:100svh]">
        <RouteShell>
          {children}
          <SiteFooter />
        </RouteShell>
      </body>
    </html>
  );
}
