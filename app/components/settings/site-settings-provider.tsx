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
  type Language,
  type SiteSettings,
} from "../../lib/site-settings";

const CHANGE_EVENT = "rynnie-settings-change";
let snapshot: SiteSettings | undefined;
function getSnapshot() {
  if (!snapshot) {
    snapshot = {
      language:
        languageFromHash(window.location.hash) ?? DEFAULT_SETTINGS.language,
    };
  }
  return snapshot;
}
function getServerSnapshot() {
  return DEFAULT_SETTINGS;
}
function subscribe(listener: () => void) {
  const onHashChange = () => {
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
  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("popstate", onHashChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("popstate", onHashChange);
  };
}
function updateSettings(patch: Partial<SiteSettings>) {
  snapshot = { ...getSnapshot(), ...patch };
  if (patch.language) window.location.hash = patch.language;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(snapshot));
  } catch {
    /* Keep preferences usable when storage is unavailable. */
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
    try {
      window.localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ language: settings.language }),
      );
    } catch {
      /* URL selection still works when browser storage is unavailable. */
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
