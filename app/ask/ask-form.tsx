"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  embedded = false,
}: {
  variant?: "question" | "birthday";
  disabled?: boolean;
  embedded?: boolean;
}) {
  const birthday = variant === "birthday";
  const sentKey = birthday ? "rynnie.birthday.sent" : "rynnie.ask.sent";
  const inputId = birthday ? "birthday-message" : "ask-question";
  const formId = `${inputId}-form`;
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
  const locked =
    disabled || sentInSession === null || sent || status === "sending";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          birthday
            ? { message: question.trim() }
            : { question: question.trim() },
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

  const label = birthday ? t("Wish", "คำอวยพร") : t("Question", "คำถาม");
  const hint = birthday
    ? t("One message for this birthday.", "ข้อความเดียวสำหรับวันเกิดนี้")
    : t("One question for this visit.", "หนึ่งคำถามต่อการเข้าชม");
  const feedback = sent
    ? birthday
      ? t(
          "Wish sent. You can send one wish each visit.",
          "ส่งคำอวยพรแล้ว ส่งได้หนึ่งข้อความต่อการเข้าชม",
        )
      : t(
          "Question sent. You can send one question each visit.",
          "ส่งคำถามแล้ว ส่งได้หนึ่งคำถามต่อการเข้าชม",
        )
    : status === "error"
      ? birthday
        ? t(
            "The wish did not send. Try again.",
            "ส่งคำอวยพรไม่สำเร็จ ลองอีกครั้ง",
          )
        : t(
            "The question did not send. Try again.",
            "ส่งคำถามไม่สำเร็จ ลองอีกครั้ง",
          )
      : "";

  const fields = (
    <>
      <CardContent>
        <form id={formId} className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Textarea
              id={inputId}
              name={birthday ? "message" : "question"}
              value={question}
              disabled={locked}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={
                birthday
                  ? t("Write a short wish", "เขียนคำอวยพรสั้น ๆ")
                  : t("Write your question", "เขียนคำถามของคุณ")
              }
              maxLength={MAX_LENGTH}
              rows={6}
              required
              className="min-h-36"
            />
          </div>
          {feedback && (
            <p
              className="text-sm text-pretty text-muted-foreground"
              role="status"
            >
              {feedback}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {question.length} / {MAX_LENGTH}
        </span>
        <Button
          type="submit"
          form={formId}
          disabled={locked || !question.trim()}
        >
          {status === "sending"
            ? t("Sending", "กำลังส่ง")
            : birthday
              ? t("Send wish", "ส่งคำอวยพร")
              : t("Send question", "ส่งคำถาม")}
          <IconArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </>
  );

  if (embedded) return fields;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      {fields}
    </Card>
  );
}
