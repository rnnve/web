export const BIRTH_DATE = "2010-12-31T13:12:00+07:00";

const BANGKOK_OFFSET = 7 * 60 * 60 * 1_000;
const DAY = 24 * 60 * 60 * 1_000;

export function getBirthdayWishWindow(now: number) {
  const year = new Date(now + BANGKOK_OFFSET).getUTCFullYear();
  const thisBirthday = Date.parse(`${year}${BIRTH_DATE.slice(4)}`);
  const lastBirthday =
    now >= thisBirthday
      ? thisBirthday
      : Date.parse(`${year - 1}${BIRTH_DATE.slice(4)}`);
  const isOpen = now >= lastBirthday && now < lastBirthday + 2 * DAY;
  const opensAt = isOpen
    ? lastBirthday
    : now < thisBirthday
      ? thisBirthday
      : Date.parse(`${year + 1}${BIRTH_DATE.slice(4)}`);

  return { isOpen, opensAt, closesAt: opensAt + 2 * DAY };
}

export function getBirthdayCountdown(now: number) {
  const year = new Date(now + BANGKOK_OFFSET).getUTCFullYear();
  const birthday = Date.parse(`${year}${BIRTH_DATE.slice(4)}`);
  const birthdayEnd =
    Math.floor((birthday + BANGKOK_OFFSET) / DAY) * DAY + DAY - BANGKOK_OFFSET;
  const isBirthday = now >= birthday && now < birthdayEnd;
  const target =
    now < birthdayEnd
      ? birthday
      : Date.parse(`${year + 1}${BIRTH_DATE.slice(4)}`);
  const remaining = isBirthday
    ? 0
    : Math.max(0, Math.ceil((target - now) / 1_000));

  const current = new Date(target - remaining * 1_000 + BANGKOK_OFFSET);
  const end = new Date(target + BANGKOK_OFFSET);
  const months =
    (end.getUTCFullYear() - current.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    current.getUTCMonth();
  // The target is December 31, so every starting day fits in its month.
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
