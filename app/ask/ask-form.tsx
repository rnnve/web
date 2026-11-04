"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useSiteSettings } from "../components/site-settings-provider";

const MAX_LENGTH = 1000;
const SENT_KEY = "rynnie.ask.sent";
const subscribe = () => () => {};

function alreadySent() {
  try {
    return sessionStorage.getItem(SENT_KEY) === "true";
  } catch {
    return false;
  }
}

export default function AskForm() {
  const { t } = useSiteSettings();
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const sentInSession = useSyncExternalStore<boolean | null>(
    subscribe,
    alreadySent,
    () => null,
  );
  const sent = sentInSession === true || status === "sent";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !question.trim() ||
      sentInSession === null ||
      sent ||
      status === "sending"
    )
      return;
    setStatus("sending");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!response.ok) throw new Error("Submission failed");
      try {
        sessionStorage.setItem(SENT_KEY, "true");
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
    <form className="ask-form" onSubmit={submit}>
      <label htmlFor="ask-question">{t("Your question", "คำถามของคุณ")}</label>
      <textarea
        id="ask-question"
        value={question}
        disabled={sentInSession === null || sent || status === "sending"}
        onChange={(event) => {
          setQuestion(event.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder={t("What would you like to ask?", "อยากถามอะไรเราดี?")}
        maxLength={MAX_LENGTH}
        rows={5}
        required
      />
      <div className="ask-form-bottom">
        <span className="ask-count">
          {question.length} / {MAX_LENGTH}
        </span>
        <button
          type="submit"
          disabled={
            sentInSession === null ||
            sent ||
            !question.trim() ||
            status === "sending"
          }
        >
          {status === "sending"
            ? t("Sending…", "กำลังส่ง…")
            : t("Send question", "ส่งคำถาม")}
          <IconArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="ask-feedback" role="status" aria-live="polite">
        {sent &&
          t(
            "Your question has been sent. You can send one question per visit.",
            "ส่งคำถามแล้ว ส่งได้หนึ่งคำถามต่อการเข้าชม ขอบคุณนะ!",
          )}
        {status === "error" &&
          t(
            "Couldn’t send your question. Please try again.",
            "ส่งคำถามไม่สำเร็จ ลองอีกครั้งนะ",
          )}
      </p>
    </form>
  );
}
