#!/usr/bin/env node
const fs = require('node:fs');
const { runWorkflow } = require('../src/runner');

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage: flowforge <workflow.json>'); process.exit(1); }
  let workflow;
  try { workflow = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error(`Could not read workflow: ${e.message}`); process.exit(1); }

  console.log(`Running "${workflow.name}"`);
  const { ok, results } = await runWorkflow(workflow);
  for (const r of results) {
    console.log(`${r.ok ? '✔' : '✘'} ${r.id} (${r.attempts} attempt${r.attempts > 1 ? 's' : ''})${r.ok ? '' : ' - ' + r.error}`);
  }
  process.exit(ok ? 0 : 1);
}
main();
