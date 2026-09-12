// A destination belongs to one import operation, never to shared mutable settings.
var folderObsidian = require("obsidian");
function validateNotesFolder(app, value) {
  const raw = value.trim().replace(/\\/g, "/");
  if (raw.startsWith("/") || /[:*?"<>|\x00-\x1f]/.test(raw)) throw new Error("请输入 Vault 内的相对文件夹路径");
  const parts = raw.split("/").filter(Boolean);
  if (parts.some(part => part === "." || part === ".." || part.startsWith(".") || /[. ]$/.test(part))) throw new Error("文件夹名称不能以点开头、以点或空格结尾，也不能包含 ..");
  let path = "";
  for (const part of parts) {
    path = path ? `${path}/${part}` : part;
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing && !(existing instanceof folderObsidian.TFolder)) throw new Error(`路径已被文件占用：${path}`);
  }
  return parts.join("/");
}
var NotesFolderPicker = class extends folderObsidian.SuggestModal {
  constructor(app, initial, resolve) {
    super(app);
    this.initial = initial;
    this.resolve = resolve;
    this.setPlaceholder("搜索已有文件夹，或输入新路径（留空可选根目录）");
  }
  onOpen() {
    super.onOpen();
    this.inputEl.value = this.initial;
    this.inputEl.dispatchEvent(new Event("input"));
    this.inputEl.select();
  }
  getSuggestions(query) {
    const folders = this.app.vault.getAllLoadedFiles().filter(file => file instanceof folderObsidian.TFolder && file.path !== "/").map(file => file.path);
    const matches = ["", ...folders.sort((a, b) => a.localeCompare(b))].filter(path => path.toLowerCase().includes(query.trim().toLowerCase())).map(path => ({ path, create: false }));
    try {
      const path = validateNotesFolder(this.app, query);
      if (path && !folders.includes(path)) matches.unshift({ path, create: true });
    } catch (error) {
      matches.unshift({ error: error.message });
    }
    return matches;
  }
  renderSuggestion(item, el) {
    el.setText(item.error || (item.create ? `新建文件夹：${item.path}` : item.path || "Vault 根目录"));
  }
  selectSuggestion(item, event) {
    // Invalid input must leave the picker open so the user can correct it.
    try {
      if (item.error) throw new Error(item.error);
      validateNotesFolder(this.app, item.path);
    } catch (error) {
      new folderObsidian.Notice(error.message);
      return;
    }
    this.selectedPath = item.path;
    super.selectSuggestion(item, event);
  }
  onChooseSuggestion(item) { this.finish(item.path); }
  finish(value) {
    if (this.resolve) {
      const resolve = this.resolve;
      this.resolve = null;
      resolve(value);
    }
  }
  onClose() {
    super.onClose();
    this.finish(this.selectedPath === undefined ? null : this.selectedPath);
  }
};
function chooseNotesFolder(app, initial) {
  return new Promise(resolve => new NotesFolderPicker(app, initial, resolve).open());
}

function noteAttachmentsFolder(folder) {
  return folder ? `${folder}/attachments` : "attachments";
}
