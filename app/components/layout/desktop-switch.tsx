"use client";

import Link from "./intent-link";
import { Monitor } from "lucide-react";
import styles from "./desktop-switch.module.css";

export default function DesktopSwitch() {
  return (
    <Link href="/-" className={styles.button} aria-label="Switch to desktop">
      <Monitor size={17} />
      <span>Desktop</span>
    </Link>
  );
}
