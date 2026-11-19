import { generatePageMetadata } from "../lib/og/metadata";
import BirthdayCountdown from "./birthday-countdown";
import BirthdayWishForm from "./birthday-wish-form";

export function generateMetadata() {
  return generatePageMetadata("/birthday");
}

export default function BirthdayPage() {
  return (
    <main className="mx-auto grid w-[min(1040px,calc(100%-48px))] items-start gap-6 pb-24 max-[767px]:w-[calc(100%-32px)] max-[767px]:pb-32 lg:min-h-[calc(100svh-5rem)] lg:w-[min(1080px,calc(100%-64px))] lg:content-center lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch lg:gap-8">
      <BirthdayCountdown />
      <BirthdayWishForm />
    </main>
  );
}
