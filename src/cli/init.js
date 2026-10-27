import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const templateRoot = join(packageRoot, '..', 'templates', 'worker');

export function initProject(destination) {
  if (existsSync(destination) && existsSync(join(destination, 'package.json'))) {
    throw new Error(`Refusing to overwrite an existing project: ${destination}`);
  }
  mkdirSync(destination, { recursive: true });
  cpSync(templateRoot, destination, { recursive: true });
}
