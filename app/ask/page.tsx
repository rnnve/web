import { generatePageMetadata } from "../lib/og/metadata";
import { IconMessageQuestion } from "@tabler/icons-react";
import LocalizedText from "../components/settings/localized-text";
import AskForm from "./ask-form";
import styles from "../viewport-pages.module.css";
export function generateMetadata() {
  return generatePageMetadata("/ask");
}
export default function AskPage() {
  return (
    <main className={`viewport-page ${styles.page} ${styles.ask}`}>
      <section className={styles.askContent} aria-labelledby="ask-title">
        <div className={styles.introduction}>
          <span className={styles.icon} aria-hidden="true">
            <IconMessageQuestion size={30} stroke={1.5} />
          </span>
          <p className={styles.eyebrow}>
            <LocalizedText en="A little conversation" th="มาคุยกันสักหน่อย" />
          </p>
          <h1 id="ask-title">
            <LocalizedText en="Ask me anything." th="ถามเราได้เลย" />
          </h1>
          <p className={styles.description}>
            <LocalizedText
              en="Have a question? Leave it here anonymously."
              th="มีคำถามอะไรไหม ฝากไว้ได้เลยโดยไม่ต้องบอกชื่อ"
            />
          </p>
        </div>
        <AskForm />
      </section>
    </main>
  );
}
