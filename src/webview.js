// Baidu Netdisk Web Viewer integration.
var import_obsidian3 = require("obsidian");
var FCB_URL_PART = "pan.baidu.com/fcb/edit";
var VIDEO_URL_PART = "pan.baidu.com/pfile/video";
function getWebviews() {
  return Array.from(document.querySelectorAll("webview"));
}
function safeWebviewUrl(webview) {
  try {
    return webview.getURL() || "";
  } catch (e) {
    return "";
  }
}
function findFcbWebview(url, app) {
  const candidates = getWebviews().filter((view) => safeWebviewUrl(view).includes(FCB_URL_PART));
  if (!url) {
    const container = app?.workspace?.activeLeaf?.view?.containerEl;
    const active = candidates.find(view => container?.contains(view));
    if (active) return active;
    if (candidates.length > 1) throw new Error("打开了多篇 AI 笔记，请先选中要导入的网页标签，再执行导入命令。");
    return candidates[0];
  }
  return candidates.find((view) => samePage(safeWebviewUrl(view), url));
}
function findVideoWebview(videoUrl) {
  return findVideoWebviews(videoUrl)[0];
}
function findVideoWebviews(videoUrl) {
  if (isEmbeddedVideoUrl(videoUrl)) {
    return getWebviews().filter(view => isEmbeddedVideoUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), videoUrl));
  }
  const candidates = getWebviews().filter((view) => isVideoUrl(safeWebviewUrl(view)));
  if (!videoUrl) return candidates;
  const exact = candidates.filter((view) => samePage(safeWebviewUrl(view), videoUrl));
  if (exact.length > 0) return exact;
  const wantedPath = getQueryPath(videoUrl);
  return wantedPath ? candidates.filter((view) => getQueryPath(safeWebviewUrl(view)) === wantedPath) : [];
}
function normalizedUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch (e) {
    return value;
  }
}
function samePage(left, right) {
  return normalizedUrl(left) === normalizedUrl(right);
}
function getQueryPath(value) {
  try {
    return new URL(value).searchParams.get("path");
  } catch (e) {
    return null;
  }
}
async function executeWithRetry(webview, code, attempts = 4, delayMs = 350) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await webview.executeJavaScript(code, true);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(delayMs * attempt);
    }
  }
  throw new Error(`Web Viewer \u811A\u672C\u6267\u884C\u5931\u8D25\uFF08\u5DF2\u91CD\u8BD5 ${attempts} \u6B21\uFF09\uFF1A${errorMessage(lastError)}`);
}
async function extractFcbSnapshot(webview) {
  const code = String.raw`(() => {
    const editor = document.querySelector('.ql-editor');
    if (!editor) throw new Error('找不到 .ql-editor，页面可能尚未加载完成');
    const clone = editor.cloneNode(true);
    clone.querySelectorAll('.ql-timestamp-content').forEach((node) => {
      const text = (node.textContent || '').trim();
      const parts = text.split(':').map(Number);
      let seconds = NaN;
      if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
      if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (Number.isFinite(seconds)) {
        node.setAttribute('data-baidu-ai-time', String(seconds));
        node.setAttribute('data-baidu-ai-label', text);
      }
    });

    const pathTitle = (() => {
      try {
        const path = new URL(location.href).searchParams.get('path') || '';
        return (path.split('/').filter(Boolean).pop() || '').replace(/\.fcb$/i, '');
      } catch (_) { return ''; }
    })();
    const titleSelectors = [
      'input[placeholder*="标题"]', '[class*="title"] input',
      '[class*="title"][contenteditable="true"]', '.document-title', 'h1'
    ];
    let title = pathTitle.trim();
    if (!title) {
      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        const value = el && ('value' in el ? el.value : el.textContent);
        if (value && String(value).trim()) { title = String(value).trim(); break; }
      }
    }
    if (!title) title = document.title.replace(/[-_|].*百度网盘.*$/i, '').trim() || '百度 AI 笔记';

    const hasEmbeddedVideo = Array.from(document.querySelectorAll('video'))
      .some(video => Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 1);
    return { url: location.href, title, html: clone.innerHTML, videoUrlCandidates: [], hasEmbeddedVideo };
  })()`;
  return executeWithRetry(webview, code);
}
async function seekWebview(webview, seconds) {
  const code = `(() => {
    const v = Array.from(document.querySelectorAll("video"))
      .find(v => Number.isFinite(v.duration) && v.duration > 0 && v.readyState >= 1);
    if (!v) return false;
    if (${JSON.stringify(isEmbeddedVideoUrl(safeWebviewUrl(webview)))}) v.pause();
    v.currentTime = ${JSON.stringify(seconds)};
    // Chromium may apply the seek asynchronously; successful assignment is enough.
    return true;
  })()`;
  try {
    return await executeWithRetry(webview, code, 2, 250);
  } catch (e) {
    return false;
  }
}
async function waitForWebview(predicate, timeoutMs = 2e4, intervalMs = 400) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = getWebviews().find(predicate);
    if (match) return match;
    await delay(intervalMs);
  }
  throw new Error("\u7B49\u5F85 Web Viewer \u52A0\u8F7D\u8D85\u65F6");
}
async function waitAndSeek(videoUrl, seconds) {
  const deadline = Date.now() + 25e3;
  let foundAny = false;
  while (Date.now() < deadline) {
    const views = findVideoWebviews(videoUrl);
    foundAny || (foundAny = views.length > 0);
    for (const view of views) {
      if (await seekWebview(view, seconds)) return view;
    }
    await delay(500);
  }
  throw new Error(foundAny ? "\u89C6\u9891\u64AD\u653E\u5668\u5728\u8D85\u65F6\u524D\u672A\u51C6\u5907\u597D" : "\u672A\u627E\u5230\u5BF9\u5E94\u7684\u5927\u89C6\u9891 Web Viewer");
}
// The import entry belongs in the main workspace, never in a sidebar.
// Reuse an existing page without reloading it or resetting its navigation.
function focusImportWorkspace(app) {
  // Settings can live in a separate window. Leaving it open would hide the
  // activated main tab, and a guide created there would inherit that window.
  if (app.setting?.modalEl?.isConnected) app.setting.close();
  app.workspace.containerEl?.ownerDocument?.defaultView?.focus();
}
async function openNetdiskEntry(app) {
  focusImportWorkspace(app);
  const workspace = app.workspace;
  const leaves = [];
  workspace.iterateAllLeaves(leaf => { leaves.push(leaf); });
  const isMain = leaf => leaf.getRoot() === workspace.rootSplit;
  const isNetdisk = leaf => {
    const saved = leaf.getViewState();
    if (leaf.view.getViewType() !== "webviewer" && saved.type !== "webviewer") return false;
    const webview = leaf.view.containerEl?.querySelector("webview");
    const liveUrl = webview && safeWebviewUrl(webview);
    // A restored tab can still be deferred or showing about:blank. Its saved
    // destination is enough to select it without creating a duplicate tab.
    const url = liveUrl && liveUrl !== "about:blank" ? liveUrl : saved.state?.url;
    try { const parsed = new URL(url); return parsed.protocol === "https:" && parsed.hostname === "pan.baidu.com"; } catch (_) { return false; }
  };
  const active = workspace.activeLeaf;
  const pages = leaves.filter(isNetdisk);
  const existing = pages.find(leaf => leaf === active && isMain(leaf)) || pages.find(isMain) || pages[0];
  if (existing && isMain(existing)) {
    await workspace.revealLeaf(existing);
    workspace.setActiveLeaf(existing, {focus: true});
    workspace.rightSplit?.collapse();
    return existing;
  }
  const empty = leaf => isMain(leaf) && leaf.view.getViewType() === "empty";
  const target = leaves.find(leaf => leaf === active && empty(leaf)) || leaves.find(empty) || workspace.getLeaf("tab");
  if (!isMain(target)) throw new Error("无法在中央打开网盘，请先选中中间的标签页后重试。");
  const state = existing ? existing.getViewState() : {type: "webviewer", state: {url: "https://pan.baidu.com"}};
  await target.setViewState({...state, active: true});
  await workspace.revealLeaf(target);
  workspace.setActiveLeaf(target, {focus: true});
  // Close only the relocated sidebar page, after the central page is ready.
  if (existing) existing.detach();
  workspace.rightSplit?.collapse();
  return target;
}
async function openInWebViewer(app, url, position) {
  var _a;
  const leaf = position === "tab" ? app.workspace.getLeaf("tab") : position === "right" ? (_a = app.workspace.getRightLeaf(false)) != null ? _a : app.workspace.getLeaf("split", "vertical") : app.workspace.getLeaf(false);
  try {
    await leaf.setViewState({ type: "webviewer", active: true, state: { url } });
    app.workspace.revealLeaf(leaf);
    return leaf;
  } catch (error) {
    new import_obsidian3.Notice("\u65E0\u6CD5\u6253\u5F00 Obsidian Web Viewer\u3002\u8BF7\u786E\u8BA4\u6838\u5FC3\u63D2\u4EF6\u201C\u7F51\u9875\u6D4F\u89C8\u5668\u201D\u5DF2\u542F\u7528\u3002");
    throw error;
  }
}
function isVideoUrl(url) {
  try { const parsed = new URL(url); return parsed.protocol === "https:" && parsed.hostname === "pan.baidu.com" && parsed.pathname === "/pfile/video"; } catch (_) { return false; }
}
function isEmbeddedVideoUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "pan.baidu.com" && url.pathname === "/fcb/edit" && Boolean(url.searchParams.get("path") || url.searchParams.get("fsid"));
  } catch (_) { return false; }
}
function isPlaybackUrl(value) { return isVideoUrl(value) || isEmbeddedVideoUrl(value); }
function snapshotPlaybackUrl(snapshot, fallback = "") {
  return snapshot.hasEmbeddedVideo && isEmbeddedVideoUrl(snapshot.url) ? snapshot.url : fallback;
}
function isFcbUrl(url) {
  return url.includes(FCB_URL_PART);
}
function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
