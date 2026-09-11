"use client";

import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps, type Transition, type Variants } from "motion/react";
import { Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type JSX } from "react";
import { getReSwapAnimatedSegmentCount, getReSwapDuration, getReSwapGraphemes, getReSwapGroupDuration, RE_SWAP_MAX_STAGGER_SWEEP, RE_SWAP_STAGGER_TIMES, splitReSwapSegments, type ReSwapPer } from "./core";
import { ReSwapGroupsContext, useNamedGroupDuration } from "./group-context";

export { ReSwapProvider } from "./group-context";
export type { ReSwapGroupDefinition, ReSwapProviderProps } from "./group-context";

export { getReSwapAnimatedSegmentCount, getReSwapDuration, getReSwapGroupDuration } from "./core";
export type { ReSwapPer } from "./core";

export type ReSwapPreset = "blur" | "gentle-blur" | "scale-blur" | "gentle";
export type ReSwapHeightTiming = "after-exit" | "with-exit";

export type ReSwapBasicProps = {
  children: string;
  per?: ReSwapPer;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  preset?: ReSwapPreset;
  /** Registers this text in one or more provider-owned synchronization groups. */
  group?: string | readonly string[];
  /** Selects the timing source when an element belongs to multiple named groups. */
  activeGroup?: string;
  heightTiming?: ReSwapHeightTiming;
  /** Controls animation without removing the current text from the document. */
  animate?: boolean;
  containerProps?: Omit<HTMLMotionProps<"div">, "children" | "className">;
};

export type ReSwapAdvancedProps = {
  variants?: { container?: Variants; item?: Variants };
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  phaseDuration?: number;
  staggerSweep?: number;
  layoutDuration?: number;
  layout?: boolean | "position" | "size";
  stabilizeHeight?: boolean;
  maxAnimatedSegments?: number;
  segmentWrapperClassName?: string;
  containerTransition?: Transition;
  segmentTransition?: Transition;
};

export type ReSwapProps = ReSwapBasicProps & ReSwapAdvancedProps;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const visuallyHiddenStyle: CSSProperties = { clip: "rect(0, 0, 0, 0)", clipPath: "inset(50%)", height: 1, overflow: "hidden", position: "absolute", userSelect: "none", whiteSpace: "nowrap", width: 1 };
const container: Variants = {
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const presets: Record<ReSwapPreset, { container: Variants; item: Variants }> = {
  blur: { container, item: { exit: { filter: "blur(8px)", opacity: 0 }, hidden: { filter: "blur(8px)", opacity: 0 }, visible: { filter: "blur(0px)", opacity: 1 } } },
  "gentle-blur": { container, item: { exit: { filter: "blur(8px)", opacity: 0, y: -16, transition: { ease: [0.6, 0, 0.8, 0] } }, hidden: { filter: "blur(8px)", opacity: 0, y: 16 }, visible: { filter: "blur(0px)", opacity: 1, y: 0, transition: { ease: [0.18, 0.72, 0.28, 1] } } } },
  gentle: { container, item: { exit: { opacity: 0, y: -16, transition: { ease: [0.6, 0, 0.8, 0] } }, hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { ease: [0.18, 0.72, 0.28, 1] } } } },
  "scale-blur": { container, item: { exit: { filter: "blur(8px)", opacity: 0, scale: 0.88 }, hidden: { filter: "blur(8px)", opacity: 0, scale: 0.88 }, visible: { filter: "blur(0px)", opacity: 1, scale: 1 } } },
};

