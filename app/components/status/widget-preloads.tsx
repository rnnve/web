"use client";

import { preload } from "react-dom";

export default function WidgetPreloads() {
  preload("/api/status/github", { as: "fetch", crossOrigin: "anonymous" });
  return null;
}
