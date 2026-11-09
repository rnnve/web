import type { Metadata } from "next";
import LyricsViewer from "./lyrics-viewer";

export const metadata: Metadata = {
  title: "Lyrics | Ryn",
  description: "Live lyrics for the song I’m listening to.",
  robots: { index: false, follow: false },
};

export default function LyricsPage() {
  return <LyricsViewer />;
}
