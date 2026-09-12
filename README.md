# Netdisk AI Notes Importer

Import Baidu Netdisk AI video notes into Obsidian as local Markdown, with batch import, clickable original-video timestamps, image downloads, and incremental sync. Imported notes can also be used in a Media Extended video-note workflow. Media Extended is optional; no internal API integration is required.

## 0.8.1 — Folder selection / 保存文件夹选择

## 新增功能

- 新增爬取前询问保存文件夹的功能，可选择已有文件夹，也可新建文件夹。
- 关闭“导入前询问保存文件夹”后，可选择固定文件夹，笔记将直接保存到该目录。
- 批量导入前仅询问一次，整批笔记保存到同一个文件夹。
- 下载的图片自动保存到笔记所在文件夹的 `attachments` 子目录。
- 简化保存位置设置，移除重复的目录选项。

升级时保留 `data.json`。已有笔记和图片不会自动移动，原有图片链接保持不变。

## What's new

- Choose an existing folder or create a new one before capturing AI notes.
- Turn off the folder prompt to save notes directly to a fixed folder configured in settings.
- Batch import asks once and uses the selected destination for the entire batch.
- Downloaded images follow notes into the destination folder's `attachments` subfolder.
- Simplified storage settings by removing duplicate folder options.

Keep `data.json` when upgrading. Existing notes and images are not moved, and existing image links are preserved.

## Installation

