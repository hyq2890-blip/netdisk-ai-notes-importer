# 第三方组件

vendor/ 保留原 main.js 中内嵌的 Turndown 7.2.4 和 turndown-plugin-gfm 1.0.2 实现。本次未升级这些组件。

- [Turndown 7.2.4 许可证](https://raw.githubusercontent.com/mixmark-io/turndown/v7.2.4/LICENSE)
- [turndown-plugin-gfm 上游许可证](https://raw.githubusercontent.com/mixmark-io/turndown-plugin-gfm/master/LICENSE)

二者上游许可证均为 MIT，Copyright (c) 2017 Dom Christie；完整条款见 [vendor/LICENSE](vendor/LICENSE)，构建时也会写入 main.js，以便安装包保留声明。GFM 的 v1.0.2 标签许可证未能直接读取，此处依据上游当前许可证补充。
