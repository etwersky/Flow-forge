// Built-in step types. Each takes (config, ctx) and returns a value stored in ctx[step.id].
const { execSync } = require('node:child_process');

// Replace {{path.to.value}} with values from the context.
function render(template, ctx) {
  return String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) =>
    path.split('.').reduce((o, k) => (o == null ? o : o[k]), ctx) ?? ''
  );
}

const steps = {
  log: async (cfg, ctx) => {
    const msg = render(cfg.message, ctx);
    console.log(`  [log] ${msg}`);
    return msg;
  },
  shell: async (cfg, ctx) => execSync(render(cfg.command, ctx), { encoding: 'utf8' }).trim(),
  // Mocked HTTP fetch so demos run offline and deterministically.
  fetch: async (cfg) => ({ status: 200, items: cfg.mockItems ?? [] }),
  transform: async (cfg, ctx) => {
    const input = render(`{{${cfg.from}}}`, ctx);
    return cfg.op === 'upper' ? input.toUpperCase() : input;
  },
  fail: async (cfg) => { throw new Error(cfg.message ?? 'step failed'); },
};

module.exports = { steps, render };
