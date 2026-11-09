"use client";

import { useSiteSettings } from "../settings/site-settings-provider";

export default function LoadingMessage() {
  const { t } = useSiteSettings();
  return (
    <p className="m-0 mt-[11px] text-sm italic text-(--text-muted)">
      {t("Good things are taking shape.", "สิ่งดี ๆ กำลังเป็นรูปเป็นร่าง")}
    </p>
  );
}
