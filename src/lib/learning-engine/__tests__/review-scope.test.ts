import { describe, expect, it } from "vitest";
import type { MasteryRecord } from "../mastery-tracker";
import { scopeRecords, selectReviewCandidates } from "../review-selector";

const now = new Date("2026-09-23T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

function rec(content_type: MasteryRecord["content_type"], content_id: string, next: string | null): MasteryRecord {
  return {
    id: content_id,
    user_id: "u",
    content_type,
    content_id,
    content_cefr: "A1",
    content_category: null,
    times_seen: 3,
    times_correct: 3,
    times_incorrect: 0,
    streak: 3,
    mastery_level: 2,
    ease_factor: 2.5,
    interval_days: 6,
    repetitions: 2,
    last_seen_at: null,
    last_correct_at: null,
    next_review_at: next,
  };
}

const records = [
  rec("vocab", "saudade", daysAgo(3)),
  rec("vocab", "comboio", daysAgo(0.1)),
  rec("vocab", "chávena", daysAgo(1.5)),
  rec("verb", "SER", daysAgo(4)),
];

describe("scopeRecords", () => {
  it("returns everything without a scope", () => {
    expect(scopeRecords(records, undefined, now)).toHaveLength(4);
  });

  it("restricts to a content type and to listed ids", () => {
    const ids = scopeRecords(records, { contentType: "vocab", contentIds: ["saudade", "comboio"] }, now).map((r) => r.content_id);
    expect(ids).toEqual(["saudade", "comboio"]);
  });

  it("keeps only items at least a day late when overdueOnly", () => {
    const ids = scopeRecords(records, { contentType: "vocab", overdueOnly: true }, now).map((r) => r.content_id);
    expect(ids).toEqual(["saudade", "chávena"]);
  });

  it("composes with the selector so preview and session agree", () => {
    const scoped = selectReviewCandidates(scopeRecords(records, { contentType: "vocab" }, now), now);
    expect(scoped.map((c) => c.record.content_id)).toEqual(["saudade", "chávena", "comboio"]);
  });
});
