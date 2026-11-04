"use client";

import { useSiteSettings } from "./site-settings-provider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useSiteSettings();
  const nextLanguage = language === "en" ? "th" : "en";

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={t("Switch language to Thai", "เปลี่ยนภาษาเป็นอังกฤษ")}
      title={t("Switch to Thai", "เปลี่ยนเป็น English")}
    >
      {language === "en" ? "EN" : "ไทย"}
    </button>
  );
}
