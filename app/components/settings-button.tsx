"use client";

import { useId, type RefObject } from "react";
import { IconSettings, IconX } from "@tabler/icons-react";
import { useSiteSettings } from "./site-settings-provider";
import "../styles/site-settings.css";

export default function SettingsButton({ onClick }: { onClick: () => void }) {
  const { t } = useSiteSettings();
  return (
    <button
      type="button"
      className="site-settings-trigger"
      aria-label={t("Settings", "การตั้งค่า")}
      aria-haspopup="dialog"
      onClick={onClick}
    >
      <IconSettings size={21} aria-hidden="true" />
    </button>
  );
}

export function SettingsDialog({
  dialogRef,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
}) {
  const titleId = useId();
  const {
    language,
    setLanguage,
    backgroundAnimation,
    setBackgroundAnimation,
    t,
  } = useSiteSettings();
  return (
    <dialog
      ref={dialogRef}
      className="site-settings-dialog"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.close();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            event.currentTarget.close();
        }
      }}
    >
      <div className="site-settings-panel">
        <header className="site-settings-heading">
          <h2 id={titleId}>{t("Settings", "การตั้งค่า")}</h2>
          <button
            type="button"
            className="site-settings-trigger"
            aria-label={t("Close settings", "ปิดการตั้งค่า")}
            onClick={() => dialogRef.current?.close()}
          >
            <IconX size={21} aria-hidden="true" />
          </button>
        </header>
        <label className="site-settings-row">
          <span>
            <strong>
              {t("Background animation", "ภาพเคลื่อนไหวพื้นหลัง")}
            </strong>
            <small>
              {t(
                "Animate the page and loading backgrounds.",
                "เปิดภาพเคลื่อนไหวพื้นหลังหน้าเว็บและหน้าจอโหลด",
              )}
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={backgroundAnimation}
            onChange={(event) => setBackgroundAnimation(event.target.checked)}
          />
        </label>
        <fieldset className="site-settings-language">
          <legend>{t("Language", "ภาษา")}</legend>
          <div>
            <label>
              <input
                type="radio"
                name={`language-${titleId}`}
                value="en"
                checked={language === "en"}
                onChange={() => setLanguage("en")}
              />
              <span lang="en">EN · English</span>
            </label>
            <label>
              <input
                type="radio"
                name={`language-${titleId}`}
                value="th"
                checked={language === "th"}
                onChange={() => setLanguage("th")}
              />
              <span lang="th">TH · ไทย</span>
            </label>
          </div>
        </fieldset>
        <p className="site-settings-note">
          {t(
            "Your preferences are saved on this device.",
            "บันทึกการตั้งค่าไว้บนอุปกรณ์นี้",
          )}
        </p>
      </div>
    </dialog>
  );
}
