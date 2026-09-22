import { describe, it, expect } from "vitest";
import {
  applySm2,
  deriveMasteryLevel,
  SM2_MAX_EASE,
  SM2_MAX_INTERVAL_DAYS,
  SM2_MIN_EASE,
} from "../sm2";

const NOW = new Date("2026-09-22T10:00:00.000Z");

function daysFromNow(iso: string): number {
  return Math.round((new Date(iso).getTime() - NOW.getTime()) / 86_400_000);
}

describe("applySm2", () => {
  it("first correct answer: 1 repetition, 1-day interval, ease +0.1", () => {
    const r = applySm2({}, true, NOW);
    expect(r.repetitions).toBe(1);
    expect(r.interval_days).toBe(1);
    expect(r.ease_factor).toBe(2.6);
    expect(daysFromNow(r.next_review_at)).toBe(1);
  });

  it("second correct answer: 6-day interval", () => {
    const first = applySm2({}, true, NOW);
    const r = applySm2(first, true, NOW);
    expect(r.repetitions).toBe(2);
    expect(r.interval_days).toBe(6);
    expect(r.ease_factor).toBe(2.7);
    expect(daysFromNow(r.next_review_at)).toBe(6);
  });

  it("third correct answer: round(previous interval × ease)", () => {
    const second = applySm2(applySm2({}, true, NOW), true, NOW);
    const r = applySm2(second, true, NOW);
    expect(r.repetitions).toBe(3);
    expect(r.interval_days).toBe(Math.round(6 * 2.7)); // 16
    expect(r.ease_factor).toBe(2.8);
    expect(daysFromNow(r.next_review_at)).toBe(16);
  });

  it("a lapse resets repetitions, sets a 1-day interval, and lowers ease by 0.2", () => {
    const third = applySm2(applySm2(applySm2({}, true, NOW), true, NOW), true, NOW);
    const r = applySm2(third, false, NOW);
    expect(r.repetitions).toBe(0);
    expect(r.interval_days).toBe(1);
    expect(r.ease_factor).toBe(2.6);
    expect(daysFromNow(r.next_review_at)).toBe(1);
  });

  it("after a lapse the ladder restarts at 1 then 6 days", () => {
    const lapsed = applySm2({ ease_factor: 2.8, interval_days: 16, repetitions: 3 }, false, NOW);
    const again = applySm2(lapsed, true, NOW);
    expect(again.interval_days).toBe(1);
    expect(applySm2(again, true, NOW).interval_days).toBe(6);
  });

  it("clamps ease to the [1.3, 3.0] range", () => {
    const low = applySm2({ ease_factor: 1.4, interval_days: 1, repetitions: 0 }, false, NOW);
    expect(low.ease_factor).toBe(SM2_MIN_EASE);
    const lower = applySm2(low, false, NOW);
    expect(lower.ease_factor).toBe(SM2_MIN_EASE);

    const high = applySm2({ ease_factor: 2.95, interval_days: 6, repetitions: 2 }, true, NOW);
    expect(high.ease_factor).toBe(SM2_MAX_EASE);
    const higher = applySm2(high, true, NOW);
    expect(higher.ease_factor).toBe(SM2_MAX_EASE);
  });

  it("caps the interval at 365 days, with no 30-day ceiling", () => {
    const r = applySm2({ ease_factor: 3.0, interval_days: 200, repetitions: 8 }, true, NOW);
    expect(r.interval_days).toBe(SM2_MAX_INTERVAL_DAYS);
    const mid = applySm2({ ease_factor: 2.5, interval_days: 40, repetitions: 5 }, true, NOW);
    expect(mid.interval_days).toBe(100);
  });
});

describe("deriveMasteryLevel", () => {
  it("is 0 when never seen and 1 after a lapse", () => {
    expect(deriveMasteryLevel(0, 0, 0)).toBe(0);
    expect(deriveMasteryLevel(0, 4, 2)).toBe(1);
  });

  it("climbs with repetitions and accuracy", () => {
    expect(deriveMasteryLevel(1, 1, 1)).toBe(2);
    expect(deriveMasteryLevel(3, 3, 3)).toBe(3);
    expect(deriveMasteryLevel(3, 6, 3)).toBe(2); // 50% accuracy holds it back
    expect(deriveMasteryLevel(5, 5, 5)).toBe(4);
    expect(deriveMasteryLevel(6, 7, 6)).toBe(5);
    expect(deriveMasteryLevel(6, 10, 7)).toBe(4);
  });
});
