# Chrome Web Store submission checklist

1. Upload `dist/codex-quick-translator-store-1.3.1.zip`. Its root contains `manifest.json`, and the archive contains browser code and icons only. Do not upload the full source ZIP with the native companion as the store package.
2. Record the Item ID after creating the listing. Store settings display an installation command for the runtime extension ID, and the companion installer accepts `-ExtensionId`. The source development public key is omitted from the store ZIP.
3. Use `LISTING.en.md` and `LISTING.zh-CN.md` for the respective English and Chinese descriptions, single-purpose statements, permission justifications and privacy disclosures. Use `REVIEWER.md` for test instructions.
4. Upload `images/screenshot-translation.png` and `images/screenshot-settings.png` (1280×800), plus `images/promo-440x280.png`. The extension icon is `extension/icons/icon-128.png`.
5. Confirm that the privacy policy and companion download link are public. Before the first store release, the GitHub Release companion must support target languages and `-ExtensionId` (v1.3.0 or later).
6. Provide the developer contact, verification and distribution details requested in the dashboard, using accurate owner information. Then submit for review. Publication depends on Google's review outcome.

Screenshots replay real Codex translations through production `content.js`, using a sample article and generic note path. They are labeled as example replays and do not establish latency results or an installed end-to-end test.

## Local build and checks

`python scripts/package-store.py` builds and checks the store archive. `python scripts/package.py` builds the companion/source archive. Both use explicit release file lists and scan for credentials and local residue. The store archive excludes the native host, scripts, notes and test materials.

The icon and promotional image source files are `icon.svg` and `scripts/build-store-assets.cjs`. Regenerating them requires the development tool `sharp`; the production extension and native companion have no npm dependency installation step.
