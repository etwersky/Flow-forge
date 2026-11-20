# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FlowForge is a zero-dependency CommonJS Node project (CI uses Node 22). Workflows are JSON files listing steps, which run sequentially with shared context, `{{templating}}` and retries. There is no build or lint step.

## Commands

- Run the sample workflow: `npm start` (equivalent to `node bin/flowforge.js workflows/nightly-report.json`)
- Run any workflow: `node bin/flowforge.js <workflow.json>`
- All tests: `npm test` (built-in `node --test` runner, no framework)
- Single test: `node --test --test-name-pattern="<test name substring>" tests/runner.test.js`

## Architecture

- `bin/flowforge.js` is the CLI. It reads the workflow JSON, calls `runWorkflow`, prints one ✔/✘ line per step and exits 1 if the workflow failed.
- `src/runner.js` is the engine.
  - `runWorkflow(workflow, {registry, backoffMs})` runs steps in order and stops at the first failed step unless that step has `continueOnError`.
  - `runStep` retries up to `retries + 1` attempts with linear backoff (`backoffMs * attempt`). The default is 100ms; tests pass `backoffMs: 1`.
  - A step's return value is stored in the shared context under `ctx[step.id]`, and later steps read it through templating. Failed steps store nothing.
- `src/steps.js` holds the built-in step types (`log`, `shell`, `fetch`, `transform`, `fail`) and the `render` templating helper.
  - Each handler has the signature `(config, ctx) => value`.
  - `{{a.b}}` resolves a dotted path against the context, and missing values render as an empty string.
  - `fetch` is deliberately mocked (it returns `mockItems`) so runs are offline and deterministic.
  - `shell` runs `execSync` on the rendered command.
- The step registry is injectable. Tests pass a custom `registry` to `runWorkflow` to define ad-hoc step types, such as a flaky step. To add a built-in step type, add a handler to the `steps` object.

Tests exist only for the runner and `render` (`tests/runner.test.js`). The CLI and the individual step handlers have none.

## Repo location

This directory is a nested git repo (remote `etwersky/flow-forge`) inside the `build-lab` checkout. `/home/user/flow-forge` is a separate, empty clone with no commits. Work here, in `build-lab/flowforge`.
