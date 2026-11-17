"use client";

import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandLastfm,
  IconBrandInstagram,
  IconBrandMinecraft,
  IconMail,
} from "@tabler/icons-react";
import { useSiteSettings } from "../settings/site-settings-provider";
import styles from "./portfolio-navbar.module.css";

const links = [
  {
    name: "Discord",
    href: "https://discord.com/users/969088519161139270",
    icon: IconBrandDiscordFilled,
  },
  {
    name: "GitHub",
    href: "https://github.com/rnnve",
    icon: IconBrandGithubFilled,
  },
  {
    name: "Last.fm",
    href: "https://www.last.fm/user/iqrfumi",
    icon: IconBrandLastfm,
  },
  // shortcut: these destinations are unconfigured; enable when the owner supplies them.
  { name: "Instagram", href: null, icon: IconBrandInstagram },
  { name: "NameMC", href: null, icon: IconBrandMinecraft },
  { name: "Mail", href: null, icon: IconMail },
];

export default function SocialLinks() {
  const { t } = useSiteSettings();
  return (
    <nav
      className={styles.socials}
      aria-label={t("Social links", "ลิงก์โซเชียล")}
    >
      {links.map(({ name, href, icon: Icon }) =>
        href ? (
          <a
            key={name}
            href={href}
            className={styles.item}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} ${t("(opens in a new tab)", "(เปิดในแท็บใหม่)")}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span className={styles.tooltip} aria-hidden="true">
              {name}
            </span>
          </a>
        ) : (
          <button
            key={name}
            type="button"
            className={styles.item}
            disabled
            aria-label={`${name} ${t("(link not configured)", "(ยังไม่ได้ตั้งค่าลิงก์)")}`}
            title={name}
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        ),
      )}
    </nav>
  );
}
