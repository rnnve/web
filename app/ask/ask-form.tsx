"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings } from "../components/settings/site-settings-provider";
const MAX_LENGTH = 1000;
const subscribe = () => () => {};
function alreadySent(key: string) {
  try {
    return sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}
export default function AskForm({
  variant = "question",
  disabled = false,
}: {
  variant?: "question" | "birthday";
  disabled?: boolean;
}) {
  const birthday = variant === "birthday";
  const sentKey = birthday ? "rynnie.birthday.sent" : "rynnie.ask.sent";
  const inputId = birthday ? "birthday-message" : "ask-question";
  const { t } = useSiteSettings();
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const sentInSession = useSyncExternalStore<boolean | null>(
    subscribe,
    () => alreadySent(sentKey),
    () => null,
  );
  const sent = sentInSession === true || status === "sent";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      disabled ||
      !question.trim() ||
      sentInSession === null ||
      sent ||
      status === "sending"
    )
      return;
    setStatus("sending");
    try {
      const response = await fetch(birthday ? "/api/birthday" : "/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          birthday
            ? {
                message: question.trim(),
              }
            : {
                question: question.trim(),
              },
        ),
      });
      if (!response.ok) throw new Error("Submission failed");
      try {
        sessionStorage.setItem(sentKey, "true");
      } catch {
        // The current page still stays locked if browser storage is unavailable.
      }
      setQuestion("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }
  return (
    <Card className="ask-form ring-0">
      <form className="grid gap-3" onSubmit={submit}>
        <Label htmlFor={inputId}>
          {birthday
            ? t("Your birthday wish", "คำอวยพรวันเกิดของคุณ")
            : t("Your question", "คำถามของคุณ")}
        </Label>
        <Textarea
          id={inputId}
          value={question}
          disabled={
            disabled || sentInSession === null || sent || status === "sending"
          }
          onChange={(event) => {
            setQuestion(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={
            birthday
              ? t(
                  "Leave a little birthday message…",
                  "ฝากคำอวยพรวันเกิดไว้ได้เลย…",
                )
              : t("What would you like to ask?", "อยากถามอะไรเราดี?")
          }
          maxLength={MAX_LENGTH}
          rows={5}
          required
        />
        <div className="ask-form-bottom flex items-center justify-between gap-4">
          <span className="ask-count text-xs text-muted-foreground tabular-nums">
            {question.length} / {MAX_LENGTH}
          </span>
          <Button
            type="submit"
            disabled={
              disabled ||
              sentInSession === null ||
              sent ||
              !question.trim() ||
              status === "sending"
            }
          >
            {status === "sending"
              ? t("Sending…", "กำลังส่ง…")
              : birthday
                ? t("Send birthday wish", "ส่งคำอวยพร")
                : t("Send question", "ส่งคำถาม")}
            <IconArrowUpRight size={16} aria-hidden="true" />
          </Button>
        </div>
        <p
          className="ask-feedback min-h-6 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {sent &&
            (birthday
              ? t(
                  "Your birthday wish has been sent. Thank you! You can send one wish per visit.",
                  "ส่งคำอวยพรแล้ว ขอบคุณนะ! ส่งได้หนึ่งคำอวยพรต่อการเข้าชม",
                )
              : t(
                  "Your question has been sent. You can send one question per visit.",
                  "ส่งคำถามแล้ว ส่งได้หนึ่งคำถามต่อการเข้าชม ขอบคุณนะ!",
                ))}
          {status === "error" &&
            (birthday
              ? t(
                  "Couldn’t send your birthday wish. Please try again.",
                  "ส่งคำอวยพรไม่สำเร็จ ลองอีกครั้งนะ",
                )
              : t(
                  "Couldn’t send your question. Please try again.",
                  "ส่งคำถามไม่สำเร็จ ลองอีกครั้งนะ",
                ))}
        </p>
      </form>
    </Card>
  );
}
