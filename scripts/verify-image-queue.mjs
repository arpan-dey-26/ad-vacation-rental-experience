import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Deterministic queue checks; these do not stand in for live-origin browser QA.
const code = ts.transpileModule(readFileSync('src/lib/referenceImageQueue.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup() {
  let now = 0;
  let id = 0;
  let active = 0;
  let maxActive = 0;
  const timers = new Map();
  const requests = [];
  class TestImage {
    set src(src) {
      active++;
      maxActive = Math.max(maxActive, active);
      requests.push({ src, time: now, image: this });
    }
    settle(success) {
      active--;
      this.naturalWidth = success ? 1440 : 0;
      this.naturalHeight = success ? 1080 : 0;
      (success ? this.onload : this.onerror)();
    }
  }
  const context = {
    exports: {},
    Image: TestImage,
    Date: { now: () => now },
    setTimeout: (fn, delay) => {
      timers.set(++id, { fn, at: now + delay });
      return id;
    },
    clearTimeout: (key) => timers.delete(key),
  };
  vm.runInNewContext(code, context);
  return {
    ...context.exports,
    requests,
    maxActive: () => maxActive,
    advance(ms = 0) {
      const end = now + ms;
      for (;;) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
      }
      now = end;
    },
  };
}
const consumer = (priority, notify = () => {}, needed = () => true) => ({
  priority,
  notify,
  needed,
});

{
  const q = setup();
  let notified = 0;
  q.subscribeImage('lazy', consumer(1));
  q.subscribeImage(
    'hero',
    consumer(3, () => notified++),
  );
  const unsubscribe = q.subscribeImage(
    'hero',
    consumer(3, () => notified++),
  );
  q.advance();
  assert.deepEqual(
    q.requests.map((r) => r.src),
    ['hero'],
  );
  q.subscribeImage('lightbox', consumer(3));
  q.advance();
  assert.equal(q.requests.length, 1, 'active request is not preempted');
  q.requests[0].image.settle(true);
  q.advance();
  assert.equal(notified, 2, 'both consumers receive the shared result');
  assert.equal(q.requests[1].src, 'lightbox');
  unsubscribe();
  q.subscribeImage('hero', consumer(3));
  q.requests[1].image.settle(true);
  q.advance();
  q.requests[2].image.settle(true);
  q.advance();
  assert.deepEqual(
    q.requests.map((r) => r.src),
    ['hero', 'lightbox', 'lazy'],
  );
  assert.equal(q.imageLoaded('hero'), true);
  assert.equal(q.maxActive(), 1);
}
{
  const q = setup();
  q.subscribeImage('failing', consumer(3));
  q.subscribeImage('failing', consumer(3));
  q.subscribeImage('other', consumer(1));
  q.advance();
  q.requests[0].image.settle(false);
  q.advance(1999);
  assert.equal(q.requests.length, 1, 'origin cooldown prevents other requests');
  q.advance(1);
  q.requests[1].image.settle(false);
  q.advance(4999);
  assert.equal(q.requests.length, 2);
  q.advance(1);
  q.requests[2].image.settle(false);
  q.advance(5000);
  q.requests[3].image.settle(true);
  q.subscribeImage('failing', consumer(3));
  q.advance(20000);
  assert.deepEqual(
    q.requests.filter((r) => r.src === 'failing').map((r) => r.time),
    [0, 2000, 7000],
  );
  assert.equal(q.imageLoaded('failing'), false);
  assert.equal(q.maxActive(), 1);
}
{
  const q = setup();
  const cancel = q.subscribeImage('unmounted', consumer(3));
  cancel();
  q.subscribeImage(
    'covered',
    consumer(3, undefined, () => false),
  );
  q.subscribeImage('visible', consumer(2));
  q.advance();
  assert.deepEqual(
    q.requests.map((r) => r.src),
    ['visible'],
  );
}
process.stdout.write(
  'PASS: serialization, priority, shared results, cache reuse, 2s/5s retries, three-attempt cap, origin cooldown, cancelled/covered consumers.\n',
);
