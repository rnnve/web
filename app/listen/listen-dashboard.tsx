"use client";

import { useEffect, useState } from "react";
import {
  IconArrowUpRight,
  IconHeadphones,
  IconMusic,
  IconVinyl,
} from "@tabler/icons-react";
import { useSiteSettings } from "../components/site-settings-provider";
import type { ListenData, ListenItem } from "../lib/lastfm";
function Artwork({
  item,
  large = false,
}: {
  item: ListenItem;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const placeholder = item.image.includes("2a96cbd8b46e442fc41c2b86b821562f");
  return (
    <span
      className={`listen-art [flex:0_0_auto] [width:48px] [aspect-ratio:1] grid [place-items:center] overflow-hidden [border-radius:13px] [background:var(--md-sys-color-surface-container-highest)] [color:var(--ink-soft)] [&_img]:[width:100%] [&_img]:[height:100%] [&_img]:[object-fit:cover]${large ? " listen-art--large" : ""}`}
    >
      {item.image && !placeholder && !failed ? (
        // External album artwork is supplied by Last.fm.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          loading={large ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      ) : (
        <IconMusic size={large ? 48 : 20} aria-hidden="true" />
      )}
    </span>
  );
}
function ItemList({
  items,
  kind,
}: {
  items: ListenItem[];
  kind: "recent" | "ranked";
}) {
  const { t, language } = useSiteSettings();
  if (!items.length)
    return (
      <p className="listen-empty [color:var(--ink-soft)] [line-height:1.6] [font-size:14px]">
        {t("Nothing to show yet.", "ยังไม่มีข้อมูลในตอนนี้")}
      </p>
    );
  return (
    <ol className="listen-list [padding:8px_18px] [margin:0] [list-style:none] [border-radius:24px] [background:var(--md-sys-color-surface-container)] [&_li_+_li]:[border-top:1px_solid_var(--line)] [&_li_>_a]:[min-height:74px] [&_li_>_a]:flex [&_li_>_a]:items-center [&_li_>_a]:[gap:14px] [&_li_>_a]:[color:var(--ink)] [&_li_>_a]:[text-decoration:none] [&_li_>_div]:[min-height:74px] [&_li_>_div]:flex [&_li_>_div]:items-center [&_li_>_div]:[gap:14px] [&_li_>_div]:[color:var(--ink)] [&_li_>_div]:[text-decoration:none] max-[651px]:[padding-inline:12px] max-[651px]:[&_li_>_a]:[gap:10px] max-[651px]:[&_li_>_div]:[gap:10px]">
      {items.map((entry, index) => {
        const body = (
          <>
            <span className="listen-rank [width:24px] [flex-shrink:0] [color:var(--ink-soft)] [font-size:11px] [font-variant-numeric:tabular-nums]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Artwork item={entry} />
            <span className="listen-item-copy [.listen-list_li_>_a:hover_&_strong]:[text-decoration:underline] [flex:1] [min-width:0] grid [gap:4px] [&_strong]:overflow-hidden [&_strong]:[text-overflow:ellipsis] [&_strong]:whitespace-nowrap [&_strong]:[font-size:14px] [&_strong]:[font-weight:650] [&_small]:overflow-hidden [&_small]:[text-overflow:ellipsis] [&_small]:whitespace-nowrap [&_small]:[color:var(--ink-soft)] [&_small]:[font-size:12px]">
              <strong>{entry.name}</strong>
              {entry.artist && <small>{entry.artist}</small>}
            </span>
            <span className="listen-item-meta [color:var(--ink-soft)] [font-size:12px] [flex-shrink:0]">
              {kind === "ranked" && entry.plays !== null
                ? t(`${entry.plays} plays`, `${entry.plays} ครั้ง`)
                : entry.nowPlaying
                  ? t("Playing", "กำลังเล่น")
                  : entry.timestamp
                    ? new Intl.DateTimeFormat(
                        language === "th" ? "th-TH" : "en",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      ).format(new Date(entry.timestamp * 1000))
                    : ""}
            </span>
          </>
        );
        return (
          <li key={`${entry.url}-${entry.timestamp ?? ""}-${index}`}>
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noreferrer">
                {body}
              </a>
            ) : (
              <div>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
function ListeningSkeleton() {
  const { t } = useSiteSettings();
  return (
    <div
      role="status"
      aria-label={t("Loading listening activity", "กำลังโหลดข้อมูลการฟัง")}
    >
      <div aria-hidden="true">
        <div className="listen-spotlight grid [grid-template-columns:minmax(140px,_280px)_minmax(0,_1fr)] items-center [gap:clamp(20px,_4vw,_40px)] [padding:clamp(20px,_3vw,_32px)] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:36px] [background:var(--md-sys-color-surface-container-high)] [box-shadow:0_16px_40px_#0003] [&_h2]:[margin:18px_0_8px] [&_h2]:[font-size:clamp(24px,_3.5vw,_38px)] [&_h2]:[line-height:1.15] [&_h2]:[letter-spacing:-0.04em] [&_h2]:[overflow-wrap:anywhere] [&_h2_a]:[color:inherit] [&_h2_a]:[text-decoration:none] [&_h2_a:hover]:[text-decoration:underline] max-[651px]:[grid-template-columns:minmax(88px,_38%)_minmax(0,_1fr)] max-[651px]:[gap:16px] max-[651px]:[padding:16px] max-[651px]:[border-radius:26px] max-[651px]:[&_h2]:[margin-top:12px] max-[651px]:[&_h2]:[font-size:clamp(19px,_5vw,_27px)] listen-skeleton-spotlight">
          <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-art [width:100%] [aspect-ratio:1] [border-radius:20px] max-[651px]:[border-radius:16px]" />
          <div className="listen-skeleton-copy grid [justify-items:start] [gap:16px] max-[651px]:[gap:10px]">
            <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-label [width:110px] [height:12px] max-[651px]:[width:80px]" />
            <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-title [width:min(90%,_360px)] [height:42px] [margin-top:6px] max-[651px]:[height:26px]" />
            <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-subtitle [width:150px] [height:16px] max-[651px]:[width:min(75%,_150px)]" />
          </div>
        </div>
        <div className="listen-section [margin-top:80px] [min-width:0] max-[651px]:[margin-top:60px]">
          <div className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-heading [width:220px] [height:32px] [margin-bottom:22px]" />
          <div className="listen-skeleton-list [padding:8px_18px] [border-radius:24px] [background:var(--md-sys-color-surface-container)]">
            {Array.from(
              {
                length: 4,
              },
              (_, index) => (
                <div
                  className="listen-skeleton-row [min-height:74px] flex items-center [gap:14px] [.listen-skeleton-row_+_&]:[border-top:1px_solid_var(--line)]"
                  key={index}
                >
                  <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-thumb [width:48px] [height:48px] [flex:0_0_auto] [border-radius:13px]" />
                  <div className="listen-skeleton-row-copy [flex:1] grid [gap:8px]">
                    <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-row-title [width:min(55%,_260px)] [height:14px]" />
                    <span className="listen-skeleton block [border-radius:8px] [background:linear-gradient(_105deg,_var(--md-sys-color-surface-container-highest)_25%,_var(--md-sys-color-surface-bright)_40%,_var(--md-sys-color-surface-container-highest)_55%_)] [background-size:240%_100%] [animation:listen-skeleton-shimmer_1.6s_ease-in-out_infinite] motion-reduce:[animation:none] listen-skeleton-row-subtitle [width:min(35%,_140px)] [height:11px]" />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ListenDashboard() {
  const { t } = useSiteSettings();
  const [data, setData] = useState<ListenData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/listen", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unavailable");
        const result = (await response.json()) as ListenData;
        if (active) {
          setData(result);
          setError(false);
        }
      } catch (error) {
        if (active && !(error instanceof Error && error.name === "AbortError"))
          setError(true);
      }
    };
    const refresh = () => {
      if (!document.hidden) void load();
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const current = data?.current;
  return (
    <main className="listen-page [width:min(960px,_calc(100%_-_48px))] [margin:0_auto] [padding:calc(146px_+_env(safe-area-inset-top,_0px))_0_48px] max-[651px]:[width:calc(100%_-_32px)] max-[651px]:[padding-top:calc(120px_+_env(safe-area-inset-top,_0px))]">
      <header className="listen-heading flex justify-between [align-items:end] [gap:20px] [margin-bottom:36px] [&_h1]:[margin:18px_0_12px] [&_h1]:[font-size:clamp(48px,_8vw,_88px)] [&_h1]:[line-height:1.05] [&_h1]:[font-weight:650] [&_h1]:[letter-spacing:-0.055em] [&_h1_span]:[color:var(--md-sys-color-outline)] [&_p]:[margin:0] [&_p]:[color:var(--ink-soft)] [&_p]:[line-height:1.6] max-[651px]:[align-items:start] max-[651px]:[&_h1]:[font-size:48px]">
        <div className="[min-width:0] [flex:1]">
          <span className="listen-kicker inline-flex items-center [gap:8px] [color:var(--ink-soft)] [font-size:11px] [font-weight:700] [letter-spacing:0.12em]">
            <IconHeadphones size={16} />{" "}
            {t("A LITTLE LISTENING LOG", "บันทึกเพลงที่ฟัง")}
          </span>
          <h1>
            {t("My Listening", "เพลงที่เราฟัง")}
            <span>.</span>
          </h1>
          <p>
            {t(
              "A little peek at what I’ve been listening to.",
              "แวะมาดูเพลงที่เราฟังกัน",
            )}
          </p>
        </div>
        {data?.profile?.url && (
          <a
            className="listen-profile inline-flex items-center justify-center [gap:8px] [padding:13px_20px] [border:1px_solid_var(--line)] [border-radius:999px] [color:var(--ink)] [background:var(--md-sys-color-surface-container)] [text-decoration:none] whitespace-nowrap [font-size:13px] [font-weight:650] [&:hover]:[background:var(--md-sys-color-surface-container-highest)] max-[651px]:[padding:11px_14px]"
            href={data.profile.url}
            target="_blank"
            rel="noreferrer"
          >
            Last.fm <IconArrowUpRight size={17} />
          </a>
        )}
      </header>
      {error && (
        <p
          className="listen-alert [color:var(--ink-soft)] [line-height:1.6] [font-size:14px] [padding:14px_18px] [border:1px_solid_var(--line)] [border-radius:16px] [margin-bottom:20px]"
          role="status"
        >
          {data
            ? t(
                "Couldn’t refresh. Showing the last update.",
                "อัปเดตไม่สำเร็จ กำลังแสดงข้อมูลล่าสุด",
              )
            : t(
                "Listening activity is temporarily unavailable.",
                "ยังไม่สามารถโหลดข้อมูลเพลงได้",
              )}
        </p>
      )}
      {!data && !error && <ListeningSkeleton />}
      {data && (
        <>
          <section
            className={`listen-spotlight grid [grid-template-columns:minmax(140px,_280px)_minmax(0,_1fr)] items-center [gap:clamp(20px,_4vw,_40px)] [padding:clamp(20px,_3vw,_32px)] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:36px] [background:var(--md-sys-color-surface-container-high)] [box-shadow:0_16px_40px_#0003] [&_h2]:[margin:18px_0_8px] [&_h2]:[font-size:clamp(24px,_3.5vw,_38px)] [&_h2]:[line-height:1.15] [&_h2]:[letter-spacing:-0.04em] [&_h2]:[overflow-wrap:anywhere] [&_h2_a]:[color:inherit] [&_h2_a]:[text-decoration:none] [&_h2_a:hover]:[text-decoration:underline] max-[651px]:[grid-template-columns:minmax(88px,_38%)_minmax(0,_1fr)] max-[651px]:[gap:16px] max-[651px]:[padding:16px] max-[651px]:[border-radius:26px] max-[651px]:[&_h2]:[margin-top:12px] max-[651px]:[&_h2]:[font-size:clamp(19px,_5vw,_27px)]${current ? "" : " listen-spotlight--empty"}`}
            aria-labelledby="listen-current"
          >
            {current && <Artwork key={current.image} item={current} large />}
            <div className="listen-spotlight-copy [min-width:0]">
              <span className="listen-live inline-flex items-center [gap:9px] [color:var(--ink-soft)] [font-size:11px] [font-weight:700] [letter-spacing:0.1em] [&_i]:[width:8px] [&_i]:[height:8px] [&_i]:[border-radius:50%] [&_i]:[background:#b9ddc4] [&_i]:[box-shadow:0_0_0_4px_#b9ddc420]">
                <i />{" "}
                {data.unavailable.includes("current")
                  ? t("LISTENING STATUS", "สถานะการฟัง")
                  : current?.nowPlaying
                    ? t("NOW PLAYING", "กำลังฟัง")
                    : t("LAST PLAYED", "ฟังล่าสุด")}
              </span>
              {current ? (
                <>
                  <h2 id="listen-current">
                    {current.url ? (
                      <a href={current.url} target="_blank" rel="noreferrer">
                        {current.name}
                        <span className="listen-visually-hidden absolute [width:1px] [height:1px] [padding:0] [margin:-1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap [border:0]">
                          {" "}
                          {t("on Last.fm", "บน Last.fm")}
                        </span>
                      </a>
                    ) : (
                      current.name
                    )}
                  </h2>
                  <p className="listen-artist [color:var(--ink-soft)] [font-size:17px] max-[651px]:[font-size:14px]">
                    {current.artist}
                  </p>
                  {current.album && (
                    <p className="listen-album flex items-center [gap:8px] [color:var(--ink-soft)] [font-size:13px] [margin:20px_0_0] max-[651px]:[margin-top:10px] max-[651px]:[font-size:12px]">
                      <IconVinyl size={16} /> {current.album}
                    </p>
                  )}
                </>
              ) : (
                <h2 id="listen-current">
                  {data.unavailable.includes("current")
                    ? t(
                        "Listening status is unavailable right now.",
                        "ยังไม่สามารถโหลดสถานะการฟังได้",
                      )
                    : t("No recent track yet.", "ยังไม่มีเพลงที่ฟังล่าสุด")}
                </h2>
              )}
            </div>
          </section>
          {data.profile?.playcount !== null &&
            data.profile?.playcount !== undefined && (
              <p className="listen-total [margin:18px_2px_0] [font-weight:700] [font-size:14px] [&_span]:[color:var(--ink-soft)] [&_span]:[font-weight:400]">
                {data.profile.playcount.toLocaleString()}{" "}
                <span>{t("scrobbles and counting", "เพลงที่บันทึกไว้")}</span>
              </p>
            )}
          <section
            className="listen-section [margin-top:80px] [min-width:0] max-[651px]:[margin-top:60px]"
            aria-labelledby="listen-recent"
          >
            <div className="listen-section-heading flex [align-items:end] justify-between [gap:20px] [margin-bottom:22px] [&_span]:[color:var(--ink-soft)] [&_span]:[font-size:10px] [&_span]:[font-weight:700] [&_span]:[letter-spacing:0.1em] [&_h2]:[margin:9px_0_0] [&_h2]:[font-size:clamp(25px,_3vw,_34px)] [&_h2]:[letter-spacing:-0.04em] [&_h2]:[line-height:1.2] [&_p]:[margin:0] [&_p]:[color:var(--ink-soft)] [&_p]:[font-size:13px] max-[651px]:[&_p]:hidden">
              <div>
                <span>01 / {t("THE LATEST", "ล่าสุด")}</span>
                <h2 id="listen-recent">
                  {t("Recently played", "เพลงที่ฟังล่าสุด")}
                </h2>
              </div>
              <p>{t("The soundtrack lately.", "ซาวด์แทร็กช่วงนี้")}</p>
            </div>
            {data.unavailable.includes("recent") ? (
              <p className="listen-empty [color:var(--ink-soft)] [line-height:1.6] [font-size:14px]">
                {t(
                  "Recent tracks are unavailable right now.",
                  "ยังไม่สามารถโหลดเพลงล่าสุดได้",
                )}
              </p>
            ) : (
              <ItemList items={data.recent} kind="recent" />
            )}
          </section>
          <div className="listen-columns grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:24px] max-[651px]:[grid-template-columns:1fr] max-[651px]:[gap:0]">
            <section
              className="listen-section [margin-top:80px] [min-width:0] max-[651px]:[margin-top:60px]"
              aria-labelledby="listen-tracks"
            >
              <div className="listen-section-heading flex [align-items:end] justify-between [gap:20px] [margin-bottom:22px] [&_span]:[color:var(--ink-soft)] [&_span]:[font-size:10px] [&_span]:[font-weight:700] [&_span]:[letter-spacing:0.1em] [&_h2]:[margin:9px_0_0] [&_h2]:[font-size:clamp(25px,_3vw,_34px)] [&_h2]:[letter-spacing:-0.04em] [&_h2]:[line-height:1.2] [&_p]:[margin:0] [&_p]:[color:var(--ink-soft)] [&_p]:[font-size:13px] max-[651px]:[&_p]:hidden">
                <div>
                  <span>02 / {t("LAST 7 DAYS", "7 วันที่ผ่านมา")}</span>
                  <h2 id="listen-tracks">{t("Top tracks", "เพลงยอดนิยม")}</h2>
                </div>
              </div>
              {data.unavailable.includes("topTracks") ? (
                <p className="listen-empty [color:var(--ink-soft)] [line-height:1.6] [font-size:14px]">
                  {t(
                    "Top tracks are unavailable right now.",
                    "ยังไม่สามารถโหลดเพลงยอดนิยมได้",
                  )}
                </p>
              ) : (
                <ItemList items={data.topTracks} kind="ranked" />
              )}
            </section>
            <section
              className="listen-section [margin-top:80px] [min-width:0] max-[651px]:[margin-top:60px]"
              aria-labelledby="listen-artists"
            >
              <div className="listen-section-heading flex [align-items:end] justify-between [gap:20px] [margin-bottom:22px] [&_span]:[color:var(--ink-soft)] [&_span]:[font-size:10px] [&_span]:[font-weight:700] [&_span]:[letter-spacing:0.1em] [&_h2]:[margin:9px_0_0] [&_h2]:[font-size:clamp(25px,_3vw,_34px)] [&_h2]:[letter-spacing:-0.04em] [&_h2]:[line-height:1.2] [&_p]:[margin:0] [&_p]:[color:var(--ink-soft)] [&_p]:[font-size:13px] max-[651px]:[&_p]:hidden">
                <div>
                  <span>03 / {t("LAST 7 DAYS", "7 วันที่ผ่านมา")}</span>
                  <h2 id="listen-artists">
                    {t("Top artists", "ศิลปินยอดนิยม")}
                  </h2>
                </div>
              </div>
              {data.unavailable.includes("topArtists") ? (
                <p className="listen-empty [color:var(--ink-soft)] [line-height:1.6] [font-size:14px]">
                  {t(
                    "Top artists are unavailable right now.",
                    "ยังไม่สามารถโหลดศิลปินยอดนิยมได้",
                  )}
                </p>
              ) : (
                <ItemList items={data.topArtists} kind="ranked" />
              )}
            </section>
          </div>
        </>
      )}
      <footer className="listen-footer [margin-top:96px] [padding-top:24px] [border-top:1px_solid_var(--line)] [color:var(--ink-soft)] [font-size:12px]">
        {t("Listening data from Last.fm", "ข้อมูลการฟังจาก Last.fm")}
      </footer>
    </main>
  );
}
