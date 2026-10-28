import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initProject } from '../src/cli/init.js';

const root = fileURLToPath(new URL('..', import.meta.url));

test('package exposes the public runtime entry point', async () => {
  const runtime = await import('../src/flaregram/index.js');
  const { bot } = await import('../src/flaregram/bot.js');
  assert.equal(typeof runtime.app.on_message, 'function');
  assert.equal(typeof runtime.Client, 'function');
  assert.equal(typeof bot.message.sendPhoto, 'function');
});

test('the repository has a deployable Worker entry point', () => {
  assert.equal(existsSync(join(root, 'src', 'index.js')), true);
});

test('initProject creates a usable Worker plugin starter', () => {
  const destination = mkdtempSync(join(tmpdir(), 'flaregram-'));
  initProject(destination);

  assert.equal(existsSync(join(destination, 'src', 'index.js')), true);
  assert.equal(existsSync(join(destination, 'src', 'plugins', 'start.js')), true);
  assert.match(
    readFileSync(join(destination, 'src', 'plugins', 'start.js'), 'utf8'),
    /app\.on_message\('\/start'/
  );
  assert.equal(existsSync(join(destination, '.dev.vars.sample')), true);
});
