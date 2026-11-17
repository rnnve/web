import { GeistMono } from "geist/font/mono";
import LetterGlitch from "../effects/letter-glitch";

export default function SiteBackground() {
  return (
    <div
      className={`site-background fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background ${GeistMono.className}`}
      aria-hidden="true"
    >
      <LetterGlitch
        glitchColors={["#ffffff", "#ffffff"]}
        glitchAmount={0.5}
        speed={0.55}
        flow={0.5}
        clickEffect="tear"
        fontFamily={GeistMono.style.fontFamily}
      />
    </div>
  );
}
