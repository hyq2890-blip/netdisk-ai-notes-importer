// Plugin lifecycle and note operations.
var START_MARKER = "<!-- BAIDU_AI_NOTE_START -->";
var END_MARKER = "<!-- BAIDU_AI_NOTE_END -->";
var NetdiskAiNotesPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.observedWebviews = /* @__PURE__ */ new WeakSet();
    this.mostRecentFcbUrl = "";
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new NetdiskAiNotesSettingTab(this.app, this));
    this.registerEditorExtension(createTimestampEditorExtension((seconds) => {
      const file = this.app.workspace.getActiveFile();
      if (file) void this.seekFromNote(file.path, seconds);
    }));
    this.addRibbonIcon("file-down", "\u5BFC\u5165\u6216\u540C\u6B65\u767E\u5EA6 AI \u7B14\u8BB0", () => {
      if (this.getActiveManagedFile()) void this.syncCurrentNote();
      else void this.importCurrentNote();
    });
    this.addRibbonIcon("folder-down", "\u6279\u91CF\u5BFC\u5165\u6240\u6709\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 AI \u7B14\u8BB0", () => {
      void this.importAllOpenNotes();
    });
    this.addCommand({
      id: "import-current-baidu-ai-note",
      name: "\u5BFC\u5165\u5F53\u524D\u767E\u5EA6 AI \u7B14\u8BB0",
      callback: () => void this.importCurrentNote()
    });
    this.addCommand({
      id: "import-all-open-baidu-ai-notes",
      name: "\u6279\u91CF\u5BFC\u5165\u6240\u6709\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 AI \u7B14\u8BB0",
      callback: () => void this.importAllOpenNotes()
    });
    this.addCommand({
      id: "sync-current-baidu-ai-note",
      name: "\u540C\u6B65\u5F53\u524D\u767E\u5EA6 AI \u7B14\u8BB0",
      checkCallback: (checking) => {
        const available = Boolean(this.getActiveManagedFile());
        if (available && !checking) void this.syncCurrentNote();
        return available;
      }
    });
    this.addCommand({
      id: "open-corresponding-baidu-video",
      name: "\u6253\u5F00\u5BF9\u5E94\u5927\u89C6\u9891",
      checkCallback: (checking) => {
        var _a;
        const url = (_a = this.getActiveFrontmatter()) == null ? void 0 : _a.video_url;
        const available = typeof url === "string" && isVideoUrl(url);
        if (available && !checking) void this.openVideo(url);
        return available;
      }
    });
    this.registerMarkdownPostProcessor((element, context) => {
      var _a;
      const sourceFile = this.app.vault.getAbstractFileByPath(context.sourcePath);
      const sourceFm = sourceFile instanceof import_obsidian4.TFile ? (_a = this.app.metadataCache.getFileCache(sourceFile)) == null ? void 0 : _a.frontmatter : void 0;
      if ((sourceFm == null ? void 0 : sourceFm.source) === "baidu-ai-note") {
        const preview = element.closest(".markdown-preview-view");
        if (preview) preview.addClass("baidu-ai-note");
      }
      const timestamps = element.querySelectorAll(".baidu-ai-timestamp[data-time]");
      timestamps.forEach((timestamp) => {
        timestamp.setAttribute("role", "button");
        timestamp.setAttribute("tabindex", "0");
        const activate = (event) => {
          event.preventDefault();
          const seconds = Number(timestamp.dataset.time);
          if (Number.isFinite(seconds)) void this.seekFromNote(context.sourcePath, seconds);
        };
        timestamp.addEventListener("click", activate);
        timestamp.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") activate(event);
        });
      });
      if ((sourceFm == null ? void 0 : sourceFm.source) === "baidu-ai-note") {
        const videoLinks = element.querySelectorAll(
          'a[href*="pan.baidu.com/pfile/video"][href*="#t="]'
        );
        videoLinks.forEach((link) => {
          const seconds = secondsFromVideoHref(link.href);
          if (seconds === null) return;
          link.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            void this.seekFromNote(context.sourcePath, seconds);
          });
        });
      }
    });
    this.startWebviewTracking();
  }
  onunload() {
    var _a;
    (_a = this.webviewObserver) == null ? void 0 : _a.disconnect();
  }
  async loadSettings() {
    var _a;
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded != null ? loaded : {});
    this.settings.videoByFcbUrl = (_a = loaded == null ? void 0 : loaded.videoByFcbUrl) != null ? _a : {};
    // Migrate only historical defaults; keep custom folders and existing files.
    let migrated = false;
    if ((loaded == null ? void 0 : loaded.notesFolder) === "Baidu AI Notes") {
      this.settings.notesFolder = DEFAULT_SETTINGS.notesFolder;
      migrated = true;
    }
    if (["Baidu AI Notes/attachments", "attachments/BaiduAI"].includes(loaded == null ? void 0 : loaded.attachmentsFolder)) {
      this.settings.attachmentsFolder = DEFAULT_SETTINGS.attachmentsFolder;
      migrated = true;
    }
    if (migrated) await this.saveSettings();
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async importCurrentNote() {
    const webview = findFcbWebview();
    if (!webview) {
      new import_obsidian4.Notice("\u672A\u627E\u5230\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 FCB AI \u7B14\u8BB0\u3002\u8BF7\u5148\u5728 Obsidian Web Viewer \u4E2D\u6253\u5F00\u7B14\u8BB0\u3002");
      return;
    }
    const notice = new import_obsidian4.Notice("\u6B63\u5728\u5BFC\u5165\u767E\u5EA6 AI \u7B14\u8BB0\u2026", 0);
    try {
      const result = await this.importWebview(webview, notice, this.settings.openVideoAfterImport);
      notice.hide();
      if (result.skipped) {
        new import_obsidian4.Notice("\u8FD9\u7BC7\u767E\u5EA6 AI \u7B14\u8BB0\u5DF2\u5B58\u5728\uFF0C\u5DF2\u6253\u5F00\u672C\u5730\u7B14\u8BB0\uFF0C\u672A\u91CD\u590D\u722C\u53D6");
      } else {
        new import_obsidian4.Notice(result.videoUrl ? "\u767E\u5EA6 AI \u7B14\u8BB0\u5BFC\u5165\u5B8C\u6210" : "\u5BFC\u5165\u5B8C\u6210\uFF1B\u6682\u672A\u81EA\u52A8\u8BC6\u522B\u5927\u89C6\u9891\u5730\u5740");
      }
    } catch (error) {
      notice.hide();
      console.error("Netdisk AI Notes Importer import failed", error);
      new import_obsidian4.Notice(`\u5BFC\u5165\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async importAllOpenNotes() {
    const webviews = getWebviews().filter((view) => isFcbUrl(safeWebviewUrl(view)));
    if (webviews.length === 0) {
      new import_obsidian4.Notice("\u6CA1\u6709\u627E\u5230\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 FCB AI \u7B14\u8BB0");
      return;
    }
    const notice = new import_obsidian4.Notice(`\u51C6\u5907\u6279\u91CF\u5BFC\u5165 ${webviews.length} \u7BC7\u767E\u5EA6 AI \u7B14\u8BB0\u2026`, 0);
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const seen = /* @__PURE__ */ new Set();
    for (let index = 0; index < webviews.length; index += 1) {
      const webview = webviews[index];
      const url = safeWebviewUrl(webview);
      const identity = getFcbIdentity(url);
      notice.setMessage(`\u6B63\u5728\u5904\u7406\u7B2C ${index + 1}/${webviews.length} \u7BC7\u2026`);
      if (!url || seen.has(identity)) {
        skipped += 1;
        if (identity) seen.add(identity);
        continue;
      }
      seen.add(identity);
      try {
        const result = await this.importWebview(webview, notice, false);
        if (result.skipped) skipped += 1;
        else imported += 1;
      } catch (error) {
        failed += 1;
        console.error("Netdisk AI Notes Importer batch item failed", url, error);
      }
    }
    notice.hide();
    const summary = `\u6279\u91CF\u5BFC\u5165\u5B8C\u6210\uFF1A\u6210\u529F ${imported}\uFF0C\u8DF3\u8FC7 ${skipped}\uFF0C\u5931\u8D25 ${failed}`;
    new import_obsidian4.Notice(summary, failed > 0 ? 1e4 : 6e3);
  }
  async importWebview(webview, notice, keepVideoAfterImport) {
    var _a, _b;
    let temporaryVideoViews = [];
    const currentUrl = safeWebviewUrl(webview);
    const existingBeforeCapture = currentUrl ? this.findImportedFile(currentUrl) : null;
    if (existingBeforeCapture) {
      await this.openFileReplacingWebview(webview, existingBeforeCapture);
      const fm = (_a = this.app.metadataCache.getFileCache(existingBeforeCapture)) == null ? void 0 : _a.frontmatter;
      const existingVideoUrl = typeof (fm == null ? void 0 : fm.video_url) === "string" ? fm.video_url : "";
      return { file: existingBeforeCapture, videoUrl: existingVideoUrl, skipped: true };
    }
    const snapshot = await extractFcbSnapshot(webview);
    const existingAfterCapture = this.findImportedFile(snapshot.url);
    if (existingAfterCapture) {
      await this.openFileReplacingWebview(webview, existingAfterCapture);
      const fm = (_b = this.app.metadataCache.getFileCache(existingAfterCapture)) == null ? void 0 : _b.frontmatter;
      const existingVideoUrl = typeof (fm == null ? void 0 : fm.video_url) === "string" ? fm.video_url : "";
      return { file: existingAfterCapture, videoUrl: existingVideoUrl, skipped: true };
    }
    this.mostRecentFcbUrl = snapshot.url;
    let videoUrl = this.resolveVideoUrl(snapshot.url, snapshot.videoUrlCandidates);
    if (!videoUrl) {
      notice.setMessage("\u6B63\u5728\u81EA\u52A8\u83B7\u53D6\u767E\u5EA6\u5927\u89C6\u9891\u5730\u5740\u2026");
      const beforeAutoOpen = new Set(getWebviews());
      const openedUrl = await autoOpenLargeVideo(webview);
      temporaryVideoViews = this.findTemporaryVideoViews(beforeAutoOpen, webview);
      videoUrl = this.resolveVideoUrl(snapshot.url, openedUrl ? [openedUrl] : []);
    }
    const markdown = await convertHtmlToMarkdown({
      vault: this.app.vault,
      html: snapshot.html,
      noteTitle: snapshot.title,
      attachmentsFolder: this.settings.attachmentsFolder,
      downloadImages: this.settings.downloadImages,
      videoUrl
    });
    const path = await this.createNotePath(snapshot.title);
    const content = this.composeNote(snapshot.title, snapshot.url, videoUrl, markdown);
    const file = await this.app.vault.create(path, content);
    await this.openFileReplacingWebview(webview, file);
    if (keepVideoAfterImport) {
      if (videoUrl) await this.openVideo(videoUrl);
    } else {
      this.closeWebviewLeaves(temporaryVideoViews);
    }
    return { file, videoUrl, skipped: false };
  }
  async syncCurrentNote() {
    const file = this.getActiveManagedFile();
    const frontmatter = this.getActiveFrontmatter();
    const fcbUrl = typeof (frontmatter == null ? void 0 : frontmatter.fcb_url) === "string" ? frontmatter.fcb_url : "";
    if (!file || !fcbUrl) {
      new import_obsidian4.Notice("\u5F53\u524D\u6587\u4EF6\u4E0D\u662F\u7531 Netdisk AI Notes Importer \u7BA1\u7406\u7684\u7B14\u8BB0");
      return;
    }
    const notice = new import_obsidian4.Notice("\u6B63\u5728\u540C\u6B65\u767E\u5EA6 AI \u7B14\u8BB0\u2026", 0);
    let temporaryVideoViews = [];
    try {
      let webview = findFcbWebview(fcbUrl);
      if (!webview) {
        await openInWebViewer(this.app, fcbUrl, this.settings.videoOpenPosition);
        webview = await waitForWebview((view) => isFcbUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), fcbUrl));
      }
      const snapshot = await extractFcbSnapshot(webview);
      let videoUrl = this.resolveVideoUrl(fcbUrl, snapshot.videoUrlCandidates);
      if (!videoUrl) {
        notice.setMessage("\u6B63\u5728\u81EA\u52A8\u83B7\u53D6\u767E\u5EA6\u5927\u89C6\u9891\u5730\u5740\u2026");
        const beforeAutoOpen = new Set(getWebviews());
        const openedUrl = await autoOpenLargeVideo(webview);
        temporaryVideoViews = this.findTemporaryVideoViews(beforeAutoOpen, webview);
        videoUrl = this.resolveVideoUrl(fcbUrl, openedUrl ? [openedUrl] : []);
      }
      const markdown = await convertHtmlToMarkdown({
        vault: this.app.vault,
        html: snapshot.html,
        noteTitle: snapshot.title,
        attachmentsFolder: this.settings.attachmentsFolder,
        downloadImages: this.settings.downloadImages,
        videoUrl
      });
      const oldContent = await this.app.vault.read(file);
      if (!oldContent.includes(START_MARKER) || !oldContent.includes(END_MARKER)) {
        throw new Error("\u627E\u4E0D\u5230\u63D2\u4EF6\u7BA1\u7406\u533A\u57DF\u6807\u8BB0\uFF0C\u5DF2\u505C\u6B62\u540C\u6B65\u4EE5\u4FDD\u62A4\u7528\u6237\u5185\u5BB9");
      }
      let synchronizedMarkdown = markdown;
      let addedSections = 0;
      if (this.settings.syncMode === "incremental") {
        const currentManagedMarkdown = extractManagedSection(oldContent);
        const merged = mergeMissingHeadingSections(currentManagedMarkdown, markdown);
        synchronizedMarkdown = merged.markdown;
        addedSections = merged.addedSections;
      }
      const replacement = `${START_MARKER}
${synchronizedMarkdown}
${END_MARKER}`;
      const legacyTitle = file.basename.endsWith(".fcb") || file.basename === "\u767E\u5EA6\u7F51\u76D8\u5728\u7EBF\u6587\u6863";
      const baseContent = legacyTitle ? oldContent.replace(/^#\s+[^\n]+$/m, `# ${snapshot.title}`) : oldContent;
      const newContent = replaceManagedSection(baseContent, replacement);
      await this.app.vault.modify(file, newContent);
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        if (videoUrl) fm.video_url = videoUrl;
        fm.fcb_id = getFcbIdentity(fcbUrl);
        const current = fm.cssclasses;
        const classes = Array.isArray(current) ? current.map(String) : current ? [String(current)] : [];
        if (!classes.includes("baidu-ai-note")) classes.push("baidu-ai-note");
        fm.cssclasses = classes;
      });
      await this.renameLegacyManagedFile(file, snapshot.title);
      if (!this.settings.openVideoAfterImport) this.closeWebviewLeaves(temporaryVideoViews);
      notice.hide();
      if (this.settings.syncMode === "incremental") {
        new import_obsidian4.Notice(`\u589E\u91CF\u540C\u6B65\u5B8C\u6210\uFF1A\u65B0\u589E ${addedSections} \u4E2A\u7AE0\u8282\u5757\uFF1B\u5DF2\u6709\u5185\u5BB9\u53CA\u4FEE\u6539\u5DF2\u4FDD\u7559`);
      } else {
        new import_obsidian4.Notice("\u8986\u76D6\u540C\u6B65\u5B8C\u6210\uFF1B\u7BA1\u7406\u533A\u57DF\u5916\u7684\u7528\u6237\u5185\u5BB9\u5DF2\u4FDD\u7559");
      }
    } catch (error) {
      notice.hide();
      console.error("Netdisk AI Notes Importer sync failed", error);
      new import_obsidian4.Notice(`\u540C\u6B65\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async seekFromNote(sourcePath, seconds) {
    var _a;
    const file = this.app.vault.getAbstractFileByPath(sourcePath);
    const frontmatter = file instanceof import_obsidian4.TFile ? (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter : void 0;
    const videoUrl = typeof (frontmatter == null ? void 0 : frontmatter.video_url) === "string" ? frontmatter.video_url : "";
    if (!videoUrl || !isVideoUrl(videoUrl)) {
      new import_obsidian4.Notice("\u8FD9\u7BC7\u7B14\u8BB0\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u89C6\u9891\u5730\u5740\u3002\u8BF7\u91CD\u65B0\u5BFC\u5165\u6216\u540C\u6B65\uFF0C\u63D2\u4EF6\u4F1A\u5C1D\u8BD5\u81EA\u52A8\u83B7\u53D6\u3002");
      return;
    }
    try {
      if (!findVideoWebview(videoUrl)) await openInWebViewer(this.app, videoUrl, this.settings.videoOpenPosition);
      let activeVideo;
      try {
        activeVideo = await waitAndSeek(videoUrl, seconds);
      } catch (firstError) {
        console.debug("Netdisk AI Notes Importer: rebuilding stale video Web Viewer", firstError);
        await openInWebViewer(this.app, videoUrl, this.settings.videoOpenPosition);
        activeVideo = await waitAndSeek(videoUrl, seconds);
      }
      const videoLeaf = this.findLeafForWebview(activeVideo);
      if (videoLeaf) this.app.workspace.revealLeaf(videoLeaf);
    } catch (error) {
      console.error("Netdisk AI Notes Importer seek failed", error);
      new import_obsidian4.Notice(`\u89C6\u9891\u8DF3\u8F6C\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async openVideo(url) {
    if (!isVideoUrl(url)) {
      new import_obsidian4.Notice("\u5F53\u524D\u7B14\u8BB0\u6CA1\u6709\u6709\u6548\u7684\u767E\u5EA6\u5927\u89C6\u9891\u5730\u5740");
      return;
    }
    const existing = findVideoWebview(url);
    if (!existing) await openInWebViewer(this.app, url, this.settings.videoOpenPosition);
  }
  resolveVideoUrl(fcbUrl, candidates) {
    var _a;
    const validCandidate = candidates.find(isVideoUrl);
    if (validCandidate) {
      this.rememberVideoUrl(fcbUrl, validCandidate);
      return validCandidate;
    }
    const remembered = this.settings.videoByFcbUrl[fcbUrl];
    if (remembered && isVideoUrl(remembered)) return remembered;
    const openVideos = getWebviews().map(safeWebviewUrl).filter(isVideoUrl);
    const fcbPath = getQueryPath2(fcbUrl);
    return (_a = openVideos.find((url) => Boolean(fcbPath) && getQueryPath2(url) === fcbPath)) != null ? _a : openVideos.length === 1 ? openVideos[0] : "";
  }
  rememberVideoUrl(fcbUrl, videoUrl) {
    if (!isFcbUrl(fcbUrl) || !isVideoUrl(videoUrl)) return;
    if (this.settings.videoByFcbUrl[fcbUrl] === videoUrl) return;
    this.settings.videoByFcbUrl[fcbUrl] = videoUrl;
    void this.saveSettings();
  }
  startWebviewTracking() {
    const attachAll = () => getWebviews().forEach((view) => this.attachWebview(view));
    attachAll();
    this.webviewObserver = new MutationObserver(attachAll);
    this.webviewObserver.observe(document.body, { childList: true, subtree: true });
    this.register(() => {
      var _a;
      return (_a = this.webviewObserver) == null ? void 0 : _a.disconnect();
    });
  }
  attachWebview(webview) {
    if (this.observedWebviews.has(webview)) return;
    this.observedWebviews.add(webview);
    const rememberContext = () => {
      const url = safeWebviewUrl(webview);
      if (isFcbUrl(url)) this.mostRecentFcbUrl = url;
      if (isVideoUrl(url) && this.mostRecentFcbUrl) this.rememberVideoUrl(this.mostRecentFcbUrl, url);
    };
    const captureEventUrl = (event) => {
      var _a;
      const url = (_a = event.url) != null ? _a : "";
      if (isVideoUrl(url)) {
        const source = isFcbUrl(safeWebviewUrl(webview)) ? safeWebviewUrl(webview) : this.mostRecentFcbUrl;
        if (source) this.rememberVideoUrl(source, url);
      }
      window.setTimeout(rememberContext, 0);
    };
    ["did-navigate", "did-navigate-in-page", "new-window", "will-navigate"].forEach((name) => {
      webview.addEventListener(name, captureEventUrl);
      this.register(() => webview.removeEventListener(name, captureEventUrl));
    });
    rememberContext();
  }
  getActiveManagedFile() {
    var _a;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    if (!(view == null ? void 0 : view.file)) return null;
    const fm = (_a = this.app.metadataCache.getFileCache(view.file)) == null ? void 0 : _a.frontmatter;
    return (fm == null ? void 0 : fm.source) === "baidu-ai-note" ? view.file : null;
  }
  findImportedFile(fcbUrl) {
    var _a;
    const identity = getFcbIdentity(fcbUrl);
    if (!identity) return null;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const fm = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
      if ((fm == null ? void 0 : fm.source) !== "baidu-ai-note") continue;
      const storedIdentity = typeof fm.fcb_id === "string" ? fm.fcb_id : typeof fm.fcb_url === "string" ? getFcbIdentity(fm.fcb_url) : "";
      if (storedIdentity === identity) {
        return file;
      }
    }
    return null;
  }
  getActiveFrontmatter() {
    var _a;
    const file = this.app.workspace.getActiveFile();
    return file ? (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter : void 0;
  }
  composeNote(title, fcbUrl, videoUrl, markdown) {
    const frontmatter = [
      "---",
      "source: baidu-ai-note",
      "cssclasses:",
      "  - baidu-ai-note",
      `fcb_id: ${yamlString(getFcbIdentity(fcbUrl))}`,
      `fcb_url: ${yamlString(fcbUrl)}`,
      `video_url: ${yamlString(videoUrl)}`,
      `imported_at: ${yamlString((/* @__PURE__ */ new Date()).toISOString())}`,
      "---"
    ].join("\n");
    return `${frontmatter}

# ${title}

${START_MARKER}
${markdown}
${END_MARKER}
`;
  }
  async createNotePath(title) {
    const folder = (0, import_obsidian4.normalizePath)(this.settings.notesFolder.trim().replace(/^[/\\]+|[/\\]+$/g, ""));
    if (folder) await ensureFolder2(this, folder);
    const stem = sanitizeFileName(title);
    let path = (0, import_obsidian4.normalizePath)(folder ? `${folder}/${stem}.md` : `${stem}.md`);
    let suffix = 2;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = (0, import_obsidian4.normalizePath)(folder ? `${folder}/${stem}-${suffix}.md` : `${stem}-${suffix}.md`);
      suffix += 1;
    }
    return path;
  }
  async openFileReplacingWebview(webview, file) {
    const owner = this.findLeafForWebview(webview);
    await (owner != null ? owner : this.app.workspace.getLeaf(false)).openFile(file);
  }
  findLeafForWebview(webview) {
    let owner = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      const container = leaf.view.containerEl;
      if (!owner && (container == null ? void 0 : container.contains(webview))) owner = leaf;
    });
    return owner;
  }
  findTemporaryVideoViews(before, source) {
    return getWebviews().filter((view) => {
      if (!isVideoUrl(safeWebviewUrl(view))) return false;
      return view === source || !before.has(view);
    });
  }
  closeWebviewLeaves(webviews) {
    const leaves = /* @__PURE__ */ new Set();
    webviews.forEach((view) => {
      const leaf = this.findLeafForWebview(view);
      if (leaf) leaves.add(leaf);
    });
    leaves.forEach((leaf) => leaf.detach());
  }
  async renameLegacyManagedFile(file, title) {
    var _a, _b;
    const isLegacyName = file.basename.endsWith(".fcb") || file.basename === "\u767E\u5EA6\u7F51\u76D8\u5728\u7EBF\u6587\u6863";
    if (!isLegacyName) return;
    const cleanTitle = sanitizeFileName(title);
    const parentPath = (_b = (_a = file.parent) == null ? void 0 : _a.path) != null ? _b : "";
    const desired = (0, import_obsidian4.normalizePath)(parentPath ? `${parentPath}/${cleanTitle}.md` : `${cleanTitle}.md`);
    if (desired !== file.path && !this.app.vault.getAbstractFileByPath(desired)) {
      await this.app.fileManager.renameFile(file, desired);
    }
  }
};
async function ensureFolder2(plugin, folder) {
  const parts = (0, import_obsidian4.normalizePath)(folder).split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!plugin.app.vault.getAbstractFileByPath(current)) await plugin.app.vault.createFolder(current);
  }
}
function replaceManagedSection(content, replacement) {
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER, start + START_MARKER.length);
  if (start < 0 || end < 0) return content;
  return content.slice(0, start) + replacement + content.slice(end + END_MARKER.length);
}
function extractManagedSection(content) {
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER, start + START_MARKER.length);
  if (start < 0 || end < 0) return "";
  return content.slice(start + START_MARKER.length, end).replace(/^\r?\n/, "").replace(/\r?\n$/, "");
}
function mergeMissingHeadingSections(localMarkdown, remoteMarkdown) {
  const local = parseMarkdownSections(localMarkdown);
  const remote = parseMarkdownSections(remoteMarkdown);
  let addedSections = 0;
  const mergeChildren = (localParent, remoteParent) => {
    var _a;
    for (const remoteChild of remoteParent.children) {
      const key = headingKey((_a = remoteChild.heading) != null ? _a : "");
      const localChild = localParent.children.find(
        (candidate) => {
          var _a2;
          return candidate.level === remoteChild.level && headingKey((_a2 = candidate.heading) != null ? _a2 : "") === key;
        }
      );
      if (localChild) {
        mergeChildren(localChild, remoteChild);
      } else {
        localParent.children.push(remoteChild);
        addedSections += 1;
      }
    }
  };
  mergeChildren(local, remote);
  return { markdown: renderMarkdownSections(local).trim(), addedSections };
}
function parseMarkdownSections(markdown) {
  const root2 = { heading: null, level: 0, body: [], children: [] };
  const stack = [root2];
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{2,6})\s+(.+)$/.exec(line);
    if (!match) {
      stack[stack.length - 1].body.push(line);
      continue;
    }
    const level = match[1].length;
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
    const section = { heading: line, level, body: [], children: [] };
    stack[stack.length - 1].children.push(section);
    stack.push(section);
  }
  return root2;
}
function renderMarkdownSections(section) {
  const lines = section.heading ? [section.heading, ...section.body] : [...section.body];
  for (const child of section.children) lines.push(renderMarkdownSections(child));
  return lines.join("\n");
}
function headingKey(heading) {
  return heading.replace(/^#{2,6}\s+/, "").replace(/<span\b[^>]*class=["'][^"']*baidu-ai-timestamp[^"']*["'][^>]*>.*?<\/span>/gi, "").replace(/\[[^\]]+\]\([^)]*pan\.baidu\.com\/pfile\/video[^)]*#t=[^)]*\)/gi, "").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}
function yamlString(value) {
  return JSON.stringify(value);
}
function getQueryPath2(value) {
  try {
    return new URL(value).searchParams.get("path");
  } catch (e) {
    return null;
  }
}
function sameUrl(left, right) {
  return getFcbIdentity(left) === getFcbIdentity(right);
}
function getFcbIdentity(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const fsid = url.searchParams.get("fsid");
    if (fsid) return `fsid:${fsid}`;
    const path = url.searchParams.get("path");
    if (path) return `path:${path}`;
    url.hash = "";
    url.searchParams.sort();
    return `url:${url.toString()}`;
  } catch (e) {
    return `url:${value}`;
  }
}
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
function secondsFromVideoHref(value) {
  try {
    const url = new URL(value);
    if (url.hostname !== "pan.baidu.com" || !url.pathname.includes("/pfile/video")) return null;
    const raw = new URLSearchParams(url.hash.slice(1)).get("t");
    if (!raw) return null;
    const parts = raw.split(":").map(Number);
    if (parts.some((part) => !Number.isFinite(part))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts.length === 1 ? parts[0] : null;
  } catch (e) {
    return null;
  }
}
