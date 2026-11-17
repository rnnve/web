"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  languageFromHash,
  detectLanguage,
  parseSettings,
  type Language,
  type SiteSettings,
} from "../../lib/site-settings";

const CHANGE_EVENT = "rynnie-settings-change";
let snapshot: SiteSettings | undefined;
function getSnapshot() {
  if (!snapshot) {
    const fallback = detectLanguage(
      navigator.languages.length ? navigator.languages : [navigator.language],
    );
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(SETTINGS_KEY);
    } catch {
      /* Browser locale still works when storage is unavailable. */
    }
    snapshot = parseSettings(saved, fallback);
  }
  return snapshot;
}
function getServerSnapshot() {
  return DEFAULT_SETTINGS;
}
function subscribe(listener: () => void) {
  const onLocaleChange = () => {
    snapshot = undefined;
    listener();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_KEY || event.key === null) {
      snapshot = undefined;
      listener();
    }
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  window.addEventListener("languagechange", onLocaleChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("languagechange", onLocaleChange);
  };
}
function updateSettings(patch: Partial<SiteSettings>) {
  snapshot = { ...getSnapshot(), ...patch };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(snapshot));
  } catch {
    /* Keep the explicit choice in memory when storage is unavailable. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
const SettingsContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (english: string, thai: string) => string;
} | null>(null);

export default function SiteSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const settings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  useEffect(() => {
    document.documentElement.lang = settings.language;
    if (languageFromHash(window.location.hash)) {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search,
      );
    }
  }, [settings.language]);
  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setLanguage: (language) => updateSettings({ language }),
        t: (english, thai) => (settings.language === "th" ? thai : english),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const settings = useContext(SettingsContext);
  if (!settings)
    throw new Error("useSiteSettings requires SiteSettingsProvider");
  return settings;
}
