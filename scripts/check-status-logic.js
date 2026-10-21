#!/usr/bin/env node
/**
 * Checks the review status logic in src/lib/review-status.ts. No network.
 *
 *   node scripts/check-status-logic.js
 *
 * Times are built with the local-time Date constructor, so the checks hold in
 * any timezone. «now» is 16 Oct 2026, 12:00 local.
 */
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const HOUR = 3_600_000;
const at = (day, hour = 12) => new Date(2026, 9, day, hour, 0, 0).getTime();
const iso = (ms) => new Date(ms).toISOString();
const NOW = at(16, 12);

const rec = (over) => ({ mastery_level: 2, next_review_at: null, last_seen_at: null, ...over });

const cases = [
  {
    name: "due yesterday, not seen since → overdue",
    r: rec({ next_review_at: iso(at(15, 15)), last_seen_at: iso(at(14, 15)) }),
    due: true,
    overdue: true,
  },
  {
    name: "due earlier today → due, NOT overdue",
    r: rec({ next_review_at: iso(at(16, 8)), last_seen_at: iso(at(15, 8)) }),
    due: true,
    overdue: false,
  },
  {
    name: "due at 00:00 today → NOT overdue (not before the start of today)",
    r: rec({ next_review_at: iso(at(16, 0)), last_seen_at: iso(at(15, 0)) }),
    due: true,
    overdue: false,
  },
  {
    name: "due 23:59 yesterday → overdue",
    r: rec({ next_review_at: iso(new Date(2026, 9, 15, 23, 59).getTime()), last_seen_at: iso(at(14, 12)) }),
    due: true,
    overdue: true,
  },
  {
    name: "reviewed today with 100%, next review in 3 days → not overdue",
    r: rec({ next_review_at: iso(at(19, 12)), last_seen_at: iso(at(16, 9)) }),
    due: false,
    overdue: false,
  },
  {
    name: "reviewed today but a stale past due date → not overdue (seen since it came due)",
    r: rec({ next_review_at: iso(at(10, 12)), last_seen_at: iso(at(16, 9)) }),
    due: true,
    overdue: false,
  },
  {
    name: "never scheduled (no next_review_at) → not overdue",
    r: rec({ next_review_at: null, last_seen_at: iso(at(10, 12)) }),
    due: false,
    overdue: false,
  },
  {
    name: "never seen (mastery level 0) → not overdue",
    r: rec({ mastery_level: 0, next_review_at: iso(at(1, 12)), last_seen_at: null }),
    due: false,
    overdue: false,
  },
  {
    name: "due last week but reviewed since → not overdue",
    r: rec({ next_review_at: iso(at(9, 12)), last_seen_at: iso(at(13, 12)) }),
    due: true,
    overdue: false,
  },
  {
    name: "due last week, not reviewed since → overdue",
    r: rec({ next_review_at: iso(at(9, 12)), last_seen_at: iso(at(8, 12)) }),
    due: true,
    overdue: true,
  },
  {
    name: "due tomorrow → not due, not overdue",
    r: rec({ next_review_at: iso(at(17, 9)), last_seen_at: iso(at(16, 9)) }),
    due: false,
    overdue: false,
  },
  {
    name: "undefined record → not due, not overdue",
    r: undefined,
    due: false,
    overdue: false,
  },
];

(async () => {
  const mod = await import(pathToFileURL(path.resolve(__dirname, "../src/lib/review-status.ts")).href);
  const { isDue, isOverdue, daysUntilReview } = mod;
  let failed = 0;
  for (const c of cases) {
    const due = isDue(c.r, NOW);
    const overdue = isOverdue(c.r, NOW);
    const ok = due === c.due && overdue === c.overdue;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}${ok ? "" : `  (got due=${due}, overdue=${overdue}; want due=${c.due}, overdue=${c.overdue})`}`);
  }
  // Day arithmetic for the «amanhã / 3 dias» label.
  const days = [
    ["next review tomorrow → 1", rec({ next_review_at: iso(at(17, 23)) }), 1],
    ["next review in 3 days → 3", rec({ next_review_at: iso(at(19, 1)) }), 3],
    ["next review later today → 0", rec({ next_review_at: iso(at(16, 20)) }), 0],
  ];
  for (const [name, r, want] of days) {
    const got = daysUntilReview(r, NOW);
    const ok = got === want;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${got})`}`);
  }
  console.log(`\n${cases.length + days.length - failed}/${cases.length + days.length} passed`);
  process.exit(failed ? 1 : 0);
})();
