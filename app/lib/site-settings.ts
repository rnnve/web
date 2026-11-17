export type Language = "en" | "th";
export type SiteSettings = { language: Language };
// Earlier settings saved automatic defaults; only explicit choices belong here.
export const SETTINGS_KEY = "rynnie.site-settings.v2";
export const DEFAULT_SETTINGS: SiteSettings = {
  language: "en",
};

export function languageFromHash(hash: string): Language | null {
  try {
    const value = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
    const match = value.match(/^(?:lang=)?(en|th)$/);
    return match ? (match[1] as Language) : null;
  } catch {
    return null;
  }
}

export function detectLanguage(locales: readonly string[]): Language {
  for (const locale of locales) {
    const language = locale.toLowerCase().split("-")[0];
    if (language === "en" || language === "th") return language;
  }
  return DEFAULT_SETTINGS.language;
}

export function parseSettings(
  value: string | null,
  fallback: Language = DEFAULT_SETTINGS.language,
): SiteSettings {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!parsed || typeof parsed !== "object") return { language: fallback };
    const settings = parsed as Partial<SiteSettings>;
    return {
      language:
        settings.language === "en" || settings.language === "th"
          ? settings.language
          : fallback,
    };
  } catch {
    return { language: fallback };
  }
}
