# 提交清单

1. 上传 `dist/codex-quick-translator-store-1.2.1.zip`，其中 `manifest.json` 在 ZIP 根目录，仅包含浏览器代码和图标。不要上传含本机连接程序的完整源码 ZIP。
2. 商店条目创建后记录 Item ID。商店版设置页会按运行时 ID 给出安装命令，本机连接程序安装时支持 `-ExtensionId`。源码中的开发公钥不放入商店 ZIP。
3. 使用 `LISTING.zh-CN.md` 填写介绍、单一用途、权限说明和隐私信息；使用 `REVIEWER.md` 填写测试说明。
4. 上传 `images/screenshot-translation.png`、`images/screenshot-settings.png`（1280×800），以及 `images/promo-440x280.png`。扩展图标位于 `extension/icons/icon-128.png`。
5. 确认隐私政策与本地连接程序下载链接公开可用。首次发布前，本机连接程序 GitHub Release 必须包含支持 `-ExtensionId` 的 v1.2.1 或更新版本。
6. 完成后台要求的开发者联系信息、验证和分发信息，按真实主体身份填写。随后提交审核；最终上线取决于 Google 审核结果。

截图由生产 `content.js` 展示真实 Codex 翻译结果的重放生成，使用示例文章和通用笔记路径，没有私人网页内容。截图已标明示例重放，不作为延迟成绩或安装后端到端测试证据。

## 本地生成与验证

`python scripts/package-store.py` 构建并检查商店包。`python scripts/package.py` 构建本地连接程序源码包。两者都从明确的发布清单取文件，并检查凭据及本地残留。商店包不包含本地主机、脚本、笔记或测试材料。

图标/宣传图的代码源文件为 `icon.svg` 和 `scripts/build-store-assets.cjs`，重新生成时需要开发工具 `sharp`；生产扩展与本地主机不需要安装任何 npm 依赖。
