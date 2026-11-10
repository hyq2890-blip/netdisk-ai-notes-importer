// Obsidian-owned controls beside the current webview, never inside Baidu's DOM.
function netdiskPageKind(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "pan.baidu.com") return "other";
    return parsed.pathname === "/fcb/edit" ? "note" : "netdisk";
  } catch (_) { return "other"; }
}

var InlineImportBar = class {
  constructor(plugin, webview) {
    this.plugin = plugin;
    this.webview = webview;
    this.version = 0;
    this.retries = 0;
    this.busy = false;
    this.disposed = false;
    const leaf = plugin.findLeafForWebview(webview);
    const container = leaf?.view.containerEl;
    const content = container?.querySelector(".view-content");
    if (!content) return;
    this.el = container.createDiv({cls: "netdisk-inline-import"});
    container.insertBefore(this.el, content);
    const info = this.el.createDiv({cls: "netdisk-inline-info"});
    this.titleEl = info.createDiv({cls: "netdisk-inline-title", text: "网盘笔记导入"});
    this.statusEl = info.createDiv({cls: "netdisk-inline-status"});
    this.statusEl.setAttribute("role", "status");
    this.statusEl.setAttribute("aria-live", "polite");
    const actions = this.el.createDiv({cls: "netdisk-inline-actions"});
    this.primary = new import_obsidian4.ButtonComponent(actions).setButtonText("导入到 Obsidian").setCta().onClick(() => {
      if (this.result) void plugin.openFileReplacingWebview(null, this.result.file);
      else void this.importNote();
    });
    this.videoRetry = new import_obsidian4.ButtonComponent(actions).setButtonText("重新识别视频").onClick(() => void this.retryVideo());
    this.bind = new import_obsidian4.ButtonComponent(actions).setButtonText("手动补充").onClick(() => {
      const result = this.result;
      if (result) plugin.showVideoBinding(result.file, {reveal: false, onSaved: url => {
        if (this.result !== result || this.disposed) return;
        result.videoUrl = url;
        this.showResult();
      }});
    });
    this.retry = new import_obsidian4.ButtonComponent(actions).setButtonText("重新识别").onClick(() => {this.retries = 0; void this.refresh();});
    void this.refresh();
  }
  status(text) { if (!this.disposed) this.statusEl?.setText(text); }
  async refresh() {
    if (!this.el || this.disposed) return;
    clearTimeout(this.timer);
    const version = ++this.version;
    const url = safeWebviewUrl(this.webview);
    if (this.videoBusy && sameUrl(url, this.videoOperationUrl)) return;
    const kind = netdiskPageKind(url);
    this.el.hidden = kind === "other";
    if (kind === "other") return;
    this.url = url;
    this.ready = false;
    this.result = null;
    this.primary.setButtonText("导入到 Obsidian").setDisabled(true);
    this.bind.buttonEl.hidden = true;
    this.videoRetry.buttonEl.hidden = true;
    this.retry.buttonEl.hidden = true;
    this.titleEl.setText("网盘笔记导入");
    this.titleEl.removeAttribute("title");
    if (this.busy) {this.status("正在完成上一笔记的导入，请稍候…"); return;}
    if (kind !== "note") {this.status("打开 AI 笔记正文后，即可在这里导入。"); return;}
    this.status("正在识别当前笔记…");
    try {
      const snapshot = await extractFcbSnapshot(this.webview);
      if (this.disposed || this.version !== version) return;
      if (!snapshot.html.trim()) throw new Error("正文尚未加载");
      if (!sameUrl(snapshot.url, url)) {void this.refresh(); return;}
      this.titleEl.setText(snapshot.title);
      this.titleEl.setAttribute("title", snapshot.title);
      this.retries = 0;
      const file = this.plugin.findImportedFile(url);
      if (file) {
        const fm = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
        let videoUrl = fm?.video_url || "";
        if (!videoUrl && snapshot.hasEmbeddedVideo) {
          try {videoUrl = await this.plugin.associateEmbeddedVideo(file, this.webview, snapshot);} catch (_) { /* Keep the manual fallback available. */ }
          if (this.disposed || this.version !== version) return;
        }
        this.result = {file, videoUrl, skipped: true};
        this.showResult();
      } else {
        this.ready = true;
        this.primary.setDisabled(false);
        this.status("已识别这篇笔记，可直接导入到 Obsidian。");
      }
    } catch (_) {
      if (this.disposed || this.version !== version) return;
      this.status("笔记正文尚未加载完成，正在等待；也可以点击重新识别。");
      this.retry.buttonEl.hidden = false;
      if (this.retries++ < 5) this.timer = setTimeout(() => void this.refresh(), 1500);
    }
  }
  showResult() {
    if (this.disposed) return;
    this.primary.setButtonText("查看本地笔记").setDisabled(false);
    const missing = !this.result.videoUrl;
    this.videoRetry.buttonEl.hidden = !missing;
    this.videoRetry.setDisabled(Boolean(this.videoBusy)).setButtonText(this.videoBusy ? "正在识别…" : "重新识别视频");
    this.bind.buttonEl.hidden = !missing || this.videoRetryFailedFor !== this.result.file.path;
    this.retry.buttonEl.hidden = true;
    const videoStatus = !missing ? "视频已关联，可点击本地笔记时间点回看" : this.videoBusy ? "正在重新识别当前页的视频，请稍候…" : this.videoRetryFailedFor === this.result.file.path ? "仍未识别到视频。可等待加载后重试，或点“手动补充”查看步骤" : "正文已保存，视频暂未就绪，可点“重新识别视频”再试一次";
    this.status(`${this.result.skipped ? "已导入" : "导入成功"} · ${this.result.file.path} · ${videoStatus}`);
  }
  async retryVideo() {
    if (!this.result || this.result.videoUrl || this.videoBusy || this.disposed) return;
    const result = this.result;
    const expectedUrl = safeWebviewUrl(this.webview);
    this.videoOperationUrl = expectedUrl;
    this.videoBusy = true;
    this.el?.setAttribute("aria-busy", "true");
    this.showResult();
    try {
      const videoUrl = await this.plugin.retryVideoAssociation(result.file, this.webview);
      if (this.disposed || this.result !== result || !sameUrl(safeWebviewUrl(this.webview), expectedUrl)) return;
      result.videoUrl = videoUrl;
      this.videoRetryFailedFor = videoUrl ? null : result.file.path;
    } catch (error) {
      if (this.disposed || this.result !== result || !sameUrl(safeWebviewUrl(this.webview), expectedUrl)) return;
      this.videoRetryFailedFor = result.file.path;
      this.videoBusy = false;
      this.showResult();
      this.status(`正文已保存；重新识别未完成：${messageOf(error)}。也可点“手动补充”查看步骤。`);
      return;
    } finally {
      this.videoBusy = false;
      this.el?.removeAttribute("aria-busy");
      if (!this.disposed && this.result && this.result !== result) this.showResult();
    }
    if (!this.disposed && this.result === result) this.showResult();
  }
  async importNote() {
    if (this.busy || !this.ready || this.disposed) return;
    const expectedUrl = safeWebviewUrl(this.webview);
    if (!sameUrl(expectedUrl, this.url) || netdiskPageKind(expectedUrl) !== "note") {void this.refresh(); return;}
    this.busy = true;
    this.ready = false;
    this.el.setAttribute("aria-busy", "true");
    this.primary.setDisabled(true);
    this.status("请选择保存文件夹…");
    try {
      const folder = await this.plugin.selectImportFolder();
      if (folder === null) {this.busy = false; await this.refresh(); return;}
      try {await this.webview.executeJavaScript("document.querySelectorAll('video,audio').forEach(media => media.pause())", true);} catch (_) {}
      const result = await this.plugin.importWebview(this.webview, {setMessage: text => {
        if (sameUrl(safeWebviewUrl(this.webview), expectedUrl)) this.status(text);
      }}, folder, {reveal: false, expectedUrl});
      if (this.disposed) return;
      if (!sameUrl(safeWebviewUrl(this.webview), expectedUrl)) {this.busy = false; await this.refresh(); return;}
      this.result = result;
      this.showResult();
    } catch (error) {
      if (this.disposed) return;
      if (!sameUrl(safeWebviewUrl(this.webview), expectedUrl)) {this.busy = false; await this.refresh(); return;}
      this.status(`导入失败：${messageOf(error)}。可以在本页重试。`);
      this.ready = true;
      this.primary.setDisabled(false);
    } finally {
      this.busy = false;
      this.el?.removeAttribute("aria-busy");
    }
  }
  destroy() {
    this.disposed = true;
    ++this.version;
    clearTimeout(this.timer);
    this.el?.remove();
  }
};
