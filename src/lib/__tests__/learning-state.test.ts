import { describe, expect, it } from "vitest";
import { dueRank, itemState } from "../learning-state";

const now = new Date("2026-09-23T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

describe("itemState", () => {
  it("treats a missing or unseen record as unseen", () => {
    expect(itemState(null, now).state).toBe("unseen");
    expect(itemState({ times_seen: 0, mastery_level: 0, next_review_at: null }, now).state).toBe("unseen");
  });

  it("is overdue only from one full day late, with whole days", () => {
    const s = itemState({ times_seen: 4, mastery_level: 2, next_review_at: daysAgo(3.4) }, now);
    expect(s).toMatchObject({ state: "overdue", due: true, overdueDays: 3 });
  });

  it("keeps an item due today in its own state", () => {
    const s = itemState({ times_seen: 4, mastery_level: 4, next_review_at: daysAgo(0.2) }, now);
    expect(s).toMatchObject({ state: "mastered", due: true, overdueDays: 0 });
  });

  it("separates learning from mastered at level 4", () => {
    const later = new Date(now.getTime() + 2.5 * 86_400_000).toISOString();
    expect(itemState({ times_seen: 2, mastery_level: 3, next_review_at: later }, now)).toMatchObject({
      state: "learning",
      due: false,
      dueInDays: 3,
    });
    expect(itemState({ times_seen: 9, mastery_level: 5, next_review_at: later }, now).state).toBe("mastered");
  });

  it("ranks the most overdue first", () => {
    const a = itemState({ times_seen: 1, mastery_level: 1, next_review_at: daysAgo(5) }, now);
    const b = itemState({ times_seen: 1, mastery_level: 1, next_review_at: daysAgo(2) }, now);
    const c = itemState({ times_seen: 1, mastery_level: 1, next_review_at: null }, now);
    expect([c, b, a].sort((x, y) => dueRank(x) - dueRank(y))).toEqual([a, b, c]);
  });
});