Currently confirmed on Windows desktop only. Enable the core **Web Viewer** plugin in Obsidian. The plugin interface is currently in Chinese.

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest GitHub release](https://github.com/hyq2890-blip/netdisk-ai-notes-importer/releases/latest).
2. Create the folder `.obsidian/plugins/baidu-ai-notes/` inside your vault and copy these three files into it.
3. Restart Obsidian and enable **Netdisk AI Notes Importer** under Settings → Community plugins.
4. When upgrading, keep your existing `data.json` settings file.

## Usage

1. Open an existing Baidu Netdisk online AI note in Obsidian's Web Viewer and wait for its contents to load. You need access to the note and its original video; sign in to Baidu Netdisk when prompted.
2. Click the left ribbon button **导入或同步百度 AI 笔记** and choose an existing folder or enter a new folder path before capture. Disable the folder prompt in settings to use a fixed destination. Downloaded images are saved in the destination folder’s `attachments` subfolder. If a managed local note is active, this button synchronizes it instead.
3. To batch import, open several AI note tabs and click **批量导入所有已打开的百度 AI 笔记**. Choose the destination once for the entire batch. Previously imported notes are skipped.
4. Click a timestamp in the imported Markdown to open or seek the original video. The AI note page does not need to stay open. Playback still depends on the source link, permissions, and browser session.
5. Continue editing the Markdown directly, or use Media Extended for your video-note workflow. Incremental sync keeps existing sections and adds new heading sections; replacement sync overwrites the plugin-managed region.

## Network and privacy

The plugin reads opened Baidu Netdisk note pages, opens original video pages, and optionally downloads images from their source URLs. It stores Markdown, images, source URLs, and video mappings locally in the vault and plugin settings. Duplicate detection enumerates Markdown files and checks their cached metadata across the vault, including notes moved outside the default folder. Synchronization reads and updates the selected managed note. The plugin has no telemetry or backend upload service; website sessions are managed by Baidu Netdisk and Web Viewer. This is an unofficial project, not affiliated with Baidu or Media Extended.

## 中文说明

将百度网盘 AI 视频笔记导入 Obsidian，保留可跳转的原视频时间戳，并可配合 Media Extended 继续整理视频笔记。

> 当前版本仅确认支持 Obsidian Windows 桌面版。插件依赖 Obsidian 核心插件“网页浏览器”（Web Viewer），暂未验证 macOS、Linux 和移动端。

## 主要功能

- 将百度网盘在线 AI 笔记转换为本地 Markdown 文件。
- 保留标题、段落、列表、表格、图片和视频时间戳等内容。
- 支持一次打开多个 AI 笔记页面后批量导入，并显示成功、跳过和失败数量。
- 自动识别 AI 笔记对应的原始网课视频链接。
- 点击导入笔记中的时间戳，直接打开原视频并跳转到对应位置。
- 视频页面关闭或刷新后，仍可再次通过笔记时间戳定位播放位置。
- 支持重新同步已经导入的笔记；可选择增量同步或覆盖插件管理区域。
- 可下载在线笔记中的图片到 Vault，也可保留原始网络图片地址。
- 导入后的 Markdown 笔记可配合 Media Extended，继续观看视频、补充内容和制作新的时间戳笔记。

## 使用前准备

1. 使用 Obsidian Windows 桌面版。
2. 在“设置 → 核心插件”中启用“网页浏览器”（Web Viewer）。
3. 确保你有权访问需要导入的百度网盘 AI 笔记及其原视频。

Media Extended 不是必需依赖。只有在你希望继续使用 Media Extended 的视频笔记工作流时才需要安装。

## 导入单篇笔记

1. 在 Obsidian 的网页浏览器中打开百度网盘在线 AI 笔记。通常可以从百度网盘的 AI 笔记文件夹进入该页面。
2. 等待页面中的笔记正文加载完成。
3. 点击 Obsidian 左侧功能区的“导入或同步百度 AI 笔记”按钮。
4. 爬取前选择已有文件夹或输入新路径创建文件夹，插件会将 Markdown 保存到所选目录。下载的图片自动保存在该目录的 `attachments` 子目录。
5. 如果已在设置中关闭“导入前询问保存文件夹”，插件会直接使用固定保存文件夹。

如果当前激活的是一篇已经由本插件管理的本地笔记，同一个按钮会执行同步，而不是重复导入。

## 批量导入

1. 在 Obsidian 网页浏览器中分别打开多篇百度网盘 AI 笔记，使这些页面同时保持为已打开状态。
2. 点击左侧功能区的“批量导入所有已打开的百度 AI 笔记”按钮。
3. 开启询问时，批量导入前只选择一次保存文件夹；整批笔记使用同一目录。关闭询问时直接使用固定文件夹。
4. 插件会逐篇处理，并在完成后显示成功、跳过和失败的数量。

同一篇在线笔记已经导入时，插件会根据页面标识查找本地文件并跳过重复创建。

## 时间戳与原视频跳转

导入时，插件会尝试取得与在线 AI 笔记对应的百度网盘原视频地址，并将时间戳转换为指向原视频的 Markdown 链接。

点击时间戳后，插件会：

1. 查找已经打开的对应原视频页面；
2. 如果没有找到，则在 Obsidian 网页浏览器中打开保存的原视频地址；
3. 等待播放器加载，然后跳转到指定时间。

因此，使用时间戳前不需要预先打开 AI 笔记页面。能否直接播放仍取决于该百度网盘链接当时的访问权限、有效性以及网页浏览器中的会话状态。

## 与 Media Extended 配合

本插件不会调用 Media Extended 的内部接口，也不要求安装 Media Extended。它提供的是兼容工作流：先把 AI 生成的内容和原视频时间信息保存为普通 Markdown，再使用 Media Extended 继续观看和编辑视频笔记。

由于 Media Extended 和百度网盘页面都可能更新，具体交互以各自当前版本为准。如果联动行为发生变化，请在反馈问题时附上 Obsidian、Media Extended 和本插件的版本号。

## 同步与内容保护

插件只会自动替换导入笔记中由以下标记包围的管理区域：

```text
<!-- BAIDU_AI_NOTE_START -->
...
<!-- BAIDU_AI_NOTE_END -->
```

- 增量同步：保留已有章节及其中的修改，只补充远端新增的标题章节。
- 覆盖同步：替换插件管理区域，但保留管理区域以外的用户内容。
- 如果管理标记缺失，插件会停止同步，避免误覆盖整篇笔记。

建议重要笔记继续使用 Vault 备份或版本控制。

## 设置

- 导入前询问保存文件夹：默认开启，单篇或批量导入前选择一次；取消后不爬取笔记
- 固定保存文件夹：仅关闭询问后显示，支持选择已有目录或新建目录
- 图片随笔记保存：自动使用笔记所在目录的 `attachments` 子目录，无需单独设置
- 是否自动下载图片
- 同步策略：增量同步或覆盖管理区域
- 导入后是否打开原视频
- 原视频打开位置：当前页或右侧分栏

## 网络访问与隐私

插件的联网行为与导入功能直接相关：

- 读取你在 Obsidian 网页浏览器中主动打开的 `pan.baidu.com` AI 笔记页面内容。
- 打开 `pan.baidu.com` 的原视频页面并控制本地网页播放器跳转。
- 启用“自动下载图片”时，从笔记图片的原始网络地址下载图片到你的 Vault；图片可能由百度或页面引用的 CDN 提供。

插件会在本地保存：

为识别已经导入或移动到其他文件夹的笔记，插件会枚举 Vault 内的 Markdown 文件并检查缓存的来源属性；同步时读取和更新选中的受管理笔记。这是审核中“Vault Enumeration”提示所对应的行为。

- 导入笔记的来源页面地址、原视频地址、页面标识和导入时间，写入对应 Markdown 文件的 YAML 属性。
- AI 笔记页面与原视频地址的对应关系，以及插件设置，写入插件目录的 `data.json`。

插件代码中没有遥测、广告、分析统计、自建服务器或将 Vault 内容上传到第三方的逻辑，也不会读取或保存你的百度账号密码。登录和会话由百度网盘页面及 Obsidian 网页浏览器管理。

## 兼容性与已知限制

- 已确认：Obsidian Windows 桌面版。
- 未确认：macOS、Linux、Android、iOS。
- 因使用桌面端 Web Viewer 的 `webview` 能力，`manifest.json` 中声明为仅桌面端插件。
- 百度网盘网页结构或播放器实现变化后，页面识别、视频地址获取或时间跳转可能需要适配。
- 插件只能处理当前已加载、且当前用户有权访问的页面内容。

## 手动安装

将以下文件复制到 Vault 的 `.obsidian/plugins/baidu-ai-notes/` 目录：

- `main.js`
- `manifest.json`
- `styles.css`

然后重启 Obsidian，或重新加载插件，并在“设置 → 第三方插件”中启用 Netdisk AI Notes Importer。

升级时不要覆盖 `data.json`，其中保存着你的本地设置和部分页面—视频对应关系。

## 非官方声明

本插件是独立的非官方社区项目，与百度、百度网盘及 Media Extended 的开发者不存在隶属、授权或合作关系。“百度”“百度网盘”和“Media Extended”仅用于说明兼容对象。请勿使用相关第三方的 Logo 作为本插件图标。

## 许可证

[MIT License](LICENSE)

## 0.7.1 升级说明

作者：不要黑眼圈。插件 ID 继续使用 `baidu-ai-notes`。

新安装的默认笔记目录为 `Netdisk AI Notes Importer`，默认图片目录为 `Netdisk AI Notes Importer/attachments`。升级时旧默认路径设置会自动改为新名称，自定义路径和根目录设置保持不变。已有文件不会自动移动，旧图片链接仍指向原位置。

源码与构建说明见 [DEVELOPMENT.md](DEVELOPMENT.md)。第三方库及其许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
