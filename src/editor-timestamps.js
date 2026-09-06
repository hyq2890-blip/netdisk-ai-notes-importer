// Editor timestamp interactions.
var import_view = require("@codemirror/view");
var TIMESTAMP_PATTERN = /<span\s+class="baidu-ai-timestamp"\s+data-time="(\d+(?:\.\d+)?)">([^<]+)<\/span>/g;
var NetdiskTimestampWidget = class extends import_view.WidgetType {
  constructor(seconds, label, onSeek) {
    super();
    this.seconds = seconds;
    this.label = label;
    this.onSeek = onSeek;
  }
  eq(other) {
    return this.seconds === other.seconds && this.label === other.label;
  }
  toDOM() {
    const element = document.createElement("span");
    element.className = "baidu-ai-timestamp baidu-ai-timestamp-editor";
    element.dataset.time = String(this.seconds);
    element.textContent = this.label;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `\u8DF3\u8F6C\u5230\u89C6\u9891 ${this.label}`);
    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.onSeek(this.seconds);
    };
    element.addEventListener("pointerdown", (event) => {
      if (event.button === 0) activate(event);
    });
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") activate(event);
    });
    return element;
  }
  ignoreEvent(event) {
    return event.type === "click" || event.type === "keydown" || event.type.startsWith("pointer") || event.type.startsWith("mouse");
  }
};
function buildDecorations(view, onSeek) {
  const source = view.state.doc.toString();
  const ranges = [];
  TIMESTAMP_PATTERN.lastIndex = 0;
  let match;
  while ((match = TIMESTAMP_PATTERN.exec(source)) !== null) {
    const seconds = Number(match[1]);
    if (!Number.isFinite(seconds)) continue;
    const widget = new NetdiskTimestampWidget(seconds, decodeEntities(match[2]), onSeek);
    ranges.push(import_view.Decoration.replace({ widget }).range(match.index, match.index + match[0].length));
  }
  return import_view.Decoration.set(ranges, true);
}
function createTimestampEditorExtension(onSeek) {
  const legacyWidgets = import_view.ViewPlugin.fromClass(class {
    constructor(view) {
      this.decorations = buildDecorations(view, onSeek);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view, onSeek);
      }
    }
  }, {
    decorations: (plugin) => plugin.decorations
  });
  const markdownLinkClicks = import_view.EditorView.domEventHandlers({
    pointerdown(event) {
      if (event.button !== 0) return false;
      const target = event.target;
      if (!(target instanceof Element)) return false;
      const link = target.closest('a[href*="pan.baidu.com/pfile/video"][href*="#t="]');
      if (!link) return false;
      const seconds = secondsFromHref(link.href);
      if (seconds === null) return false;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onSeek(seconds);
      return true;
    }
  });
  return [legacyWidgets, markdownLinkClicks];
}
function decodeEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}
function secondsFromHref(value) {
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
