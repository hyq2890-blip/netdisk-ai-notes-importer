// Settings UI.
var import_obsidian2 = require("obsidian");
var NetdiskAiNotesSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("AI \u7B14\u8BB0\u4FDD\u5B58\u76EE\u5F55").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Markdown \u4FDD\u5B58\u76EE\u5F55").setDesc("\u76F8\u5BF9\u4E8E Vault \u6839\u76EE\u5F55\uFF1B\u7559\u7A7A\u8868\u793A\u6839\u76EE\u5F55\u3002").addText((text) => text.setPlaceholder("Netdisk AI Notes Importer").setValue(this.plugin.settings.notesFolder).onChange(async (value) => {
      this.plugin.settings.notesFolder = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u56FE\u7247\u9644\u4EF6\u76EE\u5F55").setDesc("\u767E\u5EA6 AI \u7B14\u8BB0\u56FE\u7247\u4FDD\u5B58\u4F4D\u7F6E\uFF0C\u76F8\u5BF9\u4E8E Vault \u6839\u76EE\u5F55\u3002").addText((text) => text.setPlaceholder("Netdisk AI Notes Importer/attachments").setValue(this.plugin.settings.attachmentsFolder).onChange(async (value) => {
      this.plugin.settings.attachmentsFolder = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u81EA\u52A8\u4E0B\u8F7D\u56FE\u7247").setDesc("\u5173\u95ED\u65F6\u4FDD\u7559\u767E\u5EA6 CDN \u56FE\u7247\u5730\u5740\u3002").addToggle((toggle) => toggle.setValue(this.plugin.settings.downloadImages).onChange(async (value) => {
      this.plugin.settings.downloadImages = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u540C\u6B65\u7B56\u7565").setDesc("\u589E\u91CF\u540C\u6B65\u4FDD\u7559\u5DF2\u6709\u7AE0\u8282\u53CA\u5176\u4E2D\u7684\u4FEE\u6539\uFF0C\u53EA\u8865\u5145\u8FDC\u7AEF\u65B0\u589E\u7684\u6807\u9898\u7AE0\u8282\u3002\u8986\u76D6\u6A21\u5F0F\u4F1A\u66FF\u6362\u63D2\u4EF6\u7BA1\u7406\u533A\u57DF\u3002").addDropdown((dropdown) => dropdown.addOption("incremental", "\u589E\u91CF\u540C\u6B65\uFF08\u63A8\u8350\uFF09").addOption("replace", "\u8986\u76D6\u63D2\u4EF6\u7BA1\u7406\u533A\u57DF").setValue(this.plugin.settings.syncMode).onChange(async (value) => {
      this.plugin.settings.syncMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u5BFC\u5165\u540E\u6253\u5F00\u5927\u89C6\u9891").addToggle((toggle) => toggle.setValue(this.plugin.settings.openVideoAfterImport).onChange(async (value) => {
      this.plugin.settings.openVideoAfterImport = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u5927\u89C6\u9891\u6253\u5F00\u4F4D\u7F6E").setDesc("Web Viewer \u4F7F\u7528\u7684\u4F4D\u7F6E\u3002").addDropdown((dropdown) => dropdown.addOption("current", "\u5F53\u524D\u9875").addOption("right", "\u53F3\u4FA7\u5206\u680F").setValue(this.plugin.settings.videoOpenPosition).onChange(async (value) => {
      this.plugin.settings.videoOpenPosition = value;
      await this.plugin.saveSettings();
    }));
  }
};
