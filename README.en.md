# Quick Translate · Local Codex

[中文](README.md) · [Download](https://github.com/ggghhh16/codex-quick-translator/releases/latest) · [Privacy](PRIVACY.en.md)

Select text on a webpage and choose **Quick Translate**, or press `Alt+Shift+T`. A dark floating panel shows the translation, explanation and page context in your chosen target language. Drag the title bar or resize from any corner. Click the flag to append the result, original text and an explicit source URL to a local Markdown file.

## Languages

Set **Target language** in the toolbar settings or floating panel's gear menu. The picker includes over 150 languages, plus custom language codes such as `sr-Latn-RS`. Translation, explanation, context and section headings all use the selected language. Support and quality depend on the model; inclusion is not a guarantee of translation quality for every language.

New installations follow Chrome's language by default. Existing installations retain Simplified Chinese until changed. The interface follows Chrome independently: English, Simplified Chinese, Traditional Chinese, Spanish, French, German, Japanese, Korean, Arabic and Brazilian Portuguese are included; other interface languages fall back to English. Arabic and other right-to-left output use the appropriate text direction. Note metadata uses an included locale or English fallback; every note records its actual target language.

The implementation uses Chrome's standard `_locales`, `default_locale`, manifest message substitutions and `chrome.i18n.getMessage`. See [Chrome i18n documentation](https://developer.chrome.com/docs/extensions/reference/api/i18n).

## Requirements and installation

Currently **Windows only**. You need Chrome, Node.js 20+ and an installed, signed-in Codex with model access. Translation uses your configured cloud model provider and may consume service quota. It is not offline translation and no free model quota is included.

1. Download the full `codex-quick-translator-1.3.0.zip` companion/source package from Releases and extract it to a permanent directory.
2. For an unpacked installation, run `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1` from that directory. Open `chrome://extensions`, enable Developer mode, then load the `extension` folder.
3. For a Web Store installation, open the extension's settings/help section and run its displayed installation command from the companion directory. It includes `-ExtensionId` for your store installation. Do not load a second unpacked extension.
4. Open settings, confirm the connection, choose a target language and set an absolute local `.md` path.

Upgrade both the extension and companion to **1.3.0 or later** for target-language support. Extract the new companion into the existing installation directory to retain `.local` preferences; if its location or extension ID changes, rerun the installer. Reload the unpacked extension and refresh webpages. The store ZIP is for the Chrome developer dashboard and contains only browser files.

Uninstall the local registration with `scripts/uninstall.ps1`, then remove the extension. Notes are retained. GitHub releases and prepared store materials do not establish whether Google has approved the store listing.

## Models and privacy

The default remains GPT-6 Luna, low reasoning effort and fast service (advertised as 1.5×). Model availability and supported reasoning levels depend on your Codex installation. Speed and reasoning are independent, and actual latency varies.

Only an explicit translation reads the selection and bounded page context. Data goes through the local companion to your Codex model provider. There are no extension analytics or developer collection servers. Source links remove credentials, fragments and non-allowlisted query parameters. Model output is rendered as text and escaped before Markdown export. See [Privacy](PRIVACY.en.md) and [security implementation](SECURITY.md).

Chrome internal pages, the Web Store, the built-in PDF viewer and some cross-origin frames cannot show the panel. Currently only the Windows native companion is supported.

## Development

Runtime code needs no npm packages. Run `node --test tests/*.test.cjs` and `python -m unittest discover -s tests -p '*_test.py'`. After local installation, `node scripts/native-smoke.cjs` tests real Japanese, Arabic and English output, persistence, source attribution and deduplication in an isolated test directory; it consumes model quota. `node tests/i18n-browser.cjs` requires Playwright and installed Chrome, and verifies production UI with mocked transport and recorded model results. It does not replace an installed-extension end-to-end test.

This independent project is not affiliated with OpenAI or Google.
