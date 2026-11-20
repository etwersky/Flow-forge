# FlowForge

A tiny, zero-dependency workflow automation engine. Define steps in JSON, and FlowForge runs them in order with shared context, `{{templating}}`, and automatic retries.

> Mock project created for a Claude Code demo.

## Quick start

```bash
npm start                                   # run the sample workflow
node bin/flowforge.js workflows/nightly-report.json
npm test
```

## Workflow format

```json
{ "name": "My flow", "steps": [
  { "id": "pull", "type": "fetch", "mockItems": ["a"], "retries": 2 },
  { "id": "say",  "type": "log",   "message": "Got {{pull.items}}" }
]}
```

Step options: `retries` (linear backoff), `continueOnError`.
Step types: `log`, `shell`, `fetch` (mocked), `transform`, `fail`.

## Layout

- `bin/flowforge.js` – CLI
- `src/runner.js` – sequential runner with retries
- `src/steps.js` – built-in step types and templating
- `tests/` – `node --test` suite