function Segment({ value, variants, per, className }: { value: string; variants: Variants; per: ReSwapPer; className?: string }) {
  const content = per === "line" ? (
    <motion.span aria-hidden="true" style={{ display: "block" }} variants={variants}>{value}</motion.span>
  ) : per === "block" ? (
    <motion.span aria-hidden="true" style={{ display: "inline-block", maxWidth: "100%" }} variants={variants}>{value}</motion.span>
  ) : per === "word" ? (
    <motion.span aria-hidden="true" style={{ display: "inline-block", whiteSpace: "pre" }} variants={variants}>{value}</motion.span>
  ) : (
    <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
      {getReSwapGraphemes(value).map((character, index) => <motion.span aria-hidden="true" style={{ display: "inline-block", whiteSpace: "pre" }} key={`${index}-${character}`} variants={variants}>{character}</motion.span>)}
    </span>
  );
  return className ? <span className={className} style={{ display: per === "line" ? "block" : "inline-block" }}>{content}</span> : content;
}

export function ReSwap({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset = "gentle",
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  phaseDuration,
  group,
  activeGroup,
  staggerSweep = RE_SWAP_MAX_STAGGER_SWEEP,
  layoutDuration = 0.48,
  layout = true,
  stabilizeHeight = true,
  heightTiming = "after-exit",
  maxAnimatedSegments = 120,
  animate: animateChanges,
  segmentWrapperClassName,
  containerTransition,
  segmentTransition,
  containerProps,
}: ReSwapProps) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animateChanges ?? true;
  const groupKey = typeof group === "string" ? group : group?.join("\u001f");
  const groupNames = useMemo(() => groupKey?.split("\u001f"), [groupKey]);
  const groupsContext = useContext(ReSwapGroupsContext);
  const registerParticipant = groupsContext?.register;
  const participantIdRef = useRef(Symbol("reswap-participant"));
  useIsomorphicLayoutEffect(() => {
    if (!registerParticipant || !groupNames?.length) return;
    registerParticipant(participantIdRef.current, { names: groupNames, text: children, per, speedReveal, speedSegment });
    return () => registerParticipant(participantIdRef.current, null);
  }, [children, groupNames, per, registerParticipant, speedReveal, speedSegment]);
  const namedGroupDuration = useNamedGroupDuration(groupNames, activeGroup);
  const observerRef = useRef<ResizeObserver | null>(null);
  const pendingChildrenRef = useRef<string | null>(null);
  const animatingRef = useRef(false);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [measuredHeight, setMeasuredHeight] = useState<number>();
  useEffect(() => {
    if (children === displayedChildren) return;
    if (reduceMotion || !shouldAnimate) {
      pendingChildrenRef.current = null;
      animatingRef.current = false;
      // The rendered value is intentionally buffered so exits and latest-wins updates can complete.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedChildren(children);
      return;
    }
    pendingChildrenRef.current = children;
    if (!animatingRef.current) {
      animatingRef.current = true;
      pendingChildrenRef.current = null;
      // The rendered value is intentionally buffered so AnimatePresence receives the outgoing key first.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedChildren(children);
    }
  }, [children, displayedChildren, reduceMotion, shouldAnimate]);
  useEffect(() => () => observerRef.current?.disconnect(), []);

  const finishSwap = useCallback((definition: string | string[]) => {
    if (definition !== "visible" || !animatingRef.current) return;
    const pendingChildren = pendingChildrenRef.current;
    if (pendingChildren !== null && pendingChildren !== displayedChildren) {
      pendingChildrenRef.current = null;
      setDisplayedChildren(pendingChildren);
      return;
    }
    pendingChildrenRef.current = null;
    animatingRef.current = false;
  }, [displayedChildren]);
  const measureContent = useCallback((node: HTMLSpanElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node || !stabilizeHeight || as === "span") return;
    const measure = () => setMeasuredHeight(node.getBoundingClientRect().height);
    measure();
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(node);
  }, [as, stabilizeHeight]);
  const immediate = Boolean(reduceMotion) || !shouldAnimate;
  const renderedChildren = immediate ? children : displayedChildren;
  const requestedSegmentCount = getReSwapAnimatedSegmentCount(renderedChildren, per);
  const effectivePer = per === "char" && requestedSegmentCount > maxAnimatedSegments ? "block" : per;
  const base = presets[preset];
  const textSegments = splitReSwapSegments(renderedChildren, effectivePer);
  const segmentCount = getReSwapAnimatedSegmentCount(renderedChildren, effectivePer);
  const synchronizedDuration = phaseDuration ?? namedGroupDuration;
  const sweep = synchronizedDuration && segmentCount > 1
    ? Math.min(staggerSweep / speedReveal, synchronizedDuration * 0.75)
    : 0;
  const staggerStep = synchronizedDuration
    ? (segmentCount > 1 ? sweep / (segmentCount - 1) : 0)
    : Math.min(RE_SWAP_STAGGER_TIMES[effectivePer] / speedReveal, segmentCount > 1 ? RE_SWAP_MAX_STAGGER_SWEEP / (segmentCount - 1) : 0);
  const segmentDuration = synchronizedDuration ? synchronizedDuration - sweep : 0.32 / speedSegment;
  const containerVariants: Variants = reduceMotion || !shouldAnimate ? {
    ...base.container,
    exit: { opacity: 0, transition: { duration: 0 } },
    visible: { opacity: 1, transition: { duration: 0 } },
  } : {
    ...base.container,
    exit: { ...base.container.exit, transition: { staggerChildren: staggerStep, staggerDirection: -1, ...containerTransition } },
    visible: { ...base.container.visible, transition: { delayChildren: delay, staggerChildren: staggerStep, ...containerTransition } },
  };
  const baseExit = base.item.exit as Record<string, unknown>;
  const baseVisible = base.item.visible as Record<string, unknown>;
  const itemVariants: Variants = reduceMotion || !shouldAnimate ? {
    exit: { opacity: 0, transition: { duration: 0 } }, hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } },
  } : {
    ...base.item,
    exit: { ...baseExit, transition: { ...(baseExit.transition as object), duration: segmentDuration, ...segmentTransition } },
    visible: { ...baseVisible, transition: { ...(baseVisible.transition as object), duration: segmentDuration, ...segmentTransition } },
  };
  const computed = variants ? { container: { ...containerVariants, ...variants.container }, item: { ...itemVariants, ...variants.item } } : { container: containerVariants, item: itemVariants };

  const swappingContent = (
    <motion.span
      ref={heightTiming === "after-exit" ? measureContent : undefined}
      translate="no"
      key={renderedChildren}
      animate="visible"
      exit="exit"
      initial="hidden"
      onAnimationComplete={finishSwap}
      style={{ display: as === "span" ? "inline" : "block" }}
      variants={computed.container}
    >
      <span style={visuallyHiddenStyle}>{renderedChildren}</span>
      {textSegments.map((segment, index) => (
        <Fragment key={`${per}-${index}-${segment}`}>
          {segment.trim().length > 0
            ? <Segment per={effectivePer} value={segment} variants={computed.item} className={segmentWrapperClassName} />
            : segment}
          {(effectivePer === "word" || effectivePer === "char") && index < textSegments.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );

  return (
    <MotionTag
      {...containerProps}
      animate={stabilizeHeight && measuredHeight !== undefined ? { height: measuredHeight } : undefined}
      className={className}
      layout={as !== "span" ? layout : false}
      style={{
        ...containerProps?.style,
        ...(heightTiming === "with-exit" && as !== "span" ? { position: "relative" as const } : {}),
      }}
      transition={{
        height: { duration: reduceMotion || !shouldAnimate ? 0 : layoutDuration, ease: [0.22, 1, 0.36, 1] },
        layout: { duration: reduceMotion || !shouldAnimate ? 0 : layoutDuration, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {immediate ? swappingContent : (
        <AnimatePresence mode="wait" initial={false}>
          {swappingContent}
        </AnimatePresence>
      )}
      {heightTiming === "with-exit" && as !== "span" && (
        <span
          ref={measureContent}
          aria-hidden="true"
          style={{ display: "block", left: 0, pointerEvents: "none", position: "absolute", top: 0, visibility: "hidden", width: "100%" }}
        >{renderedChildren}</span>
      )}
    </MotionTag>
  );
}
