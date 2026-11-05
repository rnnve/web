import type { Metadata } from "next";
import { IconCake } from "@tabler/icons-react";
import LocalizedText from "../components/localized-text";
import BirthdayCountdown from "./birthday-countdown";
import AskForm from "../ask/ask-form";
import "../styles/ask.css";
import "../styles/birthday.css";

export const metadata: Metadata = {
  title: "Birthday · Rynnie",
  description: "Counting down to Rynnie’s next birthday on December 31.",
};

export default function BirthdayPage() {
  return (
    <main className="birthday-page">
      <section className="birthday-content" aria-labelledby="birthday-title">
        <span className="birthday-icon" aria-hidden="true">
          <IconCake size={30} stroke={1.5} />
        </span>
        <p className="birthday-eyebrow">
          <LocalizedText
            en="A little closer, every second"
            th="ใกล้เข้ามาอีกนิดในทุกวินาที"
          />
        </p>
        <BirthdayCountdown />
      </section>
      <section
        className="birthday-wishes"
        aria-labelledby="birthday-wishes-title"
      >
        <h2 id="birthday-wishes-title">
          <LocalizedText
            en="Leave a birthday wish."
            th="ฝากคำอวยพรวันเกิดไว้หน่อย"
          />
        </h2>
        <p>
          <LocalizedText
            en="A little message for my birthday. Sent anonymously."
            th="ฝากข้อความเล็ก ๆ สำหรับวันเกิด ส่งแบบไม่ระบุตัวตน"
          />
        </p>
        <AskForm variant="birthday" />
      </section>
      <footer className="birthday-footer">
        <span>
          <LocalizedText en="December 31" th="31 ธันวาคม" />
        </span>
        <span>
          <LocalizedText
            en="13:12 · Bangkok (UTC+7)"
            th="13:12 · กรุงเทพฯ (UTC+7)"
          />
        </span>
      </footer>
    </main>
  );
}
