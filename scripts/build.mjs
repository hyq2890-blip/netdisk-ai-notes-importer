import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Script } from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// Preserve the existing shared scope and dependency versions without re-bundling.
const parts = [
  'src/bootstrap.js',
  'vendor/turndown.js',
  'vendor/turndown-plugin-gfm.js',
  'src/converter.js',
  'src/editor-timestamps.js',
  'src/folder-picker.js',
  'src/settings.js',
  'src/defaults.js',
  'src/webview.js',
  'src/inline-import.js',
  'src/main.js',
];
const chunks = await Promise.all(parts.map(path => readFile(join(root, path), 'utf8')));
const license = await readFile(join(root, 'vendor/LICENSE'), 'utf8');
const projectLicense = await readFile(join(root, 'LICENSE'), 'utf8');
const output = '/*! Netdisk AI Notes Importer license:\n' + projectLicense.trimEnd() + '\n*/\n' + '/*! Bundled Turndown and turndown-plugin-gfm license:\n' + license.trimEnd() + '\n*/\n' + chunks.map(text => text.trimEnd() + '\n').join('\n');
new Script(output, { filename: 'main.js' });
await writeFile(join(root, 'main.js'), output, 'utf8');
console.log('Built main.js from src/ and vendor/.');
