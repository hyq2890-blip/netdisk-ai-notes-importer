# 开发说明

本工程从用户现有的 0.7.0 main.js 整理而来。原始 TypeScript 文件未找到，因此这里提供可编辑的 JavaScript 源码，不宣称恢复了原始类型或工程历史。

## 文件结构

- src/bootstrap.js：CommonJS 导出与共享依赖。
- src/converter.js：HTML 转 Markdown、图片下载与格式转换。
- src/editor-timestamps.js：编辑器时间戳交互。
- src/settings.js：设置界面。
- src/defaults.js：默认目录及设置。
- src/webview.js：百度网盘页面识别、视频打开和播放定位。
- src/main.js：插件生命周期、导入、同步、配置迁移。
- vendor/：原 main.js 内嵌的 Turndown 7.2.4 和 turndown-plugin-gfm 1.0.2，保持原有实现。
- scripts/build.mjs：按固定顺序组合共享作用域中的源码并校验语法。

这些源码片段在同一个作用域中运行，不能独立加载。调整声明或调用时，应检查其他片段的引用。此构建方式保留现有逻辑，之后可以逐步改成独立模块。

## 构建和验证

需要 Node.js 18 或以上，无需下载依赖。

```sh
node scripts/build.mjs
node scripts/verify-release.mjs
node scripts/test.mjs
```

也可使用 npm run build、npm run check、npm test。main.js 是构建产物，后续请编辑 src/ 再构建。

本地测试覆盖旧默认目录迁移、自定义及空目录保留、链接映射保留、时间解析和同步保护。它不替代 Windows 中实际导入、播放、刷新及 Media Extended 联动测试。

## 兼容标识

插件 ID baidu-ai-notes、命令 ID、baidu-ai-note 属性、旧 CSS 类及 BAIDU_AI_NOTE 标记仍保留，避免已有笔记和快捷键失效。产品显示名称、日志和默认目录使用 Netdisk AI Notes Importer。旧英文名称仅保留在迁移匹配和兼容测试中。

旧默认目录设置自动迁移，但不移动既有笔记或图片。自定义目录保持原值；导入去重仍扫描整个 Vault。

## 发布前补充

当前 LICENSE 延续 MIT 方案，署名按用户指定为“不要黑眼圈”。第三方库 MIT 许可证已补充到 vendor/LICENSE，并由构建脚本写入 main.js。来源详见 THIRD_PARTY_NOTICES.md。
