import type { Metadata } from "next";
import NotFoundView from "../components/feedback/not-found-view";

export const metadata: Metadata = {
  title: "Not found",
  description: "The page you requested could not be found.",
  robots: { index: false, follow: false },
};

/** Preview / deep-link for the shared global 404 UI. */
export default function NotFoundPreviewPage() {
  return <NotFoundView />;
}
