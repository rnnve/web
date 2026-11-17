"use client";

import { Button } from "@/components/ui/button";
import { useSiteSettings } from "./site-settings-provider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useSiteSettings();
  return (
    <div
      role="group"
      aria-label={t("Language", "ภาษา")}
      className="flex gap-1 rounded-lg border border-border bg-background/90 p-1 text-xs font-semibold backdrop-blur-lg"
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        lang="en"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className="h-8 aria-pressed:bg-accent"
      >
        English
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        lang="th"
        aria-pressed={language === "th"}
        onClick={() => setLanguage("th")}
        className="h-8 aria-pressed:bg-accent"
      >
        ไทย
      </Button>
    </div>
  );
}
