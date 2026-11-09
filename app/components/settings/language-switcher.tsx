"use client";

import { useSiteSettings } from "./site-settings-provider";
export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useSiteSettings();
  const nextLanguage = language === "en" ? "th" : "en";
  return (
    <button
      type="button"
      className="language-switcher [min-width:52px] [height:44px] inline-flex items-center justify-center [border:1px_solid_var(--border)] [border-radius:12px] [color:var(--text)] [background:var(--surface-raised)] [font-size:12px] [font-weight:700] [letter-spacing:0.4px] cursor-pointer [&:hover]:[background:var(--surface-hover)] [&:active]:[opacity:0.85]"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={t(
        "EN: Switch language to Thai",
        "ไทย: เปลี่ยนภาษาเป็นอังกฤษ",
      )}
      title={t("Switch to Thai", "เปลี่ยนเป็น English")}
    >
      {language === "en" ? "EN" : "ไทย"}
    </button>
  );
}
