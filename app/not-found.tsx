import type { Metadata } from "next";
import NotFoundView from "./components/feedback/not-found-view";

export const metadata: Metadata = {
  title: "Not found",
  description: "The page you requested could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundView />;
}
