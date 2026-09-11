# Recipes

## Button label

Keep the button as the interactive owner and render ReSwap inside it:

```tsx
<button type="button" onClick={save}>
  <ReSwap as="span" per="block" preset="scale-blur">
    {saved ? "Saved" : "Save"}
  </ReSwap>
</button>
```

If the icon changes too, animate it with a dedicated icon-swap component. ReSwap intentionally accepts text rather than arbitrary nodes.

## Language switch

```tsx
<ReSwapProvider>
  <header>
    <ReSwap as="h1" per="word" group="language" preset="gentle-blur">
      {copy.title}
    </ReSwap>
  </header>
  <ReSwap per="word" group="language" preset="gentle-blur">
    {copy.description}
  </ReSwap>
</ReSwapProvider>
```

Do not add `aria-live` to every translated string. The focused language control already communicates the user action, and announcing an entire page creates noise.

## Card shuffle plus language switch

```tsx
type ChangeSource = "language" | "card";

<ReSwap
  group={["language", "card"]}
  activeGroup={changeSource}
  preset="scale-blur"
  per="block"
>
  {card.type}
</ReSwap>
```

Set `changeSource` in the same event that changes the content. Group names need only be consistent inside the provider.

## Meaningful status announcement

```tsx
<ReSwap
  as="p"
  per="block"
  animate={true}
  containerProps={{ role: "status", "aria-live": "polite", "aria-atomic": true }}
>
  {uploadStatus}
</ReSwap>
```

Use this only if the status would otherwise be missed. Avoid live regions for decorative swaps.

## Explicit duration

```tsx
<ReSwap phaseDuration={0.32} per="block">
  {label}
</ReSwap>
```

This is a strict phase duration. Use it for a designed interaction with known content, not as the default response to timing problems. For related dynamic copy, a named group usually captures the intent better.

