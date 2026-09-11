# Migration and legacy API

New code should import from `@mir-ui/reswap`.

## Import compatibility helpers explicitly

```diff
- import { ReSwapGroup } from "@mir-ui/reswap";
+ import { ReSwapGroup } from "@mir-ui/reswap/legacy";
```

`ReSwapGroup` accepts the previous declaration-oriented shape. It exists to make migration gradual; it is not the preferred composition.

## Rename deprecated props

```diff
- <ReSwap trigger={enabled} totalDuration={0.32} groups={["language"]}>
+ <ReSwap animate={enabled} phaseDuration={0.32} group="language">
```

For new synchronized code, prefer automatic named-group timing over a copied `phaseDuration`:

```tsx
<ReSwapProvider>
  <ReSwap group="language">{title}</ReSwap>
  <ReSwap group="language">{description}</ReSwap>
</ReSwapProvider>
```

Experimental `ReSwapContent`/`ContentSwap` prototypes are not exported. Replace text-only usages with `ReSwap`; keep arbitrary-content or icon animation in a separate local component until that problem has a stable independent contract.

