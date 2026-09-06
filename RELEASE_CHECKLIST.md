# 首次公开发布清单

## 发布前必须确认

- [x] 作者和 LICENSE 署名：不要黑眼圈。
- [x] 显示名称：Netdisk AI Notes Importer；插件 ID 保留 baidu-ai-notes。
- [ ] 确认 `0.7.1` 是否作为首次公开版本；如调整版本，同时更新 `manifest.json`、`package.json` 和 `versions.json`。
- [ ] 在准备提交所使用的最低 Obsidian 版本上重新完成一次 Windows 实机测试。
- [ ] 确认 README 中的 Media Extended 工作流与计划公开支持的版本一致。
- [x] 提供从现有实现拆分的 JavaScript 源码、构建脚本及兼容性回归测试。

## 本地检查

```bash
node scripts/build.mjs
node scripts/verify-release.mjs
node scripts/test.mjs
```

## GitHub Release

1. 创建公开 GitHub 仓库，将本目录内容放在仓库根目录。
2. 创建与 `manifest.json` 中 `version` 完全一致的标签和 Release，例如 `0.7.1`，不要添加 `v` 前缀。
3. 将 `main.js`、`manifest.json`、`styles.css` 作为三个独立的 Release 附件上传；不要只依赖 GitHub 自动生成的源码压缩包。
4. 检查仓库根目录可以直接访问 `README.md`、`LICENSE`、`manifest.json` 和 `versions.json`。

## Obsidian Community Plugins 提交

1. 发布 GitHub Release 后，按照 Obsidian 当前官方提交入口登录并绑定 GitHub 账号。
2. 提交公开仓库地址，确认插件 ID 为 `baidu-ai-notes`。
3. 按审核意见修改代码或说明；发布文件、仓库根目录清单和版本号必须保持一致。

## 手动安装或升级

只复制以下三个文件到 `.obsidian/plugins/baidu-ai-notes/`：

- `main.js`
- `manifest.json`
- `styles.css`

不要复制或覆盖 `data.json`。
