import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
class TFolder { constructor(path) { this.path = path; } }
class Base {}
class SuggestModal {
  constructor(app) { this.app = app; }
  setPlaceholder() {}
  onClose() {}
  selectSuggestion(item) { this.onClose(); this.onChooseSuggestion(item); }
}
const context = { console, URL, URLSearchParams, module: {exports:{}}, require(name) {
  if (name === 'obsidian') return { Plugin: Base, PluginSettingTab: Base, SuggestModal, TFolder, Notice: Base, normalizePath: p => p };
  if (name === '@codemirror/view') return {WidgetType: Base};
  throw Error(name);
}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8') + '\nthis.api = {validateNotesFolder, NotesFolderPicker, NetdiskAiNotesPlugin, DEFAULT_SETTINGS};', context);
const {validateNotesFolder, NotesFolderPicker, NetdiskAiNotesPlugin, DEFAULT_SETTINGS} = context.api;
const entries = new Map([['课程', new TFolder('课程')], ['file.md', {}]]);
const app = {vault: {getAbstractFileByPath: p => entries.get(p), getAllLoadedFiles: () => [...entries.values()], createFolder: async p => {entries.set(p, new TFolder(p));}}};
assert.equal(validateNotesFolder(app, ''), '');
assert.equal(validateNotesFolder(app, '课程\\新课'), '课程/新课');
for (const path of ['../outside', '/absolute', 'C:\\outside', 'file.md/sub', '.obsidian', 'bad?name']) assert.throws(() => validateNotesFolder(app, path));
assert.equal(DEFAULT_SETTINGS.askNotesFolder, true);
let result;
const picker = new NotesFolderPicker(app, '', value => result = value);
assert.ok(picker.getSuggestions('课程').some(item => item.path === '课程' && !item.create));
assert.ok(picker.getSuggestions('新课').some(item => item.create));
picker.selectSuggestion({path: ''}, {});
assert.equal(result, '');
new NotesFolderPicker(app, '', value => result = value).onClose();
assert.equal(result, null);
const plugin = new NetdiskAiNotesPlugin();
plugin.app = app;
plugin.settings = {notesFolder: '固定', askNotesFolder: false};
assert.equal(await plugin.selectImportFolder(), '固定');
assert.equal(await plugin.createNotePath('Lesson', '课程/新课'), '课程/新课/Lesson.md');
assert.ok(entries.has('课程/新课'));
assert.equal(plugin.settings.notesFolder, '固定');
assert.equal(await plugin.createNotePath('Lesson', ''), 'Lesson.md');
context.chooseNotesFolder = async () => null;
plugin.settings.askNotesFolder = true;
assert.equal(await plugin.selectImportFolder(), null);
context.findFcbWebview = () => ({});
context.getWebviews = () => [{}];
context.safeWebviewUrl = () => 'https://example.test';
context.isFcbUrl = () => true;
plugin.importWebview = () => { throw Error('Cancellation must prevent capture'); };
await plugin.importCurrentNote();
await plugin.importAllOpenNotes();
let prompts = 0;
plugin.selectImportFolder = async () => { prompts++; return '课程'; };
context.getFcbIdentity = () => 'note';
vm.runInContext('import_obsidian4.Notice = class {setMessage() {} hide() {}};', context);
plugin.importWebview = async (_view, _notice, _keep, folder) => { assert.equal(folder, '课程'); return {skipped: false}; };
await plugin.importAllOpenNotes();
assert.equal(prompts, 1);
console.log('Passed: folder selection, root, nested creation, validation, fixed destination, cancellation before capture, batch destination.');
// Verify the real import pipeline passes the selected destination to image conversion.
delete plugin.importWebview;
plugin.findImportedFile = () => null;
plugin.resolveVideoUrl = () => 'video';
plugin.composeNote = () => 'note';
plugin.openFileReplacingWebview = async () => {};
plugin.closeWebviewLeaves = () => {};
app.vault.create = async path => ({path});
context.extractFcbSnapshot = async () => ({url: 'source', title: 'Lesson', html: '', videoUrlCandidates: []});
let imageFolder;
context.convertHtmlToMarkdown = async options => { imageFolder = options.attachmentsFolder; return ''; };
for (const folder of ['课程/新课', '', '固定']) {
  await plugin.importWebview({}, {}, false, folder);
  assert.equal(imageFolder, folder ? `${folder}/attachments` : 'attachments');
}
// Sync derives the destination from the current file, including after a move.
plugin.getActiveManagedFile = () => ({path: '已移动/Lesson.md', basename: 'Lesson'});
plugin.getActiveFrontmatter = () => ({fcb_url: 'source'});
plugin.settings.syncMode = 'replace';
app.vault.read = async () => '<!-- BAIDU_AI_START -->\n<!-- BAIDU_AI_END -->';
// Use the actual markers to exercise the complete sync path.
vm.runInContext('this.testManagedContent = START_MARKER + "\\n" + END_MARKER;', context);
app.vault.read = async () => context.testManagedContent;
app.vault.modify = async () => {};
app.fileManager = {processFrontMatter: async (_file, callback) => callback({})};
plugin.renameLegacyManagedFile = async () => {};
await plugin.syncCurrentNote();
assert.equal(imageFolder, '已移动/attachments');
console.log('Passed: image destinations for nested, root and fixed imports, and moved-note sync.');
