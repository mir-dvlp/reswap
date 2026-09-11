export type ReSwapPer = "word" | "char" | "line" | "block";

export type ReSwapDurationDefinition = {
  values: readonly string[];
  per?: ReSwapPer;
  speedReveal?: number;
  speedSegment?: number;
  phaseDuration?: number;
};

export type ReSwapDurationParticipant = {
  names: readonly string[];
  text: string;
  per: ReSwapPer;
  speedReveal: number;
  speedSegment: number;
};

export const RE_SWAP_STAGGER_TIMES: Record<ReSwapPer, number> = { block: 0, char: 0.015, line: 0.08, word: 0.04 };
export const RE_SWAP_MAX_STAGGER_SWEEP = 0.24;

export function splitReSwapSegments(text: string, per: ReSwapPer) {
  if (per === "block") return [text];
  if (per === "line") return text.split("\n");
  return text.trim().split(/\s+/);
}

export function getReSwapGraphemes(text: string) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

export function getReSwapAnimatedSegmentCount(text: string, per: ReSwapPer) {
  if (per === "char") return getReSwapGraphemes(text).filter((character) => character.trim().length > 0).length;
  return splitReSwapSegments(text, per).filter((segment) => segment.trim().length > 0).length;
}

export function getReSwapDuration(text: string, per: ReSwapPer = "word", speedReveal = 1, speedSegment = 1) {
  const count = getReSwapAnimatedSegmentCount(text, per);
  const sweep = count > 1 ? Math.min((RE_SWAP_STAGGER_TIMES[per] / speedReveal) * (count - 1), RE_SWAP_MAX_STAGGER_SWEEP) : 0;
  return 0.32 / speedSegment + sweep;
}

export function getReSwapGroupDuration(texts: readonly string[], per: ReSwapPer = "word", speedReveal = 1, speedSegment = 1) {
  return texts.length ? Math.max(...texts.map((text) => getReSwapDuration(text, per, speedReveal, speedSegment))) : 0;
}

export function resolveReSwapGroupDurations(
  groups: Readonly<Record<string, ReSwapDurationDefinition>>,
  participants: Iterable<ReSwapDurationParticipant>,
) {
  const resolved = Object.fromEntries(Object.entries(groups).map(([name, definition]) => [
    name,
    definition.phaseDuration ?? getReSwapGroupDuration(definition.values, definition.per, definition.speedReveal, definition.speedSegment),
  ]));
  for (const participant of participants) {
    const duration = getReSwapDuration(participant.text, participant.per, participant.speedReveal, participant.speedSegment);
    for (const name of participant.names) {
      if (groups[name]?.phaseDuration !== undefined) continue;
      resolved[name] = Math.max(resolved[name] ?? 0, duration);
    }
  }
  return resolved;
}
