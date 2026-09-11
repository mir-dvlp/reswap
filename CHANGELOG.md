# Changelog

## Unreleased

- Add a lightweight `@mir-ui/reswap/provider` entry point so applications can
  lazy-load the Motion-powered component without losing named group timing.

- Build distributable files during Git-based installation through npm's `prepare` lifecycle.
- Make disabled and reduced-motion updates bypass the sequential animation queue.
- Reduced the stable entry to `ReSwap`, `ReSwapProvider`, their public types, and core utilities.
- Moved `ReSwapGroup` and deprecated prop aliases to `@mir-ui/reswap/legacy`.
- Added human documentation, an AI integration guide, `llms.txt`, contribution guidance, licensing, and CI configuration.
- Unified portable core and rendered component tests under Vitest.

## 0.1.0

- Added text swaps by word, character, block, and explicit line.
- Added stable `gentle`, `gentle-blur`, `blur`, and `scale-blur` presets.
- Added automatic named-group synchronization through `ReSwapProvider`.
- Made group names fully application-defined and allowed one participant to join several groups.
- Made declared group `phaseDuration` a strict timing override.
- Added measured height transitions, latest-wins rapid updates, and reduced-motion behavior.
- Added grapheme-safe segmentation and automatic block fallback for long character sequences.
- Added component tests for accessible text, reduced motion, immediate updates, latest-wins queuing, and named-group completion timing.
- Added publishable ESM, declaration, sourcemap, and package archive builds.
- Verified the packaged runtime against React 18 and widened the React peer range to `>=18`.
- Removed the React 18 server-rendering warning by using an isomorphic group-registration effect.
- Unified accessible text across every segmentation mode and preserved consumer container styles during measured-height layouts.
- Validated named-group integration in Kiroku, a dense operational product with synchronized status and action labels.
