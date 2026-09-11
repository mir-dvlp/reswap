# API reference

Import stable APIs from `@mir-ui/reswap`.

## `ReSwap`

Required:

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `string` | Current complete text value |

Basic props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | semantic element name | `"p"` | Rendered HTML element |
| `preset` | `gentle \| gentle-blur \| blur \| scale-blur` | `gentle` | Motion recipe |
| `per` | `word \| char \| block \| line` | `word` | Segmentation strategy |
| `group` | `string \| string[]` | — | Named timing memberships |
| `activeGroup` | `string` | — | Group responsible for this update |
| `animate` | `boolean` | `true` | Disable to update immediately |
| `heightTiming` | `after-exit \| with-exit` | `after-exit` | When measured height changes |

Advanced props:

| Prop | Description |
| --- | --- |
| `phaseDuration` | Strict duration in seconds for one exit or enter phase |
| `phaseOverlap` | Overlap between exit and enter in seconds; `scale-blur` defaults to `0.16` |
| `delay` | Delay before the transition |
| `speedReveal` | Multiplier for overall reveal timing |
| `speedSegment` | Multiplier for individual segment motion |
| `staggerSweep` | Portion of the phase available to stagger starts |
| `layoutDuration` | Measured container layout duration |
| `layout` | Motion layout behavior forwarded to the container |
| `stabilizeHeight` | Enable measured height animation |
| `maxAnimatedSegments` | Segment count above which safe fallback is used |
| `variants` | Custom segment variants; use only for authored motion systems |
| `containerTransition` | Motion transition override for the container |
| `segmentTransition` | Motion transition override for segments |
| `segmentWrapperClassName` | Class placed on animated segment wrappers |
| `containerProps` | Semantic container attributes, including optional live-region props |

Prefer basic props. Advanced overrides make group timing and presets easier to accidentally contradict.

## `ReSwapProvider`

```tsx
<ReSwapProvider groups={optionalDeclarations}>{children}</ReSwapProvider>
```

The provider coordinates mounted participants by their `group` names. `groups` is optional and accepts a record whose values may declare `values`, `per`, speed controls, or a strict `phaseDuration` for content not fully represented by mounted participants.

## Core utilities

Import pure timing and segmentation helpers from `@mir-ui/reswap/core`. They are useful for tests and tooling; UI code should normally use `ReSwap` and `ReSwapProvider`.

## Legacy entry

`@mir-ui/reswap/legacy` exports compatibility helpers and deprecated prop aliases. It is not the recommended source for new code. See [migration.md](./migration.md).
