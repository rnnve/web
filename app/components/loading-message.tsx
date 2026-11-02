"use client";

import { useSiteSettings } from "./site-settings-provider";

export default function LoadingMessage() {
  const { t } = useSiteSettings();
  return (
    <p>{t("Good things are taking shape.", "สิ่งดี ๆ กำลังเป็นรูปเป็นร่าง")}</p>
  );
}
