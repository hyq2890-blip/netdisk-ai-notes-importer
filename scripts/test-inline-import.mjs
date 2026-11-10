import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context = {URL, URLSearchParams, console, setTimeout, clearTimeout, import_obsidian4:{Plugin:class{}}, require:()=>({})};
vm.createContext(context);
vm.runInContext(['src/webview.js','src/inline-import.js','src/main.js'].map(p=>readFileSync(p,'utf8')).join('\n')+'\nthis.Plugin = NetdiskAiNotesPlugin;',context);
const url = 'https://pan.baidu.com/fcb/edit?fsid=101';
let current = url;
const webview = {getURL:()=>current,executeJavaScript:async()=>{}};
assert.equal(context.netdiskPageKind(url),'note');
assert.equal(context.netdiskPageKind('https://pan.baidu.com/disk/main'),'netdisk');
assert.equal(context.netdiskPageKind('https://example.com/?q=pan.baidu.com/fcb/edit'),'other');
context.extractFcbSnapshot = async()=>({url,title:'Lesson',html:'<p>Actual content</p>',hasEmbeddedVideo:false,videoUrlCandidates:['https://pan.baidu.com/pfile/video?path=/unrelated.mp4']});
context.convertHtmlToMarkdown = async()=> 'Actual content';
context.noteAttachmentsFolder = ()=> 'attachments';
let saved = 0;
let revealed = 0;
const plugin = {
 settings:{downloadImages:false},app:{vault:{create:async path=>{saved++;return {path};}}},
 findImportedFile:()=>null,resolveVideoUrl:()=>'',createNotePath:async()=> 'Lesson.md',composeNote:()=> 'Actual content',
 openFileReplacingWebview:async()=>{revealed++;}
};
const options = {reveal:false,expectedUrl:url};
const result = await context.Plugin.prototype.importWebview.call(plugin,webview,{setMessage(){}},'',options);
assert.equal(saved,1);assert.equal(revealed,0);assert.equal(result.file.path,'Lesson.md');
assert.equal(result.videoUrl,'','Unproven page links must not become video associations');
plugin.findImportedFile = ()=>({path:'Existing.md'});
plugin.app.metadataCache = {getFileCache:()=>({frontmatter:{video_url:''}})};
const existing = await context.Plugin.prototype.importWebview.call(plugin,webview,{setMessage(){}},'',options);
assert.equal(existing.skipped,true);assert.equal(saved,1);assert.equal(revealed,0);
plugin.findImportedFile = ()=>null;
current = 'https://pan.baidu.com/fcb/edit?fsid=202';
await assert.rejects(context.Plugin.prototype.importWebview.call(plugin,webview,{setMessage(){}},'',options),/页面已切换/);
assert.equal(saved,1);
current = url;
context.convertHtmlToMarkdown = async()=>{current='https://pan.baidu.com/disk/main';return 'body';};
await assert.rejects(context.Plugin.prototype.importWebview.call(plugin,webview,{setMessage(){}},'',options),/页面已切换/);
assert.equal(saved,1);

function barHarness(importer,folder='Notes') {
 const messages=[];let calls=0;let refreshes=0;
 const bar={url,ready:true,busy:false,disposed:false,webview,
  el:{setAttribute(){},removeAttribute(){}},primary:{setDisabled(){}},
  plugin:{selectImportFolder:async()=>folder,importWebview:async(...args)=>{calls++;return importer(...args);}},
  status:text=>messages.push(text),showResult(){messages.push('success');},async refresh(){refreshes++;}
 };
 return {bar,messages,get calls(){return calls;},get refreshes(){return refreshes;}};
}
current=url;
let finish;
let h=barHarness(()=>new Promise(resolve=>{finish=resolve;}));
const first=context.InlineImportBar.prototype.importNote.call(h.bar);
// Wait until folder selection and source-media pause complete.
while(!finish) await Promise.resolve();
await context.InlineImportBar.prototype.importNote.call(h.bar);
assert.equal(h.calls,1,'Double-click must not create a second import');
finish(result);await first;assert.equal(h.bar.result,result);assert.equal(h.bar.busy,false);
h=barHarness(()=>{throw Error('must not import');},null);
await context.InlineImportBar.prototype.importNote.call(h.bar);assert.equal(h.calls,0);assert.equal(h.refreshes,1);assert.equal(h.bar.busy,false);
h=barHarness(async()=>{throw Error('disk full');});
await context.InlineImportBar.prototype.importNote.call(h.bar);assert.ok(h.messages.some(m=>m.includes('disk full')));assert.equal(h.bar.ready,true);assert.equal(h.bar.busy,false);
h=barHarness(async()=>{current='https://pan.baidu.com/fcb/edit?fsid=202';return result;});
await context.InlineImportBar.prototype.importNote.call(h.bar);assert.equal(h.bar.result,undefined);assert.equal(h.refreshes,1);
console.log('Passed: inline save stays on page, duplicate detection, navigation safety, double-click guard, cancellation, failure recovery and stale-result isolation.');

const notices=[];
const expectedErrors=[];
context.console={...console,error:(...args)=>expectedErrors.push(args)};
context.import_obsidian4.Notice=class {constructor(text){notices.push(text);}hide(){}};
const command=Object.create(context.Plugin.prototype);
Object.assign(command,plugin,{selectImportFolder:async()=>{current='https://pan.baidu.com/fcb/edit?fsid=202';return 'Notes';},showImportResult(){throw Error('Navigation should have prevented import');}});
current=url;
await command.importCurrentNote(webview);
assert.equal(saved,1);assert.ok(notices.some(text=>text.includes('页面已切换')));
// A guide carries the URL it identified even if the page changed before click.
notices.length=0;
await command.importCurrentNote(webview,url);
assert.equal(saved,1);assert.ok(notices.some(text=>text.includes('页面已切换')));
// Batch targets are frozen before choosing the destination as well.
notices.length=0;current=url;
context.document={querySelectorAll:()=>[webview]};
context.import_obsidian4.Notice.prototype.setMessage=function(){};
await command.importAllOpenNotes();
assert.equal(saved,1);
assert.equal(expectedErrors.length,3);
assert.ok(notices.some(text=>text.includes('失败 1')));
console.log('Passed: commands, guide and batch reject source navigation while the destination is being chosen.');
