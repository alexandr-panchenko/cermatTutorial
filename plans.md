# plans.md

## Design review of repository documents

The planning docs are consistent on the most important point: the app is neither a generic math course nor a generic quiz bank. The strongest design decision is the exam-ordered guided tutorial, because it keeps the cognitive load low and mirrors the real context the student will face.

## What the current MVP implements

- Project skeleton in Astro + TypeScript
- Data-driven tutorial and review content
- Localized Czech/Ukrainian interaction model
- Step engine with feedback, hints, and local translation reveal
- Persistent progress tracking for tutorial flow
- Summary and weak-skill aggregation
- Prototype mistake-review selection logic
- Cloudflare Durable Object scaffolding for progress sync

## Recommended next expansion steps

1. Replace placeholder tasks 5–16 in Tutorial A with real seed content.
2. Add seed content for Tutorial B so review can compare variants.
3. Persist review-mode progress in the same aggregate model as tutorial flow.
4. Add small SVG diagrams for geometry and spatial tasks.
5. Add JSON validation tooling so content mistakes fail fast during development.

## Risks to watch

- Too much explanatory text would weaken the core interaction loop.
- Overuse of React could complicate a content-heavy app that mostly needs structured rendering.
- Weak error-tag discipline would make mistake-review recommendations much less useful.
