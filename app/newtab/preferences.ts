export type Shortcut = { name: string; url: string };
export const ENGINES = {
  google: { name: "Google", url: "https://www.google.com/search" },
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/" },
  bing: { name: "Bing", url: "https://www.bing.com/search" },
} as const;
export type Preferences = {
  engine: keyof typeof ENGINES;
  shortcuts: Shortcut[];
};
export const PREFERENCES_KEY = "rynnie.newtab.v1";
export const DEFAULT_PREFERENCES: Preferences = {
  engine: "google",
  shortcuts: [
    { name: "GitHub", url: "https://github.com/" },
    { name: "YouTube", url: "https://www.youtube.com/" },
    { name: "Gmail", url: "https://mail.google.com/" },
    { name: "ChatGPT", url: "https://chatgpt.com/" },
    { name: "Spotify", url: "https://open.spotify.com/" },
    { name: "Rynnie", url: "/" },
  ],
};

export function isSafeShortcut(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\"))
    return true;
  try {
    const parsed = new URL(url);
    return (
      ["https:", "http:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

export function parsePreferences(value: string | null): Preferences {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!parsed || typeof parsed !== "object") return DEFAULT_PREFERENCES;
    const preferences = parsed as Partial<Preferences>;
    const engine = Object.hasOwn(ENGINES, preferences.engine ?? "")
      ? preferences.engine!
      : "google";
    const shortcuts = Array.isArray(preferences.shortcuts)
      ? preferences.shortcuts
          .filter(
            (item): item is Shortcut =>
              !!item &&
              typeof item.name === "string" &&
              item.name.trim().length > 0 &&
              item.name.length <= 24 &&
              typeof item.url === "string" &&
              isSafeShortcut(item.url),
          )
          .slice(0, 8)
      : DEFAULT_PREFERENCES.shortcuts;
    return { engine, shortcuts };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
