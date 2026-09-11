# ReSwap

Accessible animated text replacement for React. ReSwap can animate one label, coordinate every text affected by a language switch, preserve readable wrapping, and smoothly resize its container when line count changes.

## Install

```bash
npm install @mir-ui/reswap motion
```

ReSwap supports React 18+ and Motion 12+.

## First swap

```tsx
import { ReSwap } from "@mir-ui/reswap";

export function SaveLabel({ saved }: { saved: boolean }) {
  return (
    <ReSwap as="span" per="block" preset="scale-blur">
      {saved ? "Saved" : "Save"}
    </ReSwap>
  );
}
```

`children` must be a string. Change that string and ReSwap animates the replacement. The rendered element remains semantic, and assistive technology receives one complete text value instead of fragmented animated spans.

## Synchronize related texts

Wrap the nearest stable common ancestor in `ReSwapProvider`, then assign any application-defined group name:

```tsx
import { ReSwap, ReSwapProvider } from "@mir-ui/reswap";

<ReSwapProvider>
  <ReSwap as="h1" group="language">{title}</ReSwap>
  <ReSwap group="language">{description}</ReSwap>
</ReSwapProvider>
```

All mounted members of `language` finish each animation phase together, using the longest natural duration in that group. `language` is not reserved: `card`, `filters`, `pricing`, or any other string works.

A value may belong to several groups. Choose the group responsible for the current update with `activeGroup`:

```tsx
<ReSwap group={["language", "card"]} activeGroup={changeSource}>
  {cardTitle}
</ReSwap>
```

## Choose segmentation deliberately

| `per` | Best for | Behavior |
| --- | --- | --- |
| `word` | Headings and short sentences | Animates words and keeps words intact while wrapping |
| `block` | Buttons, counters, compact labels | Swaps the full value as one unit |
| `char` | Short expressive display text | Uses grapheme-safe characters; long values fall back safely |
| `line` | Copy containing explicit `\n` breaks | Animates authored lines, not browser-generated lines |

Available presets are `gentle`, `gentle-blur`, `blur`, and `scale-blur`.

## Important behavior

- Rapid updates use latest-wins behavior: intermediate values collapse and the newest pending value renders next.
- Reduced-motion users receive an immediate update.
- `heightTiming="after-exit"` waits for the old text to leave before resizing; `"with-exit"` starts resizing during exit.
- `phaseDuration` is one exit or enter phase. A sequential swap is approximately two phases, plus any delay.
- ReSwap animates text only. Keep arbitrary React nodes and icon morphing in a separate component.

## Accessibility

ReSwap hides visual fragments from assistive technology and exposes one complete accessible string. It does not announce changes by default. Add a live region only when the value is a meaningful status:

```tsx
<ReSwap
  as="p"
  per="block"
  containerProps={{ "aria-live": "polite", "aria-atomic": true }}
>
  {status}
</ReSwap>
```

VoiceOver and other screen-reader checks remain a recommended manual release check, not a runtime requirement.

## Documentation

- [Getting started](./docs/getting-started.md)
- [Mental model and timing](./docs/concepts.md)
- [API reference](./docs/api-reference.md)
- [Recipes](./docs/recipes.md)
- [Guide for coding agents](./docs/ai-usage.md)
- [Migration and legacy API](./docs/migration.md)

For tools that discover machine-oriented project context, start with [`llms.txt`](./llms.txt).

## Development

```bash
npm test
npm run typecheck
npm run build
npm pack --dry-run
```

The stable entry is `@mir-ui/reswap`. Compatibility helpers are isolated at `@mir-ui/reswap/legacy`. Experimental arbitrary-content swaps are deliberately not part of the package API.

MIT licensed.
