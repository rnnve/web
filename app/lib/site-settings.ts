export type Language = "en" | "th";
export type SiteSettings = { language: Language };
export const SETTINGS_KEY = "rynnie.site-settings.v1";
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

export function parseSettings(value: string | null): SiteSettings {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    const settings = parsed as Partial<SiteSettings>;
    return {
      language:
        settings.language === "en" || settings.language === "th"
          ? settings.language
          : DEFAULT_SETTINGS.language,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
