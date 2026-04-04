# AGENTS

## Product guardrails

- Do not turn the app into a static textbook.
- Do not turn the app into a plain exam simulator.
- Preserve the exam order as the main route through the product.
- Prefer interaction over explanation walls.
- Keep the architecture simple and JSON-driven.

## Language guardrails

- Czech: task statements, step prompts, answer options
- Ukrainian: intros, hints, feedback, summaries, review messaging
- Translation reveal must stay local per segment or per task
- Default visible layer remains Czech

## Content authoring rules

- Each step should represent one small decision
- Each step must have 4 options
- Exactly 1 option is correct
- Wrong options should encode realistic confusion, not random noise
- Every task should carry skill tags and error tags

## Engineering guardrails

- Astro first, React only for interactive islands
- Use JSON content, not hardcoded task components
- Keep progress model compatible with local persistence and Durable Object sync
- Favor calm, fast, mobile-friendly UI over flashy complexity
