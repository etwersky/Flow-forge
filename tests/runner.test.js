const test = require('node:test');
const assert = require('node:assert');
const { runWorkflow } = require('../src/runner');
const { render } = require('../src/steps');

test('render fills nested context values', () => {
  assert.strictEqual(render('hi {{a.b}}', { a: { b: 'there' } }), 'hi there');
});

test('runs steps in order and shares context', async () => {
  const out = await runWorkflow({ steps: [
    { id: 'a', type: 'fetch', mockItems: [1] },
    { id: 'b', type: 'log', message: 'n={{a.status}}' },
  ]});
  assert.ok(out.ok);
  assert.strictEqual(out.results[1].value, 'n=200');
});

test('retries a flaky step until it succeeds', async () => {
  let calls = 0;
  const registry = { flaky: async () => { if (++calls < 3) throw new Error('nope'); return 'ok'; } };
  const out = await runWorkflow({ steps: [{ id: 'f', type: 'flaky', retries: 2 }] }, { registry, backoffMs: 1 });
  assert.ok(out.ok);
  assert.strictEqual(out.results[0].attempts, 3);
});

test('stops at first failure unless continueOnError', async () => {
  const wf = (flag) => ({ steps: [
    { id: 'x', type: 'fail', continueOnError: flag },
    { id: 'y', type: 'log', message: 'after' },
  ]});
  assert.strictEqual((await runWorkflow(wf(false))).results.length, 1);
  assert.strictEqual((await runWorkflow(wf(true))).results.length, 2);
});
