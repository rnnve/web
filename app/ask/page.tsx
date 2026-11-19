import { IconMessageQuestion } from "@tabler/icons-react";
import LocalizedText from "../components/settings/localized-text";
import { generatePageMetadata } from "../lib/og/metadata";
import AskForm from "./ask-form";

export function generateMetadata() {
  return generatePageMetadata("/ask");
}

export default function AskPage() {
  return (
    <main className="mx-auto grid w-[min(880px,calc(100%-48px))] items-start gap-8 pb-24 max-[767px]:w-[calc(100%-32px)] max-[767px]:gap-6 max-[767px]:pb-32 lg:grid-cols-2">
      <header className="max-w-md">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconMessageQuestion size={14} stroke={1.75} aria-hidden="true" />
          <LocalizedText en="Anonymous note" th="ข้อความไม่ระบุชื่อ" />
        </p>
        <h1
          id="ask-title"
          className="text-3xl font-medium tracking-tight text-balance"
        >
          <LocalizedText en="Ask a question" th="ถามคำถาม" />
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          <LocalizedText
            en="Send one question. Your name is not included."
            th="ส่งคำถามได้หนึ่งข้อ โดยไม่ต้องใส่ชื่อ"
          />
        </p>
      </header>
      <section aria-labelledby="ask-title">
        <AskForm />
      </section>
    </main>
  );
}
