# Contributing

Before opening a change, run:

```bash
npm test
npm run typecheck
npm run build
```

Keep the stable entry small. New behavior should preserve plain-string semantics, reduced motion, grapheme-safe segmentation, server rendering, latest-wins updates, and assistive-technology output. Put compatibility code in `src/legacy.tsx`; do not expose experimental arbitrary-content animation from the stable entry.

When changing timing, add a pure timing test and a rendered behavior test. When changing the public API, update README, API reference, AI usage guide, `llms.txt`, and CHANGELOG in the same change.

