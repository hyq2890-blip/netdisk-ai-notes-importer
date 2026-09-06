// HTML to Markdown conversion.
async function convertHtmlToMarkdown(options) {
  const doc = new DOMParser().parseFromString(`<div id="baidu-ai-root">${options.html}</div>`, "text/html");
  const root2 = doc.querySelector("#baidu-ai-root");
  if (!root2) throw new Error("HTML \u89E3\u6790\u5931\u8D25");
  simplifyQuillTables(root2, doc);
  if (options.downloadImages) {
    await localizeImages(root2, options);
  }
  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**"
  });
  turndown.use(gfm);
  turndown.keep(["u", "mark"]);
  turndown.addRule("quillBold", {
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const weight = node.style.fontWeight;
      return Array.from(node.classList).some((name) => name.startsWith("ql-bold")) || weight === "bold" || Number(weight) >= 600;
    },
    replacement: (content) => content.trim() ? `**${content.trim()}**` : ""
  });
  turndown.addRule("quillListItem", {
    filter: "li",
    replacement: (content, node) => {
      var _a;
      const item = node;
      const indentMatch = item.className.match(/(?:^|\s)ql-indent-(\d+)(?:\s|$)/);
      const level = indentMatch ? Number(indentMatch[1]) : 0;
      const indent = "  ".repeat(Math.max(0, level));
      const listType = item.getAttribute("data-list");
      const ordered = listType === "ordered" || !listType && ((_a = item.parentElement) == null ? void 0 : _a.nodeName) === "OL";
      const marker = ordered ? "1. " : "- ";
      const cleaned = content.replace(/^\s+|\s+$/g, "").replace(/\n/g, `
${indent}   `);
      if (/^!\[\[[^\n]+\]\]$/.test(cleaned) || /^!\[[^\n]*\]\([^\n]+\)$/.test(cleaned)) {
        return `

${cleaned}

`;
      }
      return `
${indent}${marker}${cleaned}
`;
    }
  });
  turndown.addRule("baiduTimestamp", {
    filter: (node) => node instanceof HTMLElement && node.hasAttribute("data-baidu-ai-time"),
    replacement: (_content, node) => {
      var _a;
      const element = node;
      const seconds = Number(element.getAttribute("data-baidu-ai-time"));
      const label = element.getAttribute("data-baidu-ai-label") || ((_a = element.textContent) == null ? void 0 : _a.trim()) || formatTime(seconds);
      if (!Number.isFinite(seconds)) return label;
      if (options.videoUrl) {
        const baseUrl = options.videoUrl.split("#")[0];
        return `[${escapeMarkdownLabel(label)}](${baseUrl}#t=${formatTime(seconds)})`;
      }
      return `<span class="baidu-ai-timestamp" data-time="${seconds}">${escapeHtml(label)}</span>`;
    }
  });
  turndown.addRule("localizedImage", {
    filter: (node) => node.nodeName === "IMG" && Boolean(node.dataset.obsidianPath),
    replacement: (_content, node) => {
      var _a, _b;
      const image = node;
      const path = (_a = image.dataset.obsidianPath) != null ? _a : "";
      const alt = (_b = image.getAttribute("alt")) == null ? void 0 : _b.trim();
      return `![[${path}${alt ? `|${alt}` : ""}]]`;
    }
  });
  return polishMarkdown(turndown.turndown(root2.innerHTML));
}
function simplifyQuillTables(root2, doc) {
  root2.querySelectorAll("table").forEach((sourceTable) => {
    const rows = Array.from(sourceTable.querySelectorAll("tr"));
    if (rows.length === 0) return;
    const table = doc.createElement("table");
    rows.forEach((sourceRow, rowIndex) => {
      const row = doc.createElement("tr");
      Array.from(sourceRow.children).filter((cell2) => cell2.tagName === "TD" || cell2.tagName === "TH").forEach((sourceCell) => {
        var _a;
        const cell2 = doc.createElement(rowIndex === 0 ? "th" : "td");
        cell2.textContent = ((_a = sourceCell.textContent) != null ? _a : "").replace(/\s+/g, " ").trim();
        row.appendChild(cell2);
      });
      if (row.children.length > 0) table.appendChild(row);
    });
    if (table.children.length > 0) sourceTable.replaceWith(table);
  });
}
function polishMarkdown(markdown) {
  let result = markdown.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "").replace(/^以下为AI生成的图文笔记的内容\s*$/m, "").replace(/^(#{4,6})(\s+)/gm, (_match, hashes, space) => `${"#".repeat(hashes.length - 2)}${space}`).replace(/^(#{2,4}\s+[^\n]+)\n\n(<span class="baidu-ai-timestamp"[^>]*>[^<]+<\/span>)/gm, "$1 $2").replace(/^(#{2,4}\s+[^\n]+)\n\n(\[[^\]\n]+\]\(https:\/\/pan\.baidu\.com\/pfile\/video[^\n]*#t=[^)]+\))/gm, "$1 $2").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  return result;
}
async function localizeImages(root2, options) {
  const images = Array.from(root2.querySelectorAll("img[src]"));
  if (images.length === 0) return;
  const folder = cleanVaultPath(options.attachmentsFolder || "Netdisk AI Notes Importer/attachments");
  await ensureFolder(options.vault, folder);
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const src = image.getAttribute("src");
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;
    try {
      const response = await (0, import_obsidian.requestUrl)({ url: src, method: "GET" });
      const extension = inferExtension(src, response.headers["content-type"]);
      const base = `${sanitizeFileName(options.noteTitle)}-${shortHash(src)}.${extension}`;
      const path = (0, import_obsidian.normalizePath)(`${folder}/${base}`);
      if (!options.vault.getAbstractFileByPath(path)) {
        await options.vault.createBinary(path, response.arrayBuffer);
      }
      image.dataset.obsidianPath = path;
    } catch (error) {
      console.warn("Netdisk AI Notes Importer: image download failed", src, error);
    }
  }
}
async function ensureFolder(vault, folder) {
  if (!folder) return;
  const parts = (0, import_obsidian.normalizePath)(folder).split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) await vault.createFolder(current);
  }
}
function inferExtension(url, contentType) {
  const byType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif"
  };
  const mime = contentType == null ? void 0 : contentType.split(";")[0].toLowerCase();
  if (mime && byType[mime]) return byType[mime];
  try {
    const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (match && /^(jpe?g|png|gif|webp|svg|avif)$/i.test(match[1])) return match[1].toLowerCase().replace("jpeg", "jpg");
  } catch (e) {
  }
  return "jpg";
}
function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ").trim().slice(0, 120) || "\u767E\u5EA6 AI \u7B14\u8BB0";
}
function cleanVaultPath(value) {
  return (0, import_obsidian.normalizePath)(value.trim().replace(/^[/\\]+|[/\\]+$/g, ""));
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const secs = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeMarkdownLabel(value) {
  return value.replace(/([\\\[\]])/g, "\\$1");
}
function shortHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
