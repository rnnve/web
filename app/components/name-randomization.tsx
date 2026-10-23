"use client";

import { useEffect, useState } from "react";

// Add, remove, or reorder the names that may be selected for each visit.
export const NAME_VARIANTS = ["Ryn", "Rynni", "Rynnie", "Mel", "Rinne", "Rinnie"] as const;

const FALLBACK_NAME = NAME_VARIANTS[0];
let selectedName: string | null = null;

function getRandomName() {
  if (!selectedName) {
    selectedName = NAME_VARIANTS[Math.floor(Math.random() * NAME_VARIANTS.length)] ?? FALLBACK_NAME;
  }
  return selectedName;
}

export function useRandomizedName() {
  const [name, setName] = useState<string>(selectedName ?? FALLBACK_NAME);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setName(getRandomName());
    });
    return () => { active = false; };
  }, []);

  return name;
}

export default function NameRandomization() {
  return useRandomizedName();
}
