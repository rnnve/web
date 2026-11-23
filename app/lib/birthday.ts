export const BIRTH_DATE = "2010-12-31T13:12:00+07:00";

const BANGKOK_OFFSET = 7 * 60 * 60 * 1_000;
const DAY = 24 * 60 * 60 * 1_000;

/** Midnight Asia/Bangkok for a calendar day (month is 1–12). */
export function bangkokMidnight(
  year: number,
  month: number,
  day: number,
): number {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return Date.parse(`${year}-${mm}-${dd}T00:00:00+07:00`);
}

function bangkokYear(now: number) {
  return new Date(now + BANGKOK_OFFSET).getUTCFullYear();
}

export function getBirthdayWishWindow(now: number) {
  const year = bangkokYear(now);
  const thisBirthday = bangkokMidnight(year, 12, 31);
  const lastBirthday =
    now >= thisBirthday ? thisBirthday : bangkokMidnight(year - 1, 12, 31);
  const isOpen = now >= lastBirthday && now < lastBirthday + 2 * DAY;
  const opensAt = isOpen
    ? lastBirthday
    : now < thisBirthday
      ? thisBirthday
      : bangkokMidnight(year + 1, 12, 31);

  return { isOpen, opensAt, closesAt: opensAt + 2 * DAY };
}

export function getBirthdayCountdown(now: number) {
  const year = bangkokYear(now);
  const birthdayStart = bangkokMidnight(year, 12, 31);
  const birthdayEnd = bangkokMidnight(year + 1, 1, 1);
  const isBirthday = now >= birthdayStart && now < birthdayEnd;
  const target = now < birthdayStart
    ? birthdayStart
    : isBirthday
      ? birthdayStart
      : bangkokMidnight(year + 1, 12, 31);
  const remaining = isBirthday
    ? 0
    : Math.max(0, Math.ceil((target - now) / 1_000));

  const current = new Date(target - remaining * 1_000 + BANGKOK_OFFSET);
  const end = new Date(target + BANGKOK_OFFSET);
  const months =
    (end.getUTCFullYear() - current.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    current.getUTCMonth();
  current.setUTCMonth(current.getUTCMonth() + months);
  const remainder = (end.getTime() - current.getTime()) / 1_000;

  return {
    target,
    isBirthday,
    age:
      new Date(target + BANGKOK_OFFSET).getUTCFullYear() -
      Number(BIRTH_DATE.slice(0, 4)),
    years: Math.floor(months / 12),
    months: months % 12,
    days: Math.floor(remainder / 86_400),
    hours: Math.floor((remainder % 86_400) / 3_600),
    minutes: Math.floor((remainder % 3_600) / 60),
    seconds: remainder % 60,
  };
}
