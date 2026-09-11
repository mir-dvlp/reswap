# ReSwap instructions for coding agents

Use this document when integrating or modifying ReSwap through an AI coding agent.

## Contract

- Import stable UI APIs only from `@mir-ui/reswap`.
- Import pure helpers only from `@mir-ui/reswap/core`.
- Never use `@mir-ui/reswap/legacy` in new code.
- Pass a plain string as `children`; do not pass icons, nested markup, or arbitrary React nodes.
- Keep `ReSwap` mounted while its string changes.
- Preserve semantic HTML through `as`.

## Selection rules

1. Use `block` for buttons, counters, badges, and compact labels.
2. Use `word` for headings and sentences.
3. Use `char` only for short expressive text.
4. Use `line` only for explicit newline-delimited content, never responsive visual lines.
5. Prefer stable presets over custom variants.
6. Prefer named groups over copied duration constants when several values must finish together.

## Group rules

- Put `ReSwapProvider` at the nearest stable common ancestor of all synchronized values.
- Group names are application-owned strings; do not assume `language` is special.
- The same group shares a phase finish, not necessarily identical segment motion.
- When a value belongs to several groups, set `activeGroup` from the event that caused the change.
- Declare provider `values` only when relevant strings are unmounted and must influence timing.
- Treat explicit `phaseDuration` as a strict override.

## Accessibility rules

- Do not recreate animated text with nested spans outside the component.
- Do not add a live region to page-wide language changes or decorative copy.
- For a meaningful asynchronous status, use an atomic polite live region on the semantic container.
- Preserve reduced-motion behavior.

## Do not

- Do not remount ReSwap by keying it to its text.
- Do not synchronize unrelated interactions merely because they occur on one page.
- Do not use advanced transition props before checking whether a preset and group express the requirement.
- Do not use ReSwap for icon morphing or arbitrary content transitions.
- Do not reintroduce deprecated `trigger`, `totalDuration`, or `groups` props on `ReSwap`.

## Verification checklist

Run `npm test`, `npm run typecheck`, and `npm run build`. Then verify short/long content, narrow wrapping, rapid repeated updates, reduced motion, server rendering, and keyboard interaction of surrounding controls. Treat VoiceOver as a recommended manual check for announced statuses.

