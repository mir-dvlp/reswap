"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  resolveReSwapGroupDurations,
  type ReSwapPer,
} from "./core";

export type ReSwapGroupDefinition = {
  values: readonly string[];
  per?: ReSwapPer;
  speedReveal?: number;
  speedSegment?: number;
  phaseDuration?: number;
};

export type ReSwapProviderProps = {
  children: ReactNode;
  groups?: Readonly<Record<string, ReSwapGroupDefinition>>;
};

export type ReSwapParticipant = {
  names: readonly string[];
  text: string;
  per: ReSwapPer;
  speedReveal: number;
  speedSegment: number;
};

type ReSwapGroupsContextValue = {
  durations: Readonly<Record<string, number>>;
  register: (id: symbol, participant: ReSwapParticipant | null) => void;
};

export const ReSwapGroupsContext =
  createContext<ReSwapGroupsContextValue | null>(null);

export function ReSwapProvider({ children, groups = {} }: ReSwapProviderProps) {
  const [participants, setParticipants] = useState<
    ReadonlyMap<symbol, ReSwapParticipant>
  >(() => new Map());
  const register = useCallback(
    (id: symbol, participant: ReSwapParticipant | null) => {
      setParticipants((current) => {
        const next = new Map(current);
        if (participant) next.set(id, participant);
        else next.delete(id);
        return next;
      });
    },
    [],
  );
  const durations = useMemo(
    () => resolveReSwapGroupDurations(groups, participants.values()),
    [groups, participants],
  );
  const value = useMemo(() => ({ durations, register }), [durations, register]);
  return (
    <ReSwapGroupsContext.Provider value={value}>
      {children}
    </ReSwapGroupsContext.Provider>
  );
}

export function useNamedGroupDuration(
  groupNames?: readonly string[],
  activeGroup?: string,
) {
  const context = useContext(ReSwapGroupsContext);
  const durations = context?.durations ?? {};
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !activeGroup) return;
    if (!groupNames?.includes(activeGroup))
      console.warn(
        `[ReSwap] activeGroup "${activeGroup}" is not listed in groups.`,
      );
    else if (durations[activeGroup] === undefined)
      console.warn(
        `[ReSwap] group "${activeGroup}" is not defined by ReSwapProvider.`,
      );
  }, [activeGroup, durations, groupNames]);
  if (!groupNames?.length) return undefined;
  if (
    activeGroup &&
    groupNames.includes(activeGroup) &&
    durations[activeGroup] !== undefined
  ) {
    return durations[activeGroup];
  }
  const matches = groupNames.flatMap((name) =>
    durations[name] === undefined ? [] : [durations[name]],
  );
  return matches.length ? Math.max(...matches) : undefined;
}
