# Quick Translate · Local Codex

[简体中文](README.zh-CN.md) · [Download](https://github.com/ggghhh16/codex-quick-translator/releases/latest) · [Privacy](PRIVACY.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md)

Select text on a webpage and choose **Quick Translate**, or press `Alt+Shift+T`. A dark floating panel shows the translation, explanation and page context in your chosen target language. Drag the title bar or resize from any corner. Click the flag to append the result, original text and an explicit source URL to a local Markdown file.

## Features

- Translate from the selection context menu or with `Alt+Shift+T`. Stream translation, explanation and page context in separate sections.
- Move the dark floating panel by its title bar and resize it from any of its four corners.
- Choose the target language, model, reasoning effort, fast service and a complete local Markdown destination in the panel or settings.
- Save the original passage, result, page title and source URL once per translation per file. Stop, retry, copy or close the panel with Esc.
- Use separate temporary model sessions for different pages and selections.

## Languages

Set **Target language** in the toolbar settings or floating panel's gear menu. The picker includes over 150 languages, plus custom language codes such as `sr-Latn-RS`. Translation, explanation, context and section headings all use the selected language. Support and quality depend on the model; inclusion is not a guarantee of translation quality for every language.

New installations follow Chrome's language by default. Existing installations retain Simplified Chinese until changed. Floating-panel labels and settings follow the target language and update immediately after saving, including panels already open in other tabs. The toolbar settings page and context menu follow Chrome. Available interface languages: English, Simplified Chinese, Traditional Chinese, Spanish, French, German, Japanese, Korean, Arabic and Brazilian Portuguese are included; other panel languages fall back to English while model output keeps the selected target language. Arabic and other right-to-left output use the appropriate text direction. Note metadata uses an included locale or English fallback; every note records its actual target language.

The implementation uses Chrome's standard `_locales`, `default_locale`, manifest message substitutions and `chrome.i18n.getMessage`. See [Chrome i18n documentation](https://developer.chrome.com/docs/extensions/reference/api/i18n).

## Requirements and installation

Currently **Windows only**. You need Chrome, Node.js 20+ and an installed, signed-in Codex with model access. Translation uses your configured cloud model provider and may consume service quota. It is not offline translation and no free model quota is included.

1. Download the full `codex-quick-translator-1.3.1.zip` companion/source package from Releases and extract it to a permanent directory.
2. For an unpacked installation, run `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1` from that directory. Open `chrome://extensions`, enable Developer mode, then load the `extension` folder.
3. For a Web Store installation, open the extension's settings/help section and run its displayed installation command from the companion directory. It includes `-ExtensionId` for your store installation. Do not load a second unpacked extension.
4. Open settings, confirm the connection, choose a target language and set an absolute local `.md` path. Select text on an ordinary webpage and use **Quick Translate**.

The installer registers `com.local.codex_quick_translator` under the current user's Chrome Native Messaging registry key, allowing only the configured extension ID. It copies Node into `.local/runtime` so a changing Codex temporary runtime path does not break startup. It prefers a newer official local Codex installation over an older CLI on `PATH`; `-CodexPath` pins an explicit executable. Installation does not alter an existing ChatGPT Chrome extension or its native-host settings. The initial note destination is `notes/translations.md` inside the project.

To choose executables explicitly:

```powershell
.\scripts\install.ps1 -NodePath 'C:\Program Files\nodejs\node.exe' -CodexPath 'C:\path\to\codex.exe'
```

Upgrade both the extension and companion to **1.3.0 or later** for target-language support. Extract the new companion into the existing installation directory to retain `.local` preferences; if its location or extension ID changes, rerun the installer. Reload the unpacked extension and refresh webpages. The store ZIP is for the Chrome developer dashboard and contains only browser files.

Uninstall the local registration with `scripts/uninstall.ps1`, then remove the extension. Notes are retained. GitHub releases and prepared store materials do not establish whether Google has approved the store listing.

## Models and privacy

The default remains GPT-6 Luna, low reasoning effort and fast service (advertised as 1.5×). Model availability and supported reasoning levels depend on your Codex installation. Speed and reasoning are independent, and actual latency varies.

Reasoning effort shows only levels supported by the current model. Changing models retains the previous level if supported and otherwise selects the new model's lowest level. The fast toggle changes only the service tier; it does not alter reasoning effort. Advertised speed multipliers are service labels, not per-request latency guarantees, and fast service may consume more quota. The panel shows the actual model, effort and service tier returned for each translation. Settings changes affect the next request. The extension checks these returned values instead of silently substituting another model. See the five-round [benchmark](BENCHMARK.md) and its limits.

Only an explicit translation reads the selection and bounded page context. Data goes through the local companion to your Codex model provider. There are no extension analytics or developer collection servers. Source links remove credentials, fragments and non-allowlisted query parameters. Model output is rendered as text and escaped before Markdown export. See [Privacy](PRIVACY.md) and [security implementation](SECURITY.md).

The requested context can contain up to 12,000 selected characters, 5,000 nearby characters, the page title and URL, and up to 16,000 characters of main page content. The extension favors `article` and `main` and tries to omit navigation, footers and hidden text. Long or dynamically loaded pages provide only a limited excerpt of rendered content. It requests `activeTab`, `scripting`, `contextMenus` and `nativeMessaging`, without persistent all-sites access. Model tool use and inherited integrations are disabled; explicit note saving is performed by the local companion. The destination must be an absolute local `.md` path; symlinks and multiply linked targets are rejected. Saved links show their source explicitly.

Chrome internal pages, the Web Store, the built-in PDF viewer and some cross-origin frames cannot show the panel. Currently only the Windows native companion is supported.

## Development

Runtime code needs no npm packages. Useful commands:

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

`native-smoke` needs an installed `.local/host-config.json`. It tests real Japanese, Arabic and English output, persistence, source attribution and deduplication in an isolated directory and consumes model quota. `i18n-browser.cjs` requires Playwright and installed Chrome; it checks production UI with mocked extension transport and replayed real model results. It does not replace an installed-extension end-to-end test. `probe` and the native host use the same runtime selection logic. `check-host` reads model and settings information without changing them. `benchmark` runs five rounds of public material and writes timings and output to `.dev/benchmark.json`, consuming quota. `node scripts/preview.cjs` serves a temporary interface test page on `127.0.0.1` using smoke-test replay material and closes after 30 minutes. See [validation details](VALIDATION.md).

## Repository layout

| Directory | Purpose |
| --- | --- |
| `extension/` | Chrome extension, context menu, panel and settings |
| `native/` | Native Messaging protocol, Codex App Server calls and Markdown appends |
| `scripts/` | Installation, removal, checks, preview and packaging |
| `tests/` | Automated tests and UI test page |
| `.local/` | Unpackaged local settings, runtime and isolated workspace |
| `.dev/` | Unpackaged test results and temporary files |
| `notes/` | Unpackaged default notes directory |

This independent project is not affiliated with OpenAI or Google.
