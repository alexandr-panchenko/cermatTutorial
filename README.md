# Cermat Tutorial MVP

MVP web app for preparing a student for the Czech grade 9 math entrance exam through guided exam-like tutorials.

## What is included

- Astro + TypeScript app structure
- Cloudflare adapter configuration
- JSON-driven content model
- Home, tutorial select, task flow, summary, and mistake review pages
- Interactive step engine in React
- Local progress persistence in `localStorage`
- Best-effort sync API for a Cloudflare Durable Object
- Seed content for `Tutorial A` tasks 1–4
- `Tutorial B` and remaining tasks as expansion skeletons

## Product behavior

- Exam-facing text stays in Czech
- Support, hints, feedback, and summaries stay in Ukrainian
- Translation is local per segment or per task, not a global mode
- Main value is step-by-step guided reasoning, not passive reading

## Run locally

1. Install dependencies:

```bash
bun install
```

2. Start dev server:

```bash
bun run dev
```

3. Open the Astro app at the printed local URL.

## Build

```bash
bun run build
```

## Check

```bash
bun run check
```

## Deploy notes

- Target platform: Cloudflare Workers
- Durable Object binding name: `PROGRESS_HUB`
- A starter `wrangler.jsonc` is included with the first migration
- The app works with local browser persistence even when the Durable Object binding is not configured

## GitHub Actions deployment

Pushes to `main` can deploy automatically with GitHub Actions once these repository secrets are set:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

After adding those secrets, install dependencies once locally so `bun.lock` includes `wrangler`, then commit and push. The workflow will build the Astro app and run `wrangler deploy`, including the Durable Object migration defined in `wrangler.jsonc`.

## Content structure

Content lives in [src/content/tutorials](/home/alex/github/cermatTutorial/src/content/tutorials).

- [tutorial-a.json](/home/alex/github/cermatTutorial/src/content/tutorials/tutorial-a.json)
- [tutorial-b.json](/home/alex/github/cermatTutorial/src/content/tutorials/tutorial-b.json)
- [review-tasks.json](/home/alex/github/cermatTutorial/src/content/tutorials/review-tasks.json)

Each tutorial task includes:

- task metadata
- Ukrainian intro
- Czech prompt segments plus Ukrainian local translations
- step-by-step multiple choice flow
- hints
- feedback
- final takeaway
- skill tags and error tags

## Key code areas

- Routes: [src/pages](/home/alex/github/cermatTutorial/src/pages)
- Interactive flow: [src/components/TutorialPlayer.tsx](/home/alex/github/cermatTutorial/src/components/TutorialPlayer.tsx)
- Review prototype: [src/components/ReviewPlayer.tsx](/home/alex/github/cermatTutorial/src/components/ReviewPlayer.tsx)
- Types: [src/lib/types.ts](/home/alex/github/cermatTutorial/src/lib/types.ts)
- Content loader: [src/lib/content.ts](/home/alex/github/cermatTutorial/src/lib/content.ts)
- Progress and review selection: [src/lib/progress.ts](/home/alex/github/cermatTutorial/src/lib/progress.ts)
- Durable Object class: [src/lib/progress-do.ts](/home/alex/github/cermatTutorial/src/lib/progress-do.ts)

## Extending content

1. Add or replace placeholder tasks in tutorial JSON.
2. Keep every step to one small cognitive decision.
3. Use exactly 4 answer choices per step.
4. Make wrong answers reflect real student confusions.
5. Add matching `skillTags` and `errorTags`.
6. Add review tasks that target the same weak skills.

## Current MVP limits

- Full seed walkthrough exists for Tutorial A tasks 1–4
- Remaining tutorial tasks are structured placeholders
- Mistake review selection is implemented, but the review content pool is intentionally small
- Durable Object sync endpoint is scaffolded for deployment and local persistence remains the default development path
