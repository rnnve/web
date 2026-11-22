"use client";

import { Suspense, use } from "react";
import LiveStatus from "./components/status/live-status";
import AgeCalculator from "./components/home/age-calculator";
import Link from "./components/layout/intent-link";
import styles from "./home.module.css";
import { BIRTH_DATE } from "./lib/birthday";
import type { loadDiscordProfile } from "./lib/discord-profile";
import type { DiscordProfile } from "./lib/status-types";
import { useSiteSettings } from "./components/settings/site-settings-provider";

function ProfileStatus({
  profile,
}: {
  profile: ReturnType<typeof loadDiscordProfile>;
}) {
  const discord = use(profile);
  return (
    <LiveStatus
      initialDiscord={discord?.profile ?? null}
      discordUpdatedAt={discord?.updatedAt ?? 0}
    />
  );
}

export default function Home({
  initialNow,
  initialDiscord = null,
  discordUpdatedAt = 0,
  profile,
}: {
  initialNow?: number;
  initialDiscord?: DiscordProfile | null;
  discordUpdatedAt?: number;
  profile?: ReturnType<typeof loadDiscordProfile>;
}) {
  const { language } = useSiteSettings();
  return (
    <main className="home-page" aria-label="Home">
      <section id="top" className={styles.hero}>
        <div className={styles.content}>
          <header className={styles.identity}>
            <h1>Rynnie{language === "en" ? "." : ""}</h1>
          </header>
          <div className={styles.overview}>
            <div className={styles.about}>
              <article className={styles.bio}>
                <p>
                  {language === "th" ? (
                    <>
                      เราอายุ{" "}
                      <strong>
                        <AgeCalculator
                          birthDate={BIRTH_DATE}
                          initialNow={initialNow}
                        />{" "}
                        ปี เป็นนักพัฒนา Semi-Full Stack
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
                        <AgeCalculator
                          birthDate={BIRTH_DATE}
                          initialNow={initialNow}
                        />{" "}
                        years old Semi-Full Stack Developer
                      </strong>
                      . I mainly build{" "}
                      <strong>Discord bots and websites</strong>, with a little
                      design work too. You can find most of my projects on my{" "}
                      <Link href="/developing">Developing page</Link>.
                    </>
                  )}
                </p>
              </article>
              {profile ? (
                <Suspense
                  fallback={
                    <LiveStatus
                      initialDiscord={initialDiscord}
                      discordUpdatedAt={discordUpdatedAt}
                    />
                  }
                >
                  <ProfileStatus profile={profile} />
                </Suspense>
              ) : (
                <LiveStatus
                  initialDiscord={initialDiscord}
                  discordUpdatedAt={discordUpdatedAt}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
