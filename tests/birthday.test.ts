import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getBirthdayCountdown,
  getBirthdayWishWindow,
} from "../app/lib/birthday";

test("countdown targets the birth time in Bangkok regardless of the visitor timezone", () => {
  const countdown = getBirthdayCountdown(Date.parse("2026-12-30T06:12:00Z"));
  assert.equal(countdown.target, Date.parse("2026-12-31T13:12:00+07:00"));
  assert.deepEqual(
    [countdown.days, countdown.hours, countdown.minutes, countdown.seconds],
    [1, 0, 0, 0],
  );
  assert.equal(countdown.age, 16);
  assert.equal(countdown.isBirthday, false);
});

test("countdown keeps the final second until the birthday arrives", () => {
  const target = Date.parse("2026-12-31T13:12:00+07:00");
  const countdown = getBirthdayCountdown(target - 1);
  assert.equal(countdown.seconds, 1);
  assert.equal(countdown.isBirthday, false);
});

test("birthday celebrates at zero through the rest of December 31 in Bangkok", () => {
  for (const date of [
    "2026-12-31T13:12:00+07:00",
    "2026-12-31T23:59:59+07:00",
  ]) {
    const countdown = getBirthdayCountdown(Date.parse(date));
    assert.equal(countdown.isBirthday, true);
    assert.deepEqual(
      [countdown.days, countdown.hours, countdown.minutes, countdown.seconds],
      [0, 0, 0, 0],
    );
  }
});

test("the next Bangkok year starts a new countdown even while UTC is December 31", () => {
  const countdown = getBirthdayCountdown(
    Date.parse("2027-01-01T00:00:00+07:00"),
  );
  assert.equal(countdown.target, Date.parse("2027-12-31T13:12:00+07:00"));
  assert.equal(countdown.isBirthday, false);
  assert.equal(countdown.age, 17);
  assert.deepEqual(
    [countdown.days, countdown.hours, countdown.minutes, countdown.seconds],
    [364, 13, 12, 0],
  );
});

test("countdown includes the extra day in a leap year", () => {
  const countdown = getBirthdayCountdown(
    Date.parse("2028-01-01T13:12:00+07:00"),
  );
  assert.equal(countdown.days, 365);
  assert.equal(countdown.age, 18);
});

test("wish window opens at countdown zero, lasts 48 hours across years, and repeats annually", () => {
  const opensAt = Date.parse("2026-12-31T13:12:00+07:00");
  const closesAt = Date.parse("2027-01-02T13:12:00+07:00");
  assert.equal(getBirthdayWishWindow(opensAt - 1).isOpen, false);
  assert.equal(getBirthdayWishWindow(opensAt - 1).opensAt, opensAt);
  for (const now of [
    opensAt,
    Date.parse("2027-01-01T00:00:00+07:00"),
    closesAt - 1,
  ]) {
    assert.deepEqual(getBirthdayWishWindow(now), {
      isOpen: true,
      opensAt,
      closesAt,
    });
  }
  const nextBirthday = Date.parse("2027-12-31T13:12:00+07:00");
  assert.equal(getBirthdayWishWindow(closesAt).isOpen, false);
  assert.equal(getBirthdayWishWindow(closesAt).opensAt, nextBirthday);
  assert.equal(getBirthdayWishWindow(nextBirthday).isOpen, true);
});
