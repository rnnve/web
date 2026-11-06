"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
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
    <form
      className="ask-form [padding:24px] [border:1px_solid_var(--line)] [border-radius:28px] [background:var(--md-sys-color-surface-container)] [&_label]:block [&_label]:[margin-bottom:12px] [&_label]:[font-size:14px] [&_label]:[font-weight:650] [&_textarea]:block [&_textarea]:[width:100%] [&_textarea]:[min-height:150px] [&_textarea]:[padding:16px] [&_textarea]:[resize:vertical] [&_textarea]:[border:1px_solid_var(--md-sys-color-outline-variant)] [&_textarea]:[border-radius:16px] [&_textarea]:[background:var(--md-sys-color-surface-container-low)] [&_textarea]:[color:var(--ink)] [&_textarea]:[line-height:1.6] [&_textarea:focus-visible]:[outline:2px_solid_var(--md-sys-color-primary)] [&_textarea:focus-visible]:[outline-offset:2px] [&_button]:[min-height:48px] [&_button]:[padding:0_20px] [&_button]:inline-flex [&_button]:items-center [&_button]:justify-center [&_button]:[gap:8px] [&_button]:[border:0] [&_button]:[border-radius:24px] [&_button]:[background:var(--md-sys-color-primary)] [&_button]:[color:var(--md-sys-color-on-primary)] [&_button]:[font-weight:650] [&_button]:cursor-pointer [&_button:disabled]:[opacity:0.5] [&_button:disabled]:[cursor:not-allowed] max-[601px]:[padding:20px]"
      onSubmit={submit}
    >
      <label htmlFor={inputId}>
        {birthday
          ? t("Your birthday wish", "คำอวยพรวันเกิดของคุณ")
          : t("Your question", "คำถามของคุณ")}
      </label>
      <textarea
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
      <div className="ask-form-bottom flex items-center justify-between [gap:16px] [margin-top:16px]">
        <span className="ask-count [color:var(--ink-soft)] [font-size:12px] [font-variant-numeric:tabular-nums]">
          {question.length} / {MAX_LENGTH}
        </span>
        <button
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
          <IconArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p
        className="ask-feedback [min-height:1.5em] [margin:16px_0_0] [color:var(--ink-soft)] [font-size:13px]"
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
  );
}
