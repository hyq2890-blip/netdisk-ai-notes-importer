const vm = await import('node:vm');
const fs = await import('node:fs');
const ctx={console,URL,URLSearchParams,require:()=>({}),import_obsidian4:{Plugin:class{}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/webview.js','utf8')+'\n'+fs.readFileSync('src/main.js','utf8')+'\nthis.Plugin = NetdiskAiNotesPlugin;',ctx);
const assert=(await import('node:assert/strict')).default;
const a={getURL:()=> 'https://pan.baidu.com/fcb/edit?fsid=1'};
const b={getURL:()=> 'https://pan.baidu.com/fcb/edit?fsid=2'};
ctx.document={querySelectorAll:()=>[a,b]};
assert.equal(ctx.findFcbWebview(undefined,{workspace:{activeLeaf:{view:{containerEl:{contains:v=>v===b}}}}}),b);
assert.throws(()=>ctx.findFcbWebview(),/AI/);
assert.equal(ctx.findFcbWebview(a.getURL()),a);
ctx.document={querySelectorAll:()=>[a]};
assert.equal(ctx.findFcbWebview(),a);
const video='https://pan.baidu.com/pfile/video?path=/unrelated.mp4';
ctx.document={querySelectorAll:()=>[{getURL:()=>video}]};
assert.ok(fs.readFileSync('src/settings.js','utf8').includes('showImportGuide'));
console.log('Passed: active selection, ambiguous selection, explicit source, single source, unrelated video rejection, explicit video, timeout rejection, guide entry.');
// Import must save without navigating to any video, and reveal the resulting note.
ctx.document={querySelectorAll:()=>[]};
ctx.extractFcbSnapshot=async()=>({url:a.getURL(),title:'Lesson',html:'body',videoUrlCandidates:[]});
ctx.convertHtmlToMarkdown=async()=> 'body';
ctx.noteAttachmentsFolder=()=> 'attachments';
ctx.autoOpenLargeVideo=async()=>{throw Error('Import must not open a video');};
let opened;
const instance={
 settings:{downloadImages:false},app:{vault:{create:async path=>({path})}},
 findImportedFile:()=>null,resolveVideoUrl:()=>'',createNotePath:async()=> 'Lesson.md',composeNote:()=> 'body',
 openFileReplacingWebview:async(_,file)=>{opened=file.path;},openVideo:async()=>{throw Error('Import must not autoplay');}
};
const result=await ctx.Plugin.prototype.importWebview.call(instance,a,{setMessage(){}},'');
assert.equal(result.videoUrl,'');assert.equal(opened,'Lesson.md');
let revealed;let newTab;
const target={openFile:async(file,options)=>{assert.equal(options.active,true);}};
const workspace={iterateAllLeaves(){},getLeaf:kind=>{newTab=kind;return target;},revealLeaf:leaf=>{revealed=leaf;}};
await ctx.Plugin.prototype.openFileReplacingWebview.call({app:{workspace}},a,{path:'Lesson.md'});
assert.equal(newTab,'tab');assert.equal(revealed,target);
assert.equal(ctx.isVideoUrl('https://example.org/?u=pan.baidu.com/pfile/video'),false);
console.log('Passed: no automatic video navigation/playback, imported note revealed, source tab preserved, URL validation.');
// Central entry routing: reuse pages and blank tabs without overwriting notes.
function entryHarness(specs, activeIndex=0, failLoad=false) {
 const main={}, side={}; let created=0; let focused;
 side.collapsed=false;
 side.collapse=()=>{side.collapsed=true;};
 const leaves=specs.map(([type,url,sidebar=false])=>({
  type,url,sidebar,loads:0,detached:false,
  view:{getViewType(){return type;},containerEl:{querySelector:()=>null}},
  getRoot:()=>sidebar?side:main,
  getViewState:()=>({type,state:{url}}),
  async setViewState(state){this.loads++;if(failLoad)throw Error('load failed');this.state=state;},
  detach(){this.detached=true;}
 }));
 const workspace={rootSplit:main,rightSplit:side,activeLeaf:leaves[activeIndex],iterateAllLeaves:fn=>{for(const leaf of leaves){if(fn(leaf))return;}},
  getLeaf(kind){assert.equal(kind,'tab');created++;const leaf={loads:0,getRoot:()=>main,async setViewState(s){this.loads++;if(failLoad)throw Error('load failed');this.state=s;}};return leaf;},
  async revealLeaf(leaf){focused=leaf;},setActiveLeaf(leaf,options){assert.equal(options.focus,true);focused=leaf;}
 };
 return {app:{workspace},leaves,get created(){return created;},get focused(){return focused;}};
}
let h=entryHarness([['webviewer','https://pan.baidu.com/fcb/edit?fsid=1'],['markdown'],['webviewer','https://pan.baidu.com',true]],2);
assert.equal(await ctx.openNetdiskEntry(h.app),h.leaves[0]);assert.equal(h.created,0);assert.equal(h.leaves[0].loads,0);assert.equal(h.focused,h.leaves[0]);
assert.equal(h.app.workspace.rightSplit.collapsed,true,'Returning to Netdisk must reclaim the right sidebar space');
assert.equal(h.leaves[2].detached,false,'Collapsing the sidebar must preserve its other pages');
h=entryHarness([['empty'],['markdown']]);assert.equal(await ctx.openNetdiskEntry(h.app),h.leaves[0]);assert.equal(h.created,0);assert.equal(h.leaves[0].state.state.url,'https://pan.baidu.com');
h=entryHarness([['markdown'],['empty']]);assert.equal(await ctx.openNetdiskEntry(h.app),h.leaves[1]);assert.equal(h.leaves[0].loads,0);
h=entryHarness([['markdown'],['webviewer','https://example.org/?url=pan.baidu.com']]);await ctx.openNetdiskEntry(h.app);assert.equal(h.created,1);assert.equal(h.leaves[0].loads,0);assert.equal(h.leaves[1].loads,0);
h=entryHarness([['empty'],['webviewer','https://pan.baidu.com/fcb/edit?fsid=2',true]],1);await ctx.openNetdiskEntry(h.app);assert.equal(h.leaves[1].detached,true);assert.equal(h.leaves[0].state.state.url,'https://pan.baidu.com/fcb/edit?fsid=2');assert.equal(h.focused,h.leaves[0]);
h=entryHarness([['empty'],['webviewer','https://pan.baidu.com',true]],1,true);await assert.rejects(ctx.openNetdiskEntry(h.app),/load failed/);assert.equal(h.leaves[1].detached,false);assert.equal(h.app.workspace.rightSplit.collapsed,false);
h=entryHarness([['webviewer','https://pan.baidu.com/fcb/edit?fsid=1'],['webviewer','https://pan.baidu.com/fcb/edit?fsid=2']],1);assert.equal(await ctx.openNetdiskEntry(h.app),h.leaves[1]);
console.log('Passed: central reuse without reload, active-page preference, blank reuse, note preservation, sidebar relocation, failure preserves source.');
h=entryHarness([['webviewer','https://pan.baidu.com/disk/main'],['markdown']],1);
h.leaves[0].view.getViewType=()=> 'deferred';
assert.equal(await ctx.openNetdiskEntry(h.app),h.leaves[0],'A saved Netdisk tab must be reused before its view has loaded');
assert.equal(h.created,0);
h=entryHarness([['webviewer','https://pan.baidu.com/disk/main'],['markdown']],1);
h.leaves[0].view.containerEl.querySelector=()=>({getURL:()=> 'about:blank'});
assert.equal(await ctx.openNetdiskEntry(h.app),h.leaves[0],'A loading webview must use its saved destination');
assert.equal(h.created,0);

// A guide launched from Settings must leave the Settings window before creating
// its own modal; otherwise closing the guide exposes Settings over the web page.
let settingsClosed = false;
let mainWindowFocused = false;
let guideConstructed = false;
ctx.import_obsidian4.Modal = class {
 constructor() {
  assert.equal(settingsClosed, true, 'Settings must close before the guide is constructed');
  assert.equal(mainWindowFocused, true, 'The main window must regain focus first');
  guideConstructed = true;
  this.titleEl = {setText(){}};
  this.contentEl = {createEl:()=>({setText(){}})};
 }
 open() {}
};
ctx.import_obsidian4.Setting = class {
 setName(){return this;}
 addButton(callback){const button={setButtonText(){return this;},setCta(){return this;},setDisabled(){return this;},onClick(){return this;}};callback(button);return this;}
};
ctx.document = {querySelectorAll:()=>[]};
ctx.Plugin.prototype.showImportGuide.call({app:{
 setting:{modalEl:{isConnected:true},close(){settingsClosed=true;}},
 workspace:{containerEl:{ownerDocument:{defaultView:{focus(){mainWindowFocused=true;}}}}}
}});
assert.equal(guideConstructed,true);
// No Settings window is required for the ribbon/command entry.
assert.doesNotThrow(()=>ctx.focusImportWorkspace({workspace:{}}));
console.log('Passed: Settings closes and main window focuses before the guide; ribbon entry requires no Settings window.');
