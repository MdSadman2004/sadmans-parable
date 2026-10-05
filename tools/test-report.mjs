import fs from 'node:fs/promises';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
const EXPECTED_PASS = 33;
const result = { tests: [], pass_count: 0, fail_count: 0, skip_count: 0 };
const stream = run({ files: [new URL('../tests/rules.test.mjs', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')], isolation: 'process' });
stream.on('data', event => {
 if (event.type === 'test:pass') { result.pass_count++; result.tests.push({ name: event.data.name, passed: true }); }
 if (event.type === 'test:fail') { result.fail_count++; result.tests.push({ name: event.data.name, passed: false, error: String(event.data.details?.error) }); }
 if (event.type === 'test:summary' && event.data?.counts) result.skip_count = event.data.counts.skipped || 0;
});
stream.compose(new spec()).pipe(process.stdout);
await new Promise(resolve => stream.on('end', resolve));
await fs.writeFile(new URL('../qa/unit-results.json', import.meta.url), JSON.stringify(result, null, 2));
if (result.fail_count || result.pass_count !== EXPECTED_PASS || result.skip_count) process.exitCode = 1;
