"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import styles from "./redirect.module.css";

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

  const hostname = destination ? new URL(destination).hostname : null;

  return (
    <main className={styles.page}>
      <Card
        className="w-full max-w-md"
        role={destination ? "status" : undefined}
      >
        <CardHeader>
          <span className="mb-2 grid size-9 place-items-center rounded-lg border bg-muted text-muted-foreground">
            <IconArrowUpRight size={16} aria-hidden="true" />
          </span>
          <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Rynnie / Link
          </p>
          <CardTitle className="text-2xl tracking-tight">
            {destination
              ? t("Taking you there…", "กำลังพาคุณไป…")
              : t("No valid destination", "ปลายทางไม่ถูกต้อง")}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {destination
              ? t(`Redirecting to ${hostname}`, `กำลังไปยัง ${hostname}`)
              : t(
                  "Add a valid http:// or https:// URL using ?url= to continue.",
                  "เพิ่ม URL ที่ขึ้นต้นด้วย http:// หรือ https:// ผ่าน ?url= เพื่อดำเนินการต่อ",
                )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {destination ? (
            <Button asChild>
              <a href={destination}>
                {t("Continue now", "ไปต่อเลย")}
                <IconArrowUpRight size={16} aria-hidden="true" />
              </a>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/">{t("Back to home", "กลับหน้าแรก")}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
