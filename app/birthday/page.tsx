import { generatePageMetadata } from "../lib/og/metadata";
import BirthdayCountdown from "./birthday-countdown";
import BirthdayWishForm from "./birthday-wish-form";

export function generateMetadata() {
  return generatePageMetadata("/birthday");
}

export default function BirthdayPage() {
  return (
    <main
      data-no-scroll
      className="mx-auto grid h-full w-[min(1040px,calc(100%-48px))] grid-rows-[minmax(0,1fr)] items-stretch gap-6 overflow-hidden max-[767px]:w-[calc(100%-32px)] lg:w-[min(1080px,calc(100%-64px))] lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8"
    >
      <BirthdayCountdown />
      <BirthdayWishForm />
    </main>
  );
}
