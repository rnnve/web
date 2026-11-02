export type Language = "en" | "th";
export type SiteSettings = { language: Language; backgroundAnimation: boolean };
export const SETTINGS_KEY = "rynnie.site-settings.v1";
export const DEFAULT_SETTINGS: SiteSettings = {
  language: "en",
  backgroundAnimation: true,
};

export function parseSettings(value: string | null): SiteSettings {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    const settings = parsed as Partial<SiteSettings>;
    return {
      language: settings.language === "th" ? "th" : "en",
      backgroundAnimation:
        typeof settings.backgroundAnimation === "boolean"
          ? settings.backgroundAnimation
          : true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
