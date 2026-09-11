// @vitest-environment node
import { expect, test } from "vitest";
import { getReSwapAnimatedSegmentCount, getReSwapDuration, getReSwapGraphemes, getReSwapGroupDuration, resolveReSwapGroupDurations, splitReSwapSegments } from "../src/core.ts";

test("group duration follows its longest member", () => {
  const short = getReSwapDuration("one", "word");
  const long = getReSwapDuration("one two three four", "word");
  expect(getReSwapGroupDuration(["one", "one two three four"], "word")).toBe(long);
  expect(long).toBeGreaterThan(short);
});

test("stagger sweep is capped for long strings", () => {
  const words = Array.from({ length: 100 }, (_, index) => `word-${index}`).join(" ");
  expect(getReSwapDuration(words, "word")).toBe(0.56);
});

test("grapheme segmentation keeps compound emoji intact", () => {
  expect(getReSwapGraphemes("A👨‍👩‍👧‍👦Б")).toEqual(["A", "👨‍👩‍👧‍👦", "Б"]);
  expect(getReSwapAnimatedSegmentCount("A 👨‍👩‍👧‍👦 Б", "char")).toBe(3);
});

test("word segmentation normalizes whitespace while block preserves it", () => {
  expect(splitReSwapSegments("  one   two  ", "word")).toEqual(["one", "two"]);
  expect(splitReSwapSegments("  one   two  ", "block")).toEqual(["  one   two  "]);
});

test("empty groups have zero duration", () => {
  expect(getReSwapGroupDuration([])).toBe(0);
});

test("named groups synchronize to their longest registered participant", () => {
  const durations = resolveReSwapGroupDurations({}, [
    { names: ["language"], text: "short", per: "word", speedReveal: 1, speedSegment: 1 },
    { names: ["language"], text: "one two three four", per: "word", speedReveal: 1, speedSegment: 1 },
  ]);
  expect(durations.language).toBe(getReSwapDuration("one two three four", "word"));
});

test("an explicit group phase duration is a strict override", () => {
  const durations = resolveReSwapGroupDurations(
    { language: { values: ["short"], phaseDuration: 0.48 } },
    [{ names: ["language"], text: Array.from({ length: 20 }, () => "word").join(" "), per: "word", speedReveal: 1, speedSegment: 1 }],
  );
  expect(durations.language).toBe(0.48);
});

test("one participant can synchronize through multiple independent groups", () => {
  const durations = resolveReSwapGroupDurations({}, [
    { names: ["language", "card"], text: "one two three", per: "word", speedReveal: 1, speedSegment: 1 },
  ]);
  expect(durations.language).toBe(durations.card);
});
