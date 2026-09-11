import { forwardRef, useEffect, type ComponentPropsWithoutRef, type ElementType } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const motionState = vi.hoisted(() => ({ presenceMode: "", reduced: false }));

vi.mock("motion/react", async () => {
  const React = await import("react");
  const cache = new Map<string, ReturnType<typeof forwardRef>>();
  const getMotionComponent = (tag: string) => {
    const cached = cache.get(tag);
    if (cached) return cached;
    const Component = forwardRef<HTMLElement, ComponentPropsWithoutRef<ElementType>>((props, ref) => {
      const {
        animate: _animate,
        exit: _exit,
        initial: _initial,
        layout: _layout,
        onAnimationComplete,
        transition: _transition,
        variants,
        ...domProps
      } = props as ComponentPropsWithoutRef<ElementType> & {
        onAnimationComplete?: (definition: string) => void;
        variants?: { visible?: { transition?: { delayChildren?: number; duration?: number; staggerChildren?: number } } };
      };
      useEffect(() => {
        if (!onAnimationComplete) return;
        const timer = window.setTimeout(() => onAnimationComplete("visible"), 16);
        return () => window.clearTimeout(timer);
      }, [onAnimationComplete, domProps.children]);
      const duration = variants?.visible?.transition?.duration;
      const enterDelay = variants?.visible?.transition?.delayChildren;
      const stagger = variants?.visible?.transition?.staggerChildren;
      return React.createElement(tag, {
        ...domProps,
        ...(duration === undefined ? {} : { "data-motion-duration": duration }),
        ...(enterDelay === undefined ? {} : { "data-motion-delay": enterDelay }),
        ...(stagger === undefined ? {} : { "data-motion-stagger": stagger }),
        ref,
      });
    });
    Component.displayName = `MotionMock(${tag})`;
    cache.set(tag, Component);
    return Component;
  };
  return {
    AnimatePresence: ({ children, mode }: { children: React.ReactNode; mode?: string }) => {
      motionState.presenceMode = mode ?? "";
      return children;
    },
    motion: new Proxy({}, { get: (_target, property) => getMotionComponent(String(property)) }),
    useIsPresent: () => true,
    useReducedMotion: () => motionState.reduced,
  };
});

import { ReSwap, ReSwapProvider } from "../src/reswap";

describe("ReSwap", () => {
  beforeEach(() => {
    motionState.presenceMode = "";
    motionState.reduced = false;
  });

  it("keeps segmented heading text as one accessible name", () => {
    render(<ReSwap as="h2" per="char">Привет 👋🏽</ReSwap>);
    expect(screen.getByRole("heading", { level: 2, name: "Привет 👋🏽" })).toBeTruthy();
  });

  it("keeps explicit lines as one accessible heading", () => {
    render(<ReSwap as="h2" per="line">{"Первая строка\nВторая строка"}</ReSwap>);
    expect(screen.getByRole("heading", { level: 2, name: /Первая строка\s+Вторая строка/ })).toBeTruthy();
  });

  it("preserves consumer ARIA attributes and styles", () => {
    render(
      <ReSwap
        containerProps={{ "aria-atomic": true, "aria-live": "polite", style: { color: "rgb(98, 52, 184)" } }}
        heightTiming="with-exit"
      >
        Обновляемый статус
      </ReSwap>,
    );
    const status = screen.getByText("Обновляемый статус", { selector: "p > span > span" }).closest("p");
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.getAttribute("aria-atomic")).toBe("true");
    expect(status?.style.color).toBe("rgb(98, 52, 184)");
    expect(status?.style.position).toBe("relative");
  });

  it("lets compact inline content animate its own size", () => {
    const view = render(<ReSwap as="span" layout="size">Связаться</ReSwap>);
    const host = view.container.firstElementChild as HTMLElement | null;
    expect(host?.style.display).toBe("inline-block");
  });

  it("slightly overlaps Scale Blur exit and enter phases", () => {
    const view = render(<ReSwap as="span" per="block" phaseDuration={0.32} preset="scale-blur">Связаться</ReSwap>);
    const animated = view.container.querySelector("[data-motion-delay]");

    expect(motionState.presenceMode).toBe("sync");
    expect(Number(animated?.getAttribute("data-motion-delay"))).toBeCloseTo(0);
  });

  it("allows the Scale Blur overlap to be tuned", () => {
    const view = render(<ReSwap as="span" per="block" phaseDuration={0.32} phaseOverlap={0.04} preset="scale-blur">Связаться</ReSwap>);
    const animated = view.container.querySelector("[data-motion-delay]");

    expect(Number(animated?.getAttribute("data-motion-delay"))).toBeCloseTo(0.28);
  });

  it("updates immediately when animation is disabled", () => {
    const view = render(<ReSwap animate={false}>Первый текст</ReSwap>);
    view.rerender(<ReSwap animate={false}>Второй текст</ReSwap>);
    expect(screen.getByText("Второй текст", { selector: "p > span > span" })).toBeTruthy();
  });

  it("collapses rapid changes to the latest pending value", async () => {
    const view = render(<ReSwap as="span">Первый</ReSwap>);
    await act(async () => {
      view.rerender(<ReSwap as="span">Второй</ReSwap>);
      view.rerender(<ReSwap as="span">Третий</ReSwap>);
      view.rerender(<ReSwap as="span">Последний</ReSwap>);
    });
    await waitFor(() => expect(view.container.textContent).toContain("Последний"));
    expect(view.container.textContent).not.toContain("Третий");
  });

  it("updates immediately for reduced-motion users", () => {
    motionState.reduced = true;
    const view = render(<ReSwap>До</ReSwap>);
    view.rerender(<ReSwap>После</ReSwap>);
    expect(view.container.textContent).toContain("После");
    expect(view.container.textContent).not.toContain("До");
  });

  it("gives every member of a named group the longest phase duration", async () => {
    render(
      <ReSwapProvider>
        <ReSwap as="span" containerProps={{ "data-testid": "short" } as never} group="language">One</ReSwap>
        <ReSwap as="span" containerProps={{ "data-testid": "long" } as never} group="language">One two three four</ReSwap>
      </ReSwapProvider>,
    );
    await waitFor(() => {
      const short = screen.getByTestId("short");
      const long = screen.getByTestId("long");
      const shortDuration = Number(short.querySelector("[data-motion-duration]")?.getAttribute("data-motion-duration"));
      const longDuration = Number(long.querySelector("[data-motion-duration]")?.getAttribute("data-motion-duration"));
      const shortStagger = Number(short.querySelector("[data-motion-stagger]")?.getAttribute("data-motion-stagger"));
      const longStagger = Number(long.querySelector("[data-motion-stagger]")?.getAttribute("data-motion-stagger"));
      const shortSegments = short.querySelectorAll("[data-motion-duration]").length;
      const longSegments = long.querySelectorAll("[data-motion-duration]").length;
      expect(shortDuration + shortStagger * (shortSegments - 1)).toBeCloseTo(0.44);
      expect(longDuration + longStagger * (longSegments - 1)).toBeCloseTo(0.44);
    });
  });
});
