# 更新日志

本项目遵循 [Semantic Versioning](https://semver.org/)。

## 0.8.1 - 2026-09-12

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

## 0.7.2 - 2026-09-07

- 修正市场简介：移除冗余的 Obsidian 字样，采用以英文句号结尾的英文功能描述。
- 保留中文教程，补充英文介绍、Installation、Usage 和网络隐私说明。
- 说明去重扫描 Vault 内 Markdown 文件缓存属性的用途。
- 加强发布检查，防止简介格式问题再次出现；功能代码与 0.7.1 保持一致。

## 0.7.1 - 2026-09-06

- 显示名称更新为 Netdisk AI Notes Importer，作者更新为“不要黑眼圈”。
- 更新默认笔记与图片目录，并自动迁移旧默认路径设置；保留自定义路径，不移动既有文件。
- 更新设置占位提示、日志和插件名称提示；保留旧笔记与命令兼容标识。
- 从原打包文件整理可编辑 JavaScript 源码，新增无需下载依赖的构建及回归验证脚本。
- 补充第三方库许可证。

## 0.7.0 — 既有版本功能记录

以下为根据现有代码整理的功能清单，不代表各功能首次引入的版本日期。

### 新增

- 从 Obsidian 网页浏览器导入百度网盘 AI 笔记并转换为 Markdown。
- 批量导入所有已打开的 AI 笔记页面，并统计成功、跳过和失败数量。
- 自动识别并保存原视频地址，支持 Markdown 阅读视图和编辑视图中的时间戳跳转。
- 关闭或刷新视频页面后重新打开原视频并定位到目标时间。
- 下载在线图片到 Vault，或保留原始网络图片地址。
- 已导入笔记的增量同步与覆盖同步。
- 为导入笔记提供独立阅读样式。
- 提供可继续配合 Media Extended 使用的 Markdown 视频笔记工作流。

### 兼容性

- 当前仅确认支持 Obsidian Windows 桌面版。
- 依赖 Obsidian 核心插件“网页浏览器”（Web Viewer）。
