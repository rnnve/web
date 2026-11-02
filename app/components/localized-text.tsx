"use client";

import { useSiteSettings } from "./site-settings-provider";

export default function LocalizedText({ en, th }: { en: string; th: string }) {
  const { t } = useSiteSettings();
  return <>{t(en, th)}</>;
}
