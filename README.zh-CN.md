# 快速翻译 · Local Codex

[English](README.md) · Chrome Manifest V3 插件，连接本机已登录的 Codex App Server。选择网页文字，右键 **快速翻译**，在选择位置旁显示所选目标语言的翻译、解释和网页语境。

默认 **GPT-6 Luna + low + 快速模式（标称 1.5×）**。[下载发布包](https://github.com/ggghhh16/codex-quick-translator/releases/latest) · [安全与隐私](SECURITY.md) · [更新记录](CHANGELOG.md)

独立开发，与 OpenAI 或 Google 无官方隶属关系。[隐私政策](PRIVACY.zh-CN.md)。Chrome 商店发布准备材料见 [store/LISTING.zh-CN.md](store/LISTING.zh-CN.md)；材料齐备不代表已经上架。

## 已实现

- 右键「快速翻译」；快捷键 `Alt+Shift+T`。
- 深色 Notion 风格、圆角悬浮窗，标题栏拖动，**四个角都可以调整大小**。
- 流式显示「翻译」「解释」「语境」，三个区块及标题统一使用所选目标语言。
- 齿轮设置：目标语言、模型、独立思考强度、闪电快速模式、完整 Markdown 文件路径；包含 GPT-6 Sol 和 GPT-6 Luna。
- 齿轮左侧的帆布旗帜图标：追加保存原文、翻译、解释、语境、网页标题与来源 URL；同一次翻译在同一文件中只保存一次。
- 停止、重新翻译、复制、Esc 关闭；不同网页和不同选择使用独立临时模型会话。

## 目标语言与界面语言

- 在浮窗齿轮或扩展设置页选择目标语言；提供 150 多种语言选项，也允许填写其他语言或地区代码，例如 `fil`、`sr-Latn-RS`。实际翻译支持与质量取决于模型，不保证所有语言同等准确。
- 新安装默认“跟随浏览器语言”；已有用户保留原先的简体中文，可随时修改。GPT-6 Luna + low + 快速服务的默认组合不变。
- 翻译、解释、语境说明及其标题使用目标语言；浮窗按钮与设置界面也跟随目标语言，保存后立即更新已打开的浮窗。工具栏设置页与右键菜单仍跟随 Chrome。
- 按 [Chrome i18n 文档](https://developer.chrome.com/docs/extensions/reference/api/i18n) 使用 `_locales`、`default_locale`、`__MSG_*__` 和 `chrome.i18n.getMessage`，包含简体中文、繁体中文、英语、西班牙语、法语、德语、日语、韩语、阿拉伯语、巴西葡萄牙语。尚未提供的浮窗界面语言回退英文，模型输出仍使用所选目标语言。
- 阿拉伯语等从右向左书写的语言独立设置排版方向。Markdown 保存本次实际目标语言及明确的来源网址；元信息标签在支持的界面语言中本地化，其余回退英文。
- 扩展与本地连接程序都需要更新至 1.3.0 或以上。只更新浏览器扩展时会提示更新连接程序，避免所选语言被旧程序忽略。旧安装目录原位覆盖新版完整包即可保留 `.local` 设置；目录或扩展 ID 改变则重新运行安装脚本。

## Windows 安装

需要 Chrome、已安装并登录的 Codex，以及 Node.js 20+。安装脚本也会检测 Codex 随附的 Node。

1. 解压完整项目到一个固定目录。不要只复制 `extension`，本地通信代码也需要保留。
2. 在项目目录打开 PowerShell，运行：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1
   ```

3. 在 Chrome 打开 `chrome://extensions`，开启「开发者模式」，点击「加载已解压的扩展程序」，选择项目的 **extension** 目录。
4. 点击扩展图标，确认「本地 Codex 已连接」，设置你的 `.md` 文件路径。
5. 在普通网页上选择文字，右键「快速翻译」。

安装脚本会注册当前用户下的 `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.local.codex_quick_translator`，仅允许本扩展的固定 ID 连接。它将 Node 复制到项目 `.local/runtime`，避免 Codex 临时运行时目录更新导致 Node 路径失效。本地主机比较本机官方 Codex 安装目录中的版本，优先使用较新版本，避免 PATH 指向旧 CLI 导致新模型不可用。安装时显式指定 `-CodexPath` 则固定使用该路径。

安装不会修改现有 ChatGPT Chrome 扩展或其本地主机配置。首次安装默认收藏文件为项目内的 `notes/translations.md`。更换项目位置后需要重新运行安装脚本，并重新加载 Chrome 扩展。

也可以指定程序路径：

```powershell
.\scripts\install.ps1 -NodePath 'C:\Program Files\nodejs\node.exe' -CodexPath 'C:\path\to\codex.exe'
```

卸载本地主机：运行 `scripts/uninstall.ps1`；随后在 Chrome 扩展页面移除插件。笔记文件保留。

商店版使用说明：如果从 Chrome 商店安装，打开扩展设置中的“本地连接与隐私”，下载本地连接程序并运行页面显示的命令，其中 `-ExtensionId` 是商店版当前 ID。只允许该 ID 访问本地主机；不要再额外加载另一个本地扩展。未提供该参数时，安装脚本默认使用源码版公钥所对应的 ID。

## 快速模式的实际含义

这里连接的是 **本地 Codex 的已登录会话**，模型推理仍由 Codex 配置的云端模型服务执行，不是离线模型，也不自动操作 ChatGPT 网页。

从 v1.1 开始，思考强度与快速服务完全独立：

1. **思考强度**：单独下拉选择，仅展示当前模型声明支持的值。首次安装默认 GPT-6 Luna 的 `low`；切换模型时保留仍受支持的强度，否则改为新模型的最低可用值。
2. **⚡ 快速模式**：只切换 `priority`/`fast` 与标准服务，开启或关闭都不会改变思考强度。GPT-6 Sol/Luna 本地目录标称 1.5×；其他模型按目录显示，例如 Astra 为 2×。倍率是服务标称值，不是每次请求耗时保证，可能增加额度消耗。

旧配置升级时保留原来实际生效的思考强度和收藏路径。模型列表优先读取并刷新本地目录；补充 GPT-6 Sol/Luna 目录遗漏选项。每次翻译检查服务端返回的模型、强度和服务层级，禁止静默更换模型。当前本地 Codex 对 Sol/Luna 返回的最低强度是 `low`，因此不提供 API 文档中的 `none`。

底部显示本次翻译实际使用的参数，设置修改只影响下一次翻译。2026-09-25 的五轮实测推荐 **GPT-6 Luna + low + 快速模式**，详细数据及限制见 [BENCHMARK.md](BENCHMARK.md)。已保存的模型选择不会被测速自动修改。

升级已有解压安装时，在 `chrome://extensions` 对「快速翻译」点击重新加载，然后刷新使用浮窗的网页。不需要重新注册本地主机。

官方依据：[Codex App Server](https://learn.chatgpt.com/docs/app-server)、[Fast mode](https://learn.chatgpt.com/docs/agent-configuration/speed)、[Reasoning models](https://developers.openai.com/api/docs/guides/reasoning)。

## 页面内容与权限

- 只有点击翻译时才读取页面；不请求所有网站的常驻访问权限。
- 使用 `activeTab`、`scripting`、`contextMenus`、`nativeMessaging`，无远程脚本、无本地 HTTP 服务依赖、无 API Key 存入扩展。
- 模型输入包含选中文字（最多 12,000 字符）、附近段落（最多 5,000 字符）、标题、URL、页面主要正文（最多 16,000 字符）。优先读取 `article`、`main`；导航、页脚、隐藏元素尽量排除。
- 长页面提供的是有限的正文摘录，未读取到的信息不能可靠推断；受虚拟滚动、登录后动态加载影响的内容只包含已呈现部分。
- 模型生成禁止调用工具；继承的 MCP、插件、应用、命令执行、hooks、网络搜索和项目指令被关闭。模型权限为专用受限只读配置，写笔记由本地主机的明确收藏操作执行。
- 仅保存本地主机持有的完整翻译记录，不接受网页指定的任意保存内容。目标必须是本地磁盘上的绝对 `.md` 路径，拒绝符号链接和多重硬链接目标。
- 翻译窗口使用封闭 Shadow DOM，模型内容作为纯文本渲染，不执行模型生成的 HTML。
- 每条收藏明确注明“来源网页”和可点击的“来源网址”。网址删除账号密码和片段，仅保留常见资源编号查询参数；完整隐私行为见 [SECURITY.md](SECURITY.md)。
- Chrome 内置页面、扩展商店及内置 PDF 阅读器通常不能注入脚本；跨域 iframe 因 `activeTab` 范围限制可能不可用。请在普通网页正文使用。
- 商店提交与审核状态以开发者后台为准；GitHub Release 不代表商店已上架。

## 开发与验证

运行时代码只用浏览器 API 与 Node 标准库，无 npm 安装步骤。

```powershell
node --test tests/*.test.cjs
python -m unittest discover -s tests -p '*_test.py'
node scripts/probe.cjs --translate
node scripts/native-smoke.cjs
node tests/i18n-browser.cjs
node scripts/check-host.cjs
node scripts/benchmark.cjs
python scripts/package.py
python scripts/check-publication.py --index --zip dist/codex-quick-translator-1.3.1.zip
python scripts/package-store.py
```

`i18n-browser.cjs` 需要开发环境提供 Playwright 和已安装的 Chrome；使用生产 UI、模拟通信和真实模型结果重放验证三种界面语言。

`probe` 和本地主机使用同一运行时选择逻辑。`check-host` 只读检查模型和设置。`benchmark` 顺序运行五轮公开翻译材料，保存每次首字耗时、完整耗时、输出文本及汇总到 `.dev/benchmark.json`，会消耗模型额度。`native-smoke` 需要安装生成的 `.local/host-config.json`；它在 `.dev/smoke-*` 独立目录通过标准输入输出测试本地主机、翻译与收藏，不改动正式偏好或笔记。这些测试不能代替安装后的 Chrome 联调。

`node scripts/preview.cjs` 会开启临时、只绑定 `127.0.0.1` 的界面测试页，需要先运行 smoke 测试生成重放素材。测试页重放真实结果、模拟扩展通信，并将测试页 Shadow DOM 设为可检查状态；它不是生产扩展或真实右键菜单测试。30 分钟后自动关闭。

验证详情见 [VALIDATION.md](VALIDATION.md)。

## 代码结构

| 目录 | 用途 |
| --- | --- |
| `extension/` | Chrome 扩展、右键菜单、页面浮窗和设置 |
| `native/` | Chrome 消息协议、Codex App Server 调用、Markdown 追加保存 |
| `scripts/` | 安装、卸载、连通测试、预览与打包 |
| `tests/` | 自动测试、界面验证页 |
| `.local/` | 仅本机配置、运行时和隔离的工作目录，不打包 |
| `.dev/` | 测试结果与开发临时文件，不打包 |
| `notes/` | 默认收藏文件目录，不打包 |
