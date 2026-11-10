// Plugin lifecycle and note operations.
var START_MARKER = "<!-- BAIDU_AI_NOTE_START -->";
var END_MARKER = "<!-- BAIDU_AI_NOTE_END -->";
var NetdiskAiNotesPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.observedWebviews = /* @__PURE__ */ new WeakSet();
    this.inlineImportBars = new Map();
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({id: "bind-original-video", name: "补充或更换原视频", checkCallback: checking => {const file = this.getActiveManagedFile(); if (file && !checking) this.showVideoBinding(file); return Boolean(file);}});
    this.addSettingTab(new NetdiskAiNotesSettingTab(this.app, this));
    this.addRibbonIcon("compass", "开始导入百度 AI 笔记", () => this.showImportGuide());
    this.addCommand({id: "start-baidu-import", name: "开始导入百度 AI 笔记", callback: () => this.showImportGuide()});
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
        const available = typeof url === "string" && isPlaybackUrl(url);
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
          'a[href*="pan.baidu.com/"][href*="#t="]'
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
  showImportGuide() {
    focusImportWorkspace(this.app);
    const modal = new import_obsidian4.Modal(this.app);
    modal.titleEl.setText("导入百度 AI 笔记");
    modal.contentEl.createEl("p", {text: "① 开启核心插件“网页浏览器”。② 打开网盘并登录，打开 AI 笔记正文；只勾选文件不够。③ 点击导入，完成后会打开本地笔记。"});
    new import_obsidian4.Setting(modal.contentEl).setName("打开百度网盘").addButton(b => b.setButtonText("打开或切回网盘").onClick(async () => {
      modal.close();
      try { await this.openNetdiskEntry(); } catch (error) { new import_obsidian4.Notice(messageOf(error)); }
    }));
    const status = modal.contentEl.createEl("p", {text: "正在检查当前页面…"});
    let selected;
    let selectedUrl;
    let button;
    new import_obsidian4.Setting(modal.contentEl).addButton(b => {
      button = b;
      b.setButtonText("导入这篇笔记").setCta().setDisabled(true).onClick(() => {modal.close(); void this.importCurrentNote(selected, selectedUrl);});
    });
    try {
      selected = findFcbWebview(undefined, this.app);
      if (!selected) status.setText("尚未打开 AI 笔记正文。请先打开笔记文件，再打开此向导。");
      else extractFcbSnapshot(selected).then(snapshot => {
        selectedUrl = snapshot.url;
        status.setText(`已识别：${snapshot.title}。现在可以导入。`);
        button.setDisabled(false);
      }).catch(() => status.setText("笔记正文尚未加载完成。请等待正文显示后重新打开向导。"));
    } catch (error) {status.setText(messageOf(error));}
    modal.open();
  }
  async openNetdiskEntry() {
    const leaf = await openNetdiskEntry(this.app);
    new import_obsidian4.Notice("已切到中央的百度网盘页面。请打开要导入的 AI 笔记正文。", 6e3);
    return leaf;
  }
  showImportResult(result) {
    const modal = new import_obsidian4.Modal(this.app);
    modal.titleEl.setText(result.skipped ? "这篇笔记已经导入" : "笔记已导入成功");
    modal.contentEl.createEl("p", {text: `本地笔记：${result.file.path}`});
    const message = modal.contentEl.createEl("p", {text: result.videoUrl ? "原视频已关联，可点击笔记时间点跳转。" : "正文已保存，视频暂未就绪。先重新识别一次，仍未找到时再按步骤手动补充，也可以稍后处理。"});
    new import_obsidian4.Setting(modal.contentEl).addButton(b => b.setButtonText("查看本地笔记").setCta().onClick(async () => {modal.close(); await this.openFileReplacingWebview(null, result.file);}));
    if (!result.videoUrl) {
      let manual;
      new import_obsidian4.Setting(modal.contentEl)
        .addButton(b => b.setButtonText("重新识别视频").onClick(async () => {
          b.setDisabled(true).setButtonText("正在识别…");
          message.setText("正在重新识别对应笔记页的视频，请稍候…");
          try {
            const url = this.app.metadataCache.getFileCache(result.file)?.frontmatter?.fcb_url;
            const view = getWebviews().find(view => isEmbeddedVideoUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), url));
            result.videoUrl = await this.retryVideoAssociation(result.file, view);
            message.setText(result.videoUrl ? "视频已关联，可以点击本地笔记的时间点回看。" : "仍未识别到视频。可等待网页加载后重试，或点“手动补充”查看步骤。");
            b.buttonEl.hidden = Boolean(result.videoUrl);
            manual.buttonEl.hidden = Boolean(result.videoUrl);
          } catch (error) {message.setText(`重新识别未完成：${messageOf(error)}。也可以手动补充。`); manual.buttonEl.hidden = false;}
          finally {b.setDisabled(false).setButtonText("重新识别视频");}
        }))
        .addButton(b => {manual = b; b.setButtonText("手动补充").onClick(() => {modal.close(); this.showVideoBinding(result.file);}); b.buttonEl.hidden = true;})
        .addButton(b => b.setButtonText("稍后处理").onClick(() => modal.close()));
    }
    modal.open();
  }
  showVideoBinding(file, options = {}) {
    const modal = new import_obsidian4.Modal(this.app);
    modal.titleEl.setText("手动补充原视频");
    modal.contentEl.createEl("p", {text: "正文已经保存。这里补充视频页面地址，用于点击时间点回看，保存后不会自动播放。"});
    const steps = modal.contentEl.createEl("ol");
    steps.createEl("li", {text: "这篇网盘笔记左侧能看到视频？直接点下方“填入这篇笔记页地址”，不用再复制。"});
    steps.createEl("li", {text: "如果笔记页没有视频，请在百度网盘找到对应课程的视频，打开播放页，复制顶部地址栏中的完整网址。"});
    steps.createEl("li", {text: "把网址粘贴到下方，点击“保存关联”。还没找到地址时可先点“暂不补充”，找到后再回来。"});
    let value = "";
    let input;
    new import_obsidian4.Setting(modal.contentEl).setName("视频页面地址").addText(t => {input = t; t.setPlaceholder("粘贴网盘视频页或带视频的笔记页地址").onChange(v => value = v.trim());});
    const sourceUrl = this.app.metadataCache.getFileCache(file)?.frontmatter?.fcb_url;
    if (isEmbeddedVideoUrl(sourceUrl)) new import_obsidian4.Setting(modal.contentEl).addButton(b => b.setButtonText("填入这篇笔记页地址").onClick(() => {value = sourceUrl; input.setValue(value);}));
    const status = modal.contentEl.createEl("p");
    new import_obsidian4.Setting(modal.contentEl).addButton(b => b.setButtonText("保存关联").setCta().onClick(async () => {
      if (!isPlaybackUrl(value)) {status.setText("请填写视频播放页或带视频的 AI 笔记页地址，不能使用文件列表或分享页地址。"); return;}
      b.setDisabled(true);
      try {
        await this.app.fileManager.processFrontMatter(file, fm => {fm.video_url = value;});
        const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (fm?.fcb_url) this.rememberVideoUrl(fm.fcb_url, value);
        modal.close();
        if (options.reveal !== false) await this.openFileReplacingWebview(null, file);
        options.onSaved?.(value);
        new import_obsidian4.Notice("原视频已关联，可以点击笔记时间点跳转。");
      } catch (error) {status.setText(`保存失败：${messageOf(error)}`); b.setDisabled(false);}
    })).addButton(b => b.setButtonText("暂不补充").onClick(() => modal.close()));
    modal.open();
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
  async selectImportFolder() {
    try {
      const folder = this.settings.askNotesFolder
        ? await chooseNotesFolder(this.app, this.settings.notesFolder)
        : this.settings.notesFolder;
      return folder === null ? null : validateNotesFolder(this.app, folder);
    } catch (error) {
      new import_obsidian4.Notice(messageOf(error));
      return null;
    }
  }
  async importCurrentNote(selectedWebview, selectedUrl) {
    let webview;
    try { webview = selectedWebview || findFcbWebview(undefined, this.app); } catch (error) { new import_obsidian4.Notice(messageOf(error)); return; }
    if (!webview) {
      new import_obsidian4.Notice("\u672A\u627E\u5230\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 FCB AI \u7B14\u8BB0\u3002\u8BF7\u5148\u5728 Obsidian Web Viewer \u4E2D\u6253\u5F00\u7B14\u8BB0\u3002");
      return;
    }
    const expectedUrl = selectedUrl || safeWebviewUrl(webview);
    try { await webview.executeJavaScript("document.querySelectorAll('video,audio').forEach(media => media.pause())", true); } catch (_) {}
    const notesFolder = await this.selectImportFolder();
    if (notesFolder === null) return;
    const notice = new import_obsidian4.Notice("\u6B63\u5728\u5BFC\u5165\u767E\u5EA6 AI \u7B14\u8BB0\u2026", 0);
    try {
      const result = await this.importWebview(webview, notice, notesFolder, {expectedUrl});
      notice.hide();
      this.showImportResult(result);
    } catch (error) {
      notice.hide();
      console.error("Netdisk AI Notes Importer import failed", error);
      new import_obsidian4.Notice(`\u5BFC\u5165\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async importAllOpenNotes() {
    const webviews = getWebviews().filter((view) => isFcbUrl(safeWebviewUrl(view)));
    const entries = webviews.map(webview => ({webview, url: safeWebviewUrl(webview)}));
    if (webviews.length === 0) {
      new import_obsidian4.Notice("\u6CA1\u6709\u627E\u5230\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 FCB AI \u7B14\u8BB0");
      return;
    }
    const notesFolder = await this.selectImportFolder();
    if (notesFolder === null) return;
    const notice = new import_obsidian4.Notice(`\u51C6\u5907\u6279\u91CF\u5BFC\u5165 ${webviews.length} \u7BC7\u767E\u5EA6 AI \u7B14\u8BB0\u2026`, 0);
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const seen = /* @__PURE__ */ new Set();
    for (let index = 0; index < webviews.length; index += 1) {
      const {webview, url} = entries[index];
      const identity = getFcbIdentity(url);
      notice.setMessage(`\u6B63\u5728\u5904\u7406\u7B2C ${index + 1}/${webviews.length} \u7BC7\u2026`);
      if (!url || seen.has(identity)) {
        skipped += 1;
        if (identity) seen.add(identity);
        continue;
      }
      seen.add(identity);
      try {
        const result = await this.importWebview(webview, notice, notesFolder, {expectedUrl: url});
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
  async importWebview(webview, notice, notesFolder, options = {}) {
    var _a, _b;
    const currentUrl = safeWebviewUrl(webview);
    const checkPage = () => {
      if (options.expectedUrl && !sameUrl(safeWebviewUrl(webview), options.expectedUrl)) throw new Error("页面已切换，请在目标笔记页面重新导入");
    };
    checkPage();
    const existingBeforeCapture = currentUrl ? this.findImportedFile(currentUrl) : null;
    if (existingBeforeCapture) {
      if (options.reveal !== false) await this.openFileReplacingWebview(webview, existingBeforeCapture);
      const fm = (_a = this.app.metadataCache.getFileCache(existingBeforeCapture)) == null ? void 0 : _a.frontmatter;
      let existingVideoUrl = typeof (fm == null ? void 0 : fm.video_url) === "string" ? fm.video_url : "";
      if (!existingVideoUrl) {
        try {
          const snapshot = await extractFcbSnapshot(webview);
          checkPage();
          existingVideoUrl = await this.associateEmbeddedVideo(existingBeforeCapture, webview, snapshot);
        } catch (_) { /* Existing notes remain usable if the page is not ready. */ }
      }
      return { file: existingBeforeCapture, videoUrl: existingVideoUrl, skipped: true };
    }
    const snapshot = await extractFcbSnapshot(webview);
    checkPage();
    if (options.expectedUrl && !sameUrl(snapshot.url, options.expectedUrl)) throw new Error("笔记已切换，请重新导入");
    notice.setMessage("已识别笔记：" + snapshot.title + "，正在保存正文和图片…");
    const existingAfterCapture = this.findImportedFile(snapshot.url);
    if (existingAfterCapture) {
      if (options.reveal !== false) await this.openFileReplacingWebview(webview, existingAfterCapture);
      const fm = (_b = this.app.metadataCache.getFileCache(existingAfterCapture)) == null ? void 0 : _b.frontmatter;
      const existingVideoUrl = typeof (fm == null ? void 0 : fm.video_url) === "string" ? fm.video_url : "";
      return { file: existingAfterCapture, videoUrl: existingVideoUrl, skipped: true };
    }
    const videoUrl = snapshotPlaybackUrl(snapshot);

    const markdown = await convertHtmlToMarkdown({
      vault: this.app.vault,
      html: snapshot.html,
      noteTitle: snapshot.title,
      attachmentsFolder: noteAttachmentsFolder(notesFolder),
      downloadImages: this.settings.downloadImages,
      videoUrl
    });
    const path = await this.createNotePath(snapshot.title, notesFolder);
    const content = this.composeNote(snapshot.title, snapshot.url, videoUrl, markdown);
    checkPage();
    const file = await this.app.vault.create(path, content);
    if (options.reveal !== false) await this.openFileReplacingWebview(webview, file);
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
    try {
      let webview = findFcbWebview(fcbUrl);
      if (!webview) {
        await openInWebViewer(this.app, fcbUrl, this.settings.videoOpenPosition);
        webview = await waitForWebview((view) => isFcbUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), fcbUrl));
      }
      const snapshot = await extractFcbSnapshot(webview);
      const checkPage = () => {if (!sameUrl(safeWebviewUrl(webview), fcbUrl) || !sameUrl(snapshot.url, fcbUrl)) throw new Error("笔记页面已切换，已停止同步");};
      checkPage();
      const videoUrl = isPlaybackUrl(frontmatter.video_url) ? frontmatter.video_url : snapshotPlaybackUrl(snapshot);

      const markdown = await convertHtmlToMarkdown({
        vault: this.app.vault,
        html: snapshot.html,
        noteTitle: snapshot.title,
        attachmentsFolder: noteAttachmentsFolder(file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ""),
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
      checkPage();
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
      await this.openFileReplacingWebview(webview, file);
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
    if (!videoUrl || !isPlaybackUrl(videoUrl)) {
      new import_obsidian4.Notice("\u8FD9\u7BC7\u7B14\u8BB0\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u89C6\u9891\u5730\u5740\u3002\u8BF7\u91CD\u65B0\u5BFC\u5165\u6216\u540C\u6B65\uFF0C\u63D2\u4EF6\u4F1A\u5C1D\u8BD5\u81EA\u52A8\u83B7\u53D6\u3002");
      return;
    }
    try {
      if (!findVideoWebview(videoUrl)) await openInWebViewer(this.app, videoUrl, isEmbeddedVideoUrl(videoUrl) ? "tab" : this.settings.videoOpenPosition);
      let activeVideo;
      try {
        activeVideo = await waitAndSeek(videoUrl, seconds);
      } catch (firstError) {
        if (isEmbeddedVideoUrl(videoUrl)) throw new Error("当前笔记页的视频尚未就绪，请确认已登录并等待视频加载后重试");
        console.debug("Netdisk AI Notes Importer: rebuilding stale video Web Viewer", firstError);
        await openInWebViewer(this.app, videoUrl, this.settings.videoOpenPosition);
        activeVideo = await waitAndSeek(videoUrl, seconds);
      }
      const videoLeaf = this.findLeafForWebview(activeVideo);
      if (videoLeaf) {
        await this.app.workspace.revealLeaf(videoLeaf);
        this.app.workspace.setActiveLeaf(videoLeaf, {focus: true});
      }
    } catch (error) {
      console.error("Netdisk AI Notes Importer seek failed", error);
      new import_obsidian4.Notice(`\u89C6\u9891\u8DF3\u8F6C\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async openVideo(url) {
    if (!isPlaybackUrl(url)) {
      new import_obsidian4.Notice("\u5F53\u524D\u7B14\u8BB0\u6CA1\u6709\u6709\u6548\u7684\u767E\u5EA6\u5927\u89C6\u9891\u5730\u5740");
      return;
    }
    const existing = findVideoWebview(url);
    if (!existing) await openInWebViewer(this.app, url, isEmbeddedVideoUrl(url) ? "tab" : this.settings.videoOpenPosition);
    else {
      const leaf = this.findLeafForWebview(existing);
      if (leaf) {await this.app.workspace.revealLeaf(leaf); this.app.workspace.setActiveLeaf(leaf, {focus: true});}
    }
  }
  async associateEmbeddedVideo(file, webview, snapshot) {
    if (!snapshot.hasEmbeddedVideo || !isEmbeddedVideoUrl(snapshot.url) || !sameUrl(safeWebviewUrl(webview), snapshot.url)) return "";
    let linked = "";
    await this.app.fileManager.processFrontMatter(file, fm => {
      if (!sameUrl(safeWebviewUrl(webview), snapshot.url) || fm.source !== "baidu-ai-note" || !sameUrl(fm.fcb_url, snapshot.url)) throw new Error("笔记页面已切换，未更改原视频关联");
      // An explicit existing association always wins over automatic detection.
      if (!fm.video_url) fm.video_url = snapshot.url;
      linked = fm.video_url;
    });
    return linked;
  }
  async retryVideoAssociation(file, webview) {
    const expectedUrl = this.app.metadataCache.getFileCache(file)?.frontmatter?.fcb_url;
    const checkPage = () => {
      if (!isEmbeddedVideoUrl(expectedUrl) || !sameUrl(safeWebviewUrl(webview), expectedUrl)) throw new Error("请先打开这篇笔记的网盘正文页，再重新识别视频");
    };
    checkPage();
    for (let attempt = 0; attempt < 3; attempt++) {
      checkPage();
      const snapshot = await extractFcbSnapshot(webview);
      checkPage();
      if (!sameUrl(snapshot.url, expectedUrl)) throw new Error("笔记页面已切换，请在对应笔记页重试");
      if (snapshot.hasEmbeddedVideo) return this.associateEmbeddedVideo(file, webview, snapshot);
      if (attempt < 2) await delay(700);
    }
    return "";
  }
  rememberVideoUrl(fcbUrl, videoUrl) {
    if (!isFcbUrl(fcbUrl) || !isPlaybackUrl(videoUrl)) return;
    if (this.settings.videoByFcbUrl[fcbUrl] === videoUrl) return;
    this.settings.videoByFcbUrl[fcbUrl] = videoUrl;
    void this.saveSettings();
  }
  startWebviewTracking() {
    const attachAll = () => {
      const views = getWebviews();
      for (const [view, bar] of this.inlineImportBars) {
        if (!views.includes(view)) {bar.destroy(); this.inlineImportBars.delete(view);}
      }
      views.forEach(view => this.attachWebview(view));
    };
    attachAll();
    this.webviewObserver = new MutationObserver(attachAll);
    this.webviewObserver.observe(document.body, { childList: true, subtree: true });
    this.register(() => {
      var _a;
      return (_a = this.webviewObserver) == null ? void 0 : _a.disconnect();
    });
    this.register(() => {for (const bar of this.inlineImportBars.values()) bar.destroy(); this.inlineImportBars.clear();});
  }
  attachWebview(webview) {
    if (this.observedWebviews.has(webview)) return;
    this.observedWebviews.add(webview);
    const bar = new InlineImportBar(this, webview);
    this.inlineImportBars.set(webview, bar);
    const refreshBar = () => void bar.refresh();
    for (const name of ["dom-ready", "did-stop-loading", "did-navigate", "did-navigate-in-page"]) {
      webview.addEventListener(name, refreshBar);
      this.register(() => webview.removeEventListener(name, refreshBar));
    }
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
  async createNotePath(title, notesFolder = this.settings.notesFolder) {
    const folder = validateNotesFolder(this.app, notesFolder);
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
    let target;
    this.app.workspace.iterateAllLeaves(leaf => {if (leaf.view?.file?.path === file.path) target = leaf;});
    target = target || this.app.workspace.getLeaf("tab");
    await target.openFile(file, {active: true});
    this.app.workspace.revealLeaf(target);
  }
  findLeafForWebview(webview) {
    let owner = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      const container = leaf.view.containerEl;
      if (!owner && (container == null ? void 0 : container.contains(webview))) owner = leaf;
    });
    return owner;
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
  return heading.replace(/^#{2,6}\s+/, "").replace(/<span\b[^>]*class=["'][^"']*baidu-ai-timestamp[^"']*["'][^>]*>.*?<\/span>/gi, "").replace(/\[[^\]]+\]\([^)]*pan\.baidu\.com\/(?:pfile\/video|fcb\/edit)[^)]*#t=[^)]*\)/gi, "").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
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
    if (!isPlaybackUrl(value)) return null;
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
