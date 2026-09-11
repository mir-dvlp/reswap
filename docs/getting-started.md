# Getting started

## 1. Install

```bash
npm install @mir-ui/reswap motion
```

## 2. Animate one value

```tsx
import { ReSwap } from "@mir-ui/reswap";

<ReSwap as="span" per="block" preset="scale-blur">
  {isSaved ? "Saved" : "Save"}
</ReSwap>
```

Use a plain string as `children`. Keep the `ReSwap` mounted and change the string; remounting the component prevents it from observing the old and new values.

## 3. Choose the semantic element

`as` controls the real HTML element. Use `h1`–`h6` for headings, `p` for paragraphs, and `span` inside controls. ReSwap does not make its container interactive.

## 4. Choose how the text is divided

- `per="block"` for a button label or counter.
- `per="word"` for headings and short copy.
- `per="char"` for short display text where individual motion is intentional.
- `per="line"` only when the value contains authored newline characters.

Do not use `line` to target lines produced by responsive CSS wrapping. Those lines depend on fonts and container width and are not stable text segments.

## 5. Synchronize a page-level change

```tsx
import { ReSwap, ReSwapProvider } from "@mir-ui/reswap";

function Page({ locale }: { locale: "en" | "ru" }) {
  return (
    <ReSwapProvider>
      <ReSwap as="h1" group="language">{copy[locale].title}</ReSwap>
      <ReSwap group="language">{copy[locale].description}</ReSwap>
    </ReSwapProvider>
  );
}
```

The provider measures the natural phase duration of mounted participants. Members of one group then finish the phase together. Place the provider above every participant but as close to them as practical.

## 6. Verify the result

Test the shortest and longest values, narrow wrapping, rapid repeated clicks, reduced motion, keyboard operation of the surrounding control, and at least one server render. Use a screen reader when a changing value is semantically important enough to announce.

