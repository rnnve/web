"use client";

import AgeCalculator from "./components/home/age-calculator";
import Image from "next/image";
import Link from "next/link";
import styles from "./home.module.css";
import { StatusIcon } from "./components/status/status-icon";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import { BIRTH_DATE } from "./lib/birthday";
import { useSiteSettings } from "./components/settings/site-settings-provider";
export default function Home() {
  const { language, t } = useSiteSettings();
  const { discord } = usePortfolioStatus();
  return (
    <main className="home-page" aria-label="Home">
      <section id="top" className={styles.hero}>
        <div className={styles.content}>
          <header className={styles.identity}>
            <h1>Rynnie{language === "en" ? "." : ""}</h1>
          </header>
          <div className={styles.overview}>
            <div className={styles.about}>
              <div
                className={styles.profile}
                role="group"
                aria-label={t("Discord profile", "โปรไฟล์ Discord")}
              >
                <span className={styles.avatar}>
                  {discord?.avatar ? (
                    <Image src={discord.avatar} alt="" fill sizes="32px" />
                  ) : (
                    <StatusIcon name="discord" size={18} />
                  )}
                  <span
                    className={styles.presence}
                    data-status={discord?.status ?? "offline"}
                    role="img"
                    aria-label={`Discord: ${discord?.status ?? "offline"}`}
                  />
                </span>
                <span className={styles.profileText}>
                  <strong>
                    {discord?.displayName ||
                      discord?.globalName ||
                      discord?.username ||
                      "Rynnie"}
                  </strong>
                  <span>@{discord?.username || "melrynni"}</span>
                </span>
              </div>
              <article className={styles.bio}>
                <p>
                  {language === "th" ? (
                    <>
                      เราอายุ{" "}
                      <strong>
                        <AgeCalculator birthDate={BIRTH_DATE} /> ปี เป็นนักพัฒนา
                        Semi-Full Stack
                      </strong>{" "}
                      ทำงานเกี่ยวกับ <strong>บอท Discord และเว็บไซต์</strong>{" "}
                      เป็นหลัก และออกแบบได้นิดหน่อย
                      ดูโปรเจกต์ส่วนใหญ่ของเราได้ที่{" "}
                      <Link href="/developing">หน้าผลงานและงานพัฒนา</Link>
                    </>
                  ) : (
                    <>
                      I&apos;m a{" "}
                      <strong>
                        <AgeCalculator birthDate={BIRTH_DATE} /> year old
                        Semi-Full Stack Developer
                      </strong>
                      . I mainly build{" "}
                      <strong>Discord bots and websites</strong>, with a little
                      design work too. You can find most of my projects on my{" "}
                      <Link href="/developing">Developing page</Link>.
                    </>
                  )}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
