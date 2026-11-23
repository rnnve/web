export type Language = "en" | "th";
export type SiteSettings = { language: Language };
// Earlier settings saved automatic defaults; only explicit choices belong here.
export const SETTINGS_KEY = "rynnie.site-settings.v2";
export const DEFAULT_SETTINGS: SiteSettings = {
  language: "en",
};

/** Punycode + Unicode hostnames that should open the site in Thai. */
export const THAI_IDN_HOSTS = [
  "xn--12c9d9bs.xn--o3cw4h",
  "ยูกิ.ไทย",
] as const;

export function languageFromHash(hash: string): Language | null {
  try {
    const value = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
    const match = value.match(/^(?:lang=)?(en|th)$/);
    return match ? (match[1] as Language) : null;
  } catch {
    return null;
  }
}

export function isThaiIdnHost(hostname: string): boolean {
  const host = hostname.trim().replace(/\.$/, "").toLowerCase();
  if (!host) return false;
  const bare = host.startsWith("www.") ? host.slice(4) : host;
  return (THAI_IDN_HOSTS as readonly string[]).some(
    (entry) => entry.toLowerCase() === bare,
  );
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
