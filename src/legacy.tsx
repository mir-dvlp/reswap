"use client";

import { getReSwapGroupDuration, ReSwap, type ReSwapProps } from "./reswap";

export type ReSwapGroupProps = Omit<ReSwapProps, "animate" | "group"> & {
  group?: readonly string[];
  totalDuration?: number;
  trigger?: boolean;
};

/** @deprecated Prefer ReSwapProvider with named `group` values for new integrations. */
export function ReSwapGroup({ children, group, per = "word", speedReveal = 1, speedSegment = 1, phaseDuration, totalDuration, trigger, staggerSweep = 0.24, ...props }: ReSwapGroupProps) {
  const directGroupDuration = group ? getReSwapGroupDuration(group, per, speedReveal, speedSegment) : undefined;
  const resolvedPhaseDuration = phaseDuration ?? totalDuration ?? directGroupDuration;
  return <ReSwap {...props} animate={trigger} per={per} speedReveal={speedReveal} speedSegment={speedSegment} phaseDuration={resolvedPhaseDuration} staggerSweep={staggerSweep}>{children}</ReSwap>;
}
