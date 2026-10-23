"use client";

import { useEffect, useState } from "react";

let selectedImage: string | null = null;
let imageRequest: Promise<string | null> | null = null;

function requestRandomImage() {
  if (selectedImage) return Promise.resolve(selectedImage);
  if (imageRequest) return imageRequest;

  imageRequest = fetch("/api/pfp", { cache: "no-store" })
    .then(async (response) => response.ok ? await response.json() as unknown : [])
    .then((value) => {
      const images = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
      selectedImage = images.length ? images[Math.floor(Math.random() * images.length)] : null;
      return selectedImage;
    })
    .catch(() => null);

  return imageRequest;
}

export default function useRandomProfileImage() {
  const [image, setImage] = useState<string | null>(selectedImage);

  useEffect(() => {
    let active = true;
    void requestRandomImage().then((nextImage) => {
      if (active) setImage(nextImage);
    });
    return () => { active = false; };
  }, []);

  return image;
}
