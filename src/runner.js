const { steps: builtins } = require('./steps');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Run one step, retrying with linear backoff.
async function runStep(step, ctx, registry, backoffMs) {
  const handler = registry[step.type];
  if (!handler) throw new Error(`Unknown step type "${step.type}"`);
  const attempts = (step.retries ?? 0) + 1;
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return { ok: true, value: await handler(step, ctx), attempts: i };
    } catch (err) {
      lastErr = err;
      if (i < attempts) await sleep(backoffMs * i);
    }
  }
  return { ok: false, error: lastErr.message, attempts };
}

// Run a workflow sequentially. Stops at the first failed step unless it has continueOnError.
async function runWorkflow(workflow, { registry = builtins, backoffMs = 100 } = {}) {
  const ctx = {};
  const results = [];
  for (const step of workflow.steps) {
    const res = await runStep(step, ctx, registry, backoffMs);
    results.push({ id: step.id, ...res });
    if (res.ok) ctx[step.id] = res.value;
    else if (!step.continueOnError) return { ok: false, results };
  }
  return { ok: true, results };
}

module.exports = { runWorkflow, runStep };
