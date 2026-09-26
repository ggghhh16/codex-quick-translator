# Changelog

## 1.3.1 — 2026-09-25

- Fixed floating-panel buttons, settings and messages continuing to follow Chrome's language after saving a different target language. The panel now uses the target language, with English as the fallback when its interface translation is unavailable.
- The panel reads saved language settings when opened. Saving from either the panel or toolbar settings immediately updates all open panels.
- Reasoning options, speed descriptions, button hints and text direction update together. Existing translation text and saved note metadata keep their original language; changing settings does not start another translation.
- Added regression checks for switching to an English panel in Chinese Chrome, synchronization across pages, reopening and language fallback.

## 1.3.0 — 2026-09-25

- Added a target-language picker with a broad language list and custom language codes. Translation, explanation, context and headings follow the selected language.
- New installations follow Chrome's language; migrated settings retain Simplified Chinese. Default model, reasoning effort and speed remain unchanged.
- Added ten Chrome i18n interface languages, English fallback, right-to-left layout and localized error messages.
- Set the target language in both Codex base and developer instructions after live tests showed that a base instruction alone could still return Chinese.
- Markdown notes retain the language actually used and the source URL, even if preferences change later.
- Added an old-companion version warning, English installation instructions, privacy policy and store listing.

## 1.2.1 — 2026-09-25

- Prepared a Chrome Web Store ZIP, extension icons, promotional image, screenshots, privacy policy and reviewer instructions.
- Added `-ExtensionId` to the local installer for store-assigned IDs; settings show the command for the current extension ID.
- Clarified the Windows, local companion and signed-in Codex requirements; added privacy, installation and support links.
- Store submission and review status must be checked in the developer dashboard. This version number does not imply publication.

## 1.2.0 — 2026-09-25

- New installations default to GPT-6 Luna, low reasoning effort and fast service (advertised as 1.5×); existing saved choices remain.
- Markdown notes include the source page, clickable URL, save time and model settings.
- Removed credentials and non-allowlisted query parameters from source URLs. Escaped HTML, images, embeds and executable Markdown in saved content.
- Added message origin and length validation, cross-page request ID isolation, file-path checks and file identity checks after opening.
- Disabled inherited integrations through complete configuration-table overrides, including names with special characters. Rejected relative Codex executable paths.
- Isolated real-host tests from user settings and switched to an explicit release file list with Git index and ZIP checks.

## 1.1.0

- Made reasoning effort independent from the fast-service toggle.
- Added GPT-6 Sol and Luna and benchmarked seven models; see [BENCHMARK.md](BENCHMARK.md).

## 1.0.0

- Added selection-based context-menu translation, Chinese translation and explanation, webpage context, a panel resizable from all four corners, and Markdown saving.
