"use client";

import { useEffect, useState } from "react";
import { IconLock } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AskForm from "../ask/ask-form";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import { getBirthdayWishWindow } from "../lib/birthday";

export default function BirthdayWishForm() {
  const { language, t } = useSiteSettings();
  const [wishWindow, setWishWindow] = useState<ReturnType<
    typeof getBirthdayWishWindow
  > | null>(null);

  useEffect(() => {
    const update = () => setWishWindow(getBirthdayWishWindow(Date.now()));
    update();
    const timer = globalThis.setInterval(update, 1_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      globalThis.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const locked = !wishWindow?.isOpen;
  const date = wishWindow
    ? new Intl.DateTimeFormat(
        language === "th" ? "th-TH-u-ca-gregory" : "en-US",
        {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Bangkok",
        },
      ).format(wishWindow.isOpen ? wishWindow.closesAt : wishWindow.opensAt)
    : null;

  return (
    <Card className="h-full min-h-0 overflow-auto">
      <CardHeader>
        <CardTitle id="birthday-wishes-title">
          {locked
            ? t("Wishes are closed", "ยังไม่เปิดรับคำอวยพร")
            : t("Leave a wish", "ฝากคำอวยพร")}
        </CardTitle>
        <CardDescription>
          {locked
            ? date
              ? t(
                  `Opens ${date}, Bangkok time. Open for 48 hours.`,
                  `เปิด ${date} เวลากรุงเทพฯ เปิดรับ 48 ชั่วโมง`,
                )
              : t(
                  "One anonymous message. The box opens for 48 hours from the birthday.",
                  "ข้อความไม่ระบุชื่อหนึ่งข้อความ เปิดรับ 48 ชั่วโมงนับจากวันเกิด",
                )
            : t(
                `Open until ${date}. One anonymous message.`,
                `เปิดถึง ${date} ส่งได้หนึ่งข้อความโดยไม่ระบุชื่อ`,
              )}
        </CardDescription>
      </CardHeader>
      {locked ? (
        <CardContent className="flex flex-1">
          <div
            role="status"
            className="flex flex-1 items-center gap-3 rounded-lg bg-muted/60 px-4 py-8 text-sm text-pretty text-muted-foreground"
          >
            <IconLock size={18} stroke={1.75} aria-hidden="true" />
            {date
              ? t(
                  "Wishes are closed until then.",
                  "ยังส่งคำอวยพรไม่ได้จนกว่าจะถึงเวลานั้น",
                )
              : t("Checking when wishes open.", "กำลังตรวจว่าจะเปิดเมื่อใด")}
          </div>
        </CardContent>
      ) : (
        <AskForm variant="birthday" embedded />
      )}
    </Card>
  );
}
