import type { Metadata } from "next";
import { IconMessageQuestion } from "@tabler/icons-react";
import LocalizedText from "../components/localized-text";
import AskForm from "./ask-form";
import "../styles/ask.css";

export const metadata: Metadata = {
  title: "Ask · Rynnie",
  description: "Send Rynnie an anonymous question.",
};

export default function AskPage() {
  return (
    <main className="ask-page">
      <section className="ask-content" aria-labelledby="ask-title">
        <span className="ask-icon" aria-hidden="true">
          <IconMessageQuestion size={30} stroke={1.5} />
        </span>
        <p className="ask-eyebrow">
          <LocalizedText en="A little conversation" th="มาคุยกันสักหน่อย" />
        </p>
        <h1 id="ask-title">
          <LocalizedText en="Ask me anything." th="ถามเราได้เลย" />
        </h1>
        <p className="ask-description">
          <LocalizedText
            en="Have a question? Leave it here anonymously."
            th="มีคำถามอะไรไหม ฝากไว้ได้เลยโดยไม่ต้องบอกชื่อ"
          />
        </p>
        <AskForm />
      </section>
    </main>
  );
}
