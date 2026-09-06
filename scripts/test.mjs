import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Script } from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const code = await readFile(join(root, 'main.js'), 'utf8');
class Base {}
const context = {
  module: { exports: {} }, console, URL, URLSearchParams,
  require(name) {
    if (name === 'obsidian') return { Plugin: Base, PluginSettingTab: Base };
    if (name === '@codemirror/view') return { WidgetType: Base };
    throw new Error(`Unexpected dependency: ${name}`);
  },
};
new Script(code + '\nthis.api = { NetdiskAiNotesPlugin, DEFAULT_SETTINGS, secondsFromVideoHref, mergeMissingHeadingSections, replaceManagedSection, START_MARKER, END_MARKER };').runInNewContext(context);
const { api } = context;
const name = 'Netdisk AI Notes Importer';
assert.equal(api.DEFAULT_SETTINGS.notesFolder, name);
assert.equal(api.DEFAULT_SETTINGS.attachmentsFolder, `${name}/attachments`);

async function load(data) {
  const plugin = new api.NetdiskAiNotesPlugin();
  let writes = 0;
  plugin.loadData = async () => data;
  plugin.saveData = async () => { writes++; };
  await plugin.loadSettings();
  return { plugin, writes };
}
for (const folder of ['Baidu AI Notes/attachments', 'attachments/BaiduAI']) {
  const data = { notesFolder: 'Baidu AI Notes', attachmentsFolder: folder, videoByFcbUrl: { example: 'saved-link' } };
  const { plugin, writes } = await load(data);
  assert.equal(plugin.settings.notesFolder, name);
  assert.equal(plugin.settings.attachmentsFolder, `${name}/attachments`);
  assert.equal(plugin.settings.videoByFcbUrl.example, 'saved-link');
  assert.equal(writes, 1);
  assert.equal((await load(plugin.settings)).writes, 0);
}
for (const folders of [['Courses', 'Assets'], ['', '']]) {
  const { plugin, writes } = await load({ notesFolder: folders[0], attachmentsFolder: folders[1] });
  assert.equal(plugin.settings.notesFolder, folders[0]);
  assert.equal(plugin.settings.attachmentsFolder, folders[1]);
  assert.equal(writes, 0);
}
assert.equal((await load(null)).plugin.settings.notesFolder, name);
assert.equal(api.secondsFromVideoHref('https://pan.baidu.com/pfile/video#t=01:23'), 83);
assert.equal(api.secondsFromVideoHref('https://example.org/pfile/video#t=01:23'), null);
const merged = api.mergeMissingHeadingSections('## A\nMy edits', '## A\nRemote edits\n## B\nNew section');
assert.ok(merged.markdown.includes('My edits'));
assert.ok(!merged.markdown.includes('Remote edits'));
assert.ok(merged.markdown.includes('New section'));
const before = `User prefix\n${api.START_MARKER}\nOld\n${api.END_MARKER}\nUser suffix`;
assert.equal(api.replaceManagedSection(before, 'Replacement'), 'User prefix\nReplacement\nUser suffix');
console.log('Passed: defaults, migration, custom folders, saved mappings, timestamps and sync preservation.');
