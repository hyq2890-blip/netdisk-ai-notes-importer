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
function findFcbWebview(url) {
  const candidates = getWebviews().filter((view) => safeWebviewUrl(view).includes(FCB_URL_PART));
  if (!url) return candidates[0];
  return candidates.find((view) => samePage(safeWebviewUrl(view), url));
}
function findVideoWebview(videoUrl) {
  return findVideoWebviews(videoUrl)[0];
}
function findVideoWebviews(videoUrl) {
  const candidates = getWebviews().filter((view) => safeWebviewUrl(view).includes(VIDEO_URL_PART));
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

    const found = new Set();
    const add = (raw) => {
      if (!raw || typeof raw !== 'string') return;
      let value = raw.replace(/\\\\\//g, '/').replace(/&amp;/g, '&');
      try { value = decodeURIComponent(value); } catch (_) {}
      if (value.startsWith('//')) value = location.protocol + value;
      if (value.startsWith('/pfile/video')) value = location.origin + value;
      if (value.includes('pan.baidu.com/pfile/video') && !value.startsWith('blob:')) found.add(value);
    };
    document.querySelectorAll('a[href], [data-url], [data-href]').forEach((el) => {
      add(el.href); add(el.getAttribute('data-url')); add(el.getAttribute('data-href'));
    });
    Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .filter((el) => (el.textContent || '').includes('更多视频功能'))
      .forEach((el) => {
        const link = el.closest('a[href]');
        if (link) add(link.href);
        Array.from(el.attributes || []).forEach((attr) => add(attr.value));
      });
    performance.getEntriesByType('resource').forEach((entry) => add(entry.name));
    const pageHtml = document.documentElement.innerHTML;
    const matches = pageHtml.match(/https?:\\?\/\\?\/pan\\?\.baidu\\?\.com\\?\/pfile\\?\/video[^\"'<>\\s]*/g) || [];
    matches.slice(0, 20).forEach(add);

    return { url: location.href, title, html: clone.innerHTML, videoUrlCandidates: Array.from(found) };
  })()`;
  return executeWithRetry(webview, code);
}
async function autoOpenLargeVideo(webview) {
  const before = new Set(getWebviews().map(safeWebviewUrl).filter(isVideoUrl));
  const more = await locateBaiduControl(webview, "more");
  if (!more) return "";
  if (isVideoUrl(more.url)) return more.url;
  await sendWebviewClick(webview, more);
  let discovered = await waitForNewVideoUrl(webview, before, 3500);
  if (discovered) return discovered;
  const largeVideo = await locateBaiduControl(webview, "large-video");
  if (largeVideo) {
    if (isVideoUrl(largeVideo.url)) return largeVideo.url;
    await sendWebviewClick(webview, largeVideo);
  }
  discovered = await waitForNewVideoUrl(webview, before, 8500);
  return discovered;
}
async function locateBaiduControl(webview, kind) {
  const code = String.raw`(() => {
    const kind = ${JSON.stringify(kind)};
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 3 && rect.height > 3 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const normalize = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();
    const matches = (text) => kind === 'more'
      ? text.startsWith('更多视频功能') && text.length < 24
      : !text.includes('更多视频功能') &&
        (text === '大视频' || text.includes('大视频播放') || text.includes('打开大视频')) && text.length < 24;
    const candidates = Array.from(document.querySelectorAll('body *'))
      .filter((el) => visible(el) && matches(normalize(el)))
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      });
    const el = candidates[0];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const link = el.closest('a[href]');
    return {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
      url: link ? link.href : ''
    };
  })()`;
  try {
    return await executeWithRetry(webview, code, 3, 250);
  } catch (e) {
    return null;
  }
}
async function sendWebviewClick(webview, target) {
  if (typeof webview.sendInputEvent === "function") {
    try {
      webview.focus();
      await webview.sendInputEvent({ type: "mouseMove", x: target.x, y: target.y });
      await webview.sendInputEvent({ type: "mouseDown", x: target.x, y: target.y, button: "left", clickCount: 1 });
      await delay(45);
      await webview.sendInputEvent({ type: "mouseUp", x: target.x, y: target.y, button: "left", clickCount: 1 });
      return;
    } catch (error) {
      console.debug("Netdisk AI Notes Importer: trusted webview click failed, using DOM fallback", error);
    }
  }
  const fallback = `(() => {
    const el = document.elementFromPoint(${target.x}, ${target.y});
    if (!el) return false;
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    }
    return true;
  })()`;
  await executeWithRetry(webview, fallback, 2, 200);
}
async function waitForNewVideoUrl(webview, before, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const urls = getWebviews().map(safeWebviewUrl).filter(isVideoUrl);
    const newlyOpened = urls.find((url) => !before.has(url));
    if (newlyOpened) return newlyOpened;
    const navigatedCurrent = safeWebviewUrl(webview);
    if (isVideoUrl(navigatedCurrent)) return navigatedCurrent;
    await delay(300);
  }
  const remaining = getWebviews().map(safeWebviewUrl).filter(isVideoUrl);
  if (remaining.length === 1) return remaining[0];
  return "";
}
async function seekWebview(webview, seconds) {
  const code = `(() => {
    const v = Array.from(document.querySelectorAll("video"))
      .find(v => Number.isFinite(v.duration) && v.duration > 0 && v.readyState >= 1);
    if (!v) return false;
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
async function openInWebViewer(app, url, position) {
  var _a;
  const leaf = position === "right" ? (_a = app.workspace.getRightLeaf(false)) != null ? _a : app.workspace.getLeaf("split", "vertical") : app.workspace.getLeaf(false);
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
  return url.includes(VIDEO_URL_PART) && !url.startsWith("blob:");
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
