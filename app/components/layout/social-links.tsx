"use client";

import {
  IconBrandLastfm,
  IconBrandMinecraft,
  IconMail,
} from "@tabler/icons-react";
import type { SVGProps } from "react";
import { DiscordLogo } from "@/components/logos/discord";
import { GithubLogo } from "@/components/logos/github";
import { InstagramLogo } from "@/components/logos/instagram";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSiteSettings } from "../settings/site-settings-provider";
import styles from "./portfolio-navbar.module.css";

const DiscordIcon = (props: Omit<SVGProps<SVGSVGElement>, "type" | "mode">) => (
  <DiscordLogo variant="mono" title="" {...props} />
);
const GithubIcon = (props: Omit<SVGProps<SVGSVGElement>, "type" | "mode">) => (
  <GithubLogo variant="mono" title="" {...props} />
);
const InstagramIcon = (
  props: Omit<SVGProps<SVGSVGElement>, "type" | "mode">,
) => <InstagramLogo variant="mono" title="" {...props} />;

const links = [
  {
    name: "Discord",
    href: "https://discord.com/users/969088519161139270",
    icon: DiscordIcon,
  },
  {
    name: "GitHub",
    href: "https://github.com/rnnve",
    icon: GithubIcon,
  },
  {
    name: "Last.fm",
    href: "https://www.last.fm/user/iqrfumi",
    icon: IconBrandLastfm,
  },
  // shortcut: these destinations are unconfigured; enable when the owner supplies them.
  { name: "Instagram", href: "https://instagram.com/xo.hanami_", icon: InstagramIcon },
  { name: "NameMC", href: "https://namemc.com/profile/Assendancy", icon: IconBrandMinecraft },
  { name: "Mail", href: "mailto:contact@rynni.cc", icon: IconMail },
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
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${styles.item} ${styles.socialItem}`}
                asChild
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${name} ${t("(opens in a new tab)", "(เปิดในแท็บใหม่)")}`}
                >
                  <Icon width={16} height={16} aria-hidden="true" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={9}
              collisionPadding={8}
              className={styles.tooltipContent}
            >
              {name}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            key={name}
            type="button"
            variant="ghost"
            size="icon"
            className={`${styles.item} ${styles.socialItem}`}
            disabled
            aria-label={`${name} ${t("(link not configured)", "(ยังไม่ได้ตั้งค่าลิงก์)")}`}
            title={name}
          >
            <Icon width={16} height={16} aria-hidden="true" />
          </Button>
        ),
      )}
    </nav>
  );
}
