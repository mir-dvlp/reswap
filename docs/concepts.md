# Concepts and timing

## A swap has two visual phases

With the default sequential behavior, the old value exits and the new value enters. `phaseDuration` describes one of those phases, not the entire swap. A `0.32s` phase therefore produces roughly `0.64s` of visual activity, plus `delay`.

## Natural duration

ReSwap derives a natural duration from the number of animated segments, the preset, and speed controls. The stagger sweep is capped so a long paragraph cannot create an indefinitely long animation. Character mode also has a segment limit and falls back for long content.

## Named timing groups

A group is a timing relationship, not a content type. Its name is an arbitrary string owned by the application.

When several mounted values register with the same group, the provider resolves the longest natural phase duration. Every member receives that phase duration, so their phases end together. Their individual segments may still start at different moments; synchronization means a shared finish, not identical internal motion.

```tsx
<ReSwapProvider>
  <ReSwap group="language">{shortLabel}</ReSwap>
  <ReSwap group="language">{longHeading}</ReSwap>
</ReSwapProvider>
```

If values that influence timing are not mounted, declare them on the provider:

```tsx
<ReSwapProvider groups={{
  language: { values: allTranslatedStrings },
}}>
  {children}
</ReSwapProvider>
```

An explicit provider `phaseDuration` is a strict override. Registered content cannot lengthen it.

## Overlapping groups

One text may react to more than one event:

```tsx
<ReSwap group={["language", "card"]} activeGroup={changeSource}>
  {value}
</ReSwap>
```

Set `activeGroup` to the event responsible for the current update. If it is omitted, ReSwap safely uses the longest available group. An unknown active group warns in development and falls back.

## Height stabilization

`stabilizeHeight` measures outgoing and incoming content so surrounding layout can move smoothly when wrapping changes.

- `after-exit`: old text leaves, then height changes. This makes the sequence easiest to read.
- `with-exit`: height changes while old text leaves. This is more compact but creates more simultaneous motion.

Disable height stabilization only when the surrounding layout already owns size animation or the container has a deliberately fixed height.

## Update policy

ReSwap uses latest-wins semantics. While a swap is active, repeated updates replace the pending target. It completes the current transition and proceeds to the latest value instead of replaying every intermediate value. This prevents click-spam from building a long animation queue.

## Reduced motion

When reduced motion is requested, content updates immediately. The semantic text remains correct and no animation queue is retained.

