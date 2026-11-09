"use client";

import { useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "../components/feedback/loading-screen";
import { useSiteSettings } from "../components/settings/site-settings-provider";

export default function RedirectScreen({
  destination,
}: {
  destination: string | null;
}) {
  const { t } = useSiteSettings();
  useEffect(() => {
    if (!destination) return;
    const timer = window.setTimeout(() => {
      window.location.replace(destination);
    }, 2_000);
    return () => window.clearTimeout(timer);
  }, [destination]);

  if (!destination)
    return (
      <main className="grid min-h-svh place-content-center gap-4 p-6 text-center">
        <h1 className="m-0 text-2xl">
          {t("No valid destination", "ปลายทางไม่ถูกต้อง")}
        </h1>
        <p className="m-0 text-(--text-muted)">
          {t(
            "Add a valid http:// or https:// URL using ?url= to continue.",
            "เพิ่ม URL ที่ขึ้นต้นด้วย http:// หรือ https:// ผ่าน ?url= เพื่อดำเนินการต่อ",
          )}
        </p>
        <Link href="/">{t("Back to home", "กลับหน้าแรก")}</Link>
      </main>
    );

  return (
    <LoadingScreen
      overlay
      durationMs={2_000}
      heading={t("Taking you there…", "กำลังพาคุณไป…")}
      message={t(
        `Redirecting to ${new URL(destination).hostname}`,
        `กำลังไปยัง ${new URL(destination).hostname}`,
      )}
    />
  );
}
