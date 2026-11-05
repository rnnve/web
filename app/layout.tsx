import type { Metadata, Viewport } from "next";
import RouteShell from "./components/route-shell";
import favicon from "./icon.webp";
import "./globals.css";

export const metadata: Metadata = {
  title: "rynnie",
  description: "Ryn's personal site.",
  icons: {
    icon: [{ url: favicon.src, type: "image/webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <RouteShell>{children}</RouteShell>
      </body>
    </html>
  );
}
