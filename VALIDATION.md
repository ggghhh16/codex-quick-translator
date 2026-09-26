# Validation record

Date: 2026-09-25. Target platform: Windows + Chrome. Local Codex version: `0.155.0-alpha.16.4`.

## v1.3.1: floating-panel interface language

- Cause: the panel always called Chrome's `getMessage` for the browser UI language; the saved target language affected only model output. It now loads the packaged catalog for the target language, with English fallback.
- On opening, the panel reads current settings. Saving updates buttons, settings, reasoning labels, speed text, messages and layout direction in current and other open panels. Notifications are scoped to tab/frame/document, and subscriptions are removed when a panel or tab closes.
- Fixed an older asynchronous settings read overwriting a newly chosen language when the gear menu was reopened. Existing translation text and direction remain; interface updates do not request another translation.
- Passed 49 Node tests and four Python publication checks. New checks cover saving English in Chinese Chrome, updating open panels, stopping notifications after close and safe fallback.
- The browser test page checked English, Chinese and Arabic Chrome contexts: Japanese/Arabic panels, synchronization from toolbar settings, English controls, English retained after reopen, and fallback for a custom language. It used production UI with simulated extension transport. It was not an installed-extension native context-menu end-to-end retest.
- This change did not modify model calls or perform additional live translation. Screenshots replayed earlier real model output. The release still used explicit file lists and scans of worktree, Git index and ZIP contents.

## v1.3.0: target languages and internationalization

- Passed 46 Node tests and four Python publication-scan tests. Coverage included language-code validation, legacy preference migration, Chrome message substitutions, ten locale catalogs, old-host version blocking, real RPC instruction fields and multilingual Markdown safety.
- The language picker offered 207 languages and regional variants in the tested Node/Chrome environment, plus custom codes. This count comes from local Intl/CLDR data and may vary by runtime. It does not imply equal model accuracy for every language.
- The real native host used GPT-6 Luna / low / priority and produced Japanese, Arabic and English translation, explanation and context with headings in the respective target language. Successful sample times were about 6.9, 5.0 and 5.9 seconds; they are observations, not speed guarantees.
- The first live Japanese test exposed Chinese output when the target language was specified only in the base instruction. Specifying the trusted target language in both base and developer instructions fixed the observed behavior for those three languages. Prompt checks alone were not treated as model-behavior proof.
- Each target language was saved and read back. Notes retained the result's original target language even after preferences changed. Real Markdown writes included original text, output and explicit source URL; repeat saving did not duplicate a note. Tests used a separate directory and did not alter user preferences or notes.
- The browser test page used production UI and real-output replay to check English, Chinese and Arabic interfaces, target selection and custom-code persistence, invalid-code errors, Japanese/Arabic text direction, separate interface and output languages, saving feedback and Esc. A font inherited from the webpage was corrected after screenshot review.
- Store descriptions, installation instructions and privacy policies were prepared in English and Chinese. Screenshots show an English interface with a replay of real Japanese output. The interface has ten localized catalogs; other languages fall back to English according to Chrome behavior.
- The installed Chrome extension's native context-menu flow was not retested end to end. Browser tests used simulated extension communication; real Native Messaging frames were checked separately through standard input/output. Store upload and review status must be checked in the developer dashboard.
- The release list contained 73 files. New locale resources were included in both package checks. Runtime code added no network endpoint, permission or third-party dependency.

## v1.2.1: store submission preparation

- The store ZIP contained only browser code and four icon sizes, with `manifest.json` at the root. Packaging removed the development public key so the store could assign an Item ID.
- The installer gained strict `-ExtensionId` format validation. Settings displayed a command for the current extension ID.
- Prepared a 128×128 icon, 440×280 promotional image and two 1280×800 screenshots. Screenshots used production panel code and real-output replay with public example content and were labeled “example replay.” They were not latency or installed end-to-end evidence.
- The release list then contained 55 source and material files; the store ZIP held 11 browser files. PNGs were restricted to expected paths and formats, without hidden metadata or trailing data.
- Store listing, privacy policy, permission reasons and reviewer instructions were prepared. Local materials alone do not establish dashboard submission.

## v1.2: release checks and security review

- Passed 35 Node tests and three Python publication-scan tests. PowerShell installer and uninstaller scripts parsed successfully.
- A real native-host test returned `gpt-6-luna / low / priority`, completed one public English translation in about 5.5 seconds and received 92 streaming events.
- A real test note included original text, three Chinese result sections, source title and clickable URL. Saving the same result again did not append a duplicate. Test settings and output were isolated from normal preferences and notes.
- Fixed insufficient message-origin and length checks, request IDs crossing page ownership, URLs retaining credentials or unknown query parameters, unsafe Markdown images and embeds, special local paths and relative executable paths.
- Changed inherited-integration disabling to whole-table overrides so names with periods remain intact. A real App Server test initialized, translated and saved with this configuration.
- Manually reviewed runtime network calls, process launches, DOM output, file appends, permissions and the installer. Runtime code had no third-party npm dependency or built-in token.
- Release packaging used 41 explicitly listed files and scanned worktree, Git index and ZIP, excluding local settings, runtimes, notes, personal paths and raw test output. The extension's `manifest.key` is a public key used for stable extension ID, not a credential.
- This was a code review and targeted testing, not an external penetration test or security certification. See [SECURITY.md](SECURITY.md) for data flow, local files and limitations.
- The installed Chrome extension's native context-menu flow was not rerun during this release; native-host tests do not replace browser acceptance testing.

## v1.1: validation

- Passed 25 automated tests, including independent speed and reasoning settings, migration of old preferences, model-catalog merging and advertised multiplier display.
- On the browser test page, selecting `medium`, disabling fast service, saving and reopening retained `medium`. Switching to GPT-6 Sol and re-enabling 1.5× also retained `medium`.
- The native host returned version 1.1.0, and the live catalog included GPT-6 Sol/Luna with a separate effort field. The check did not modify the user's model or note path.
- Ran five live translations for each of seven models, plus a standard-service comparison: 40 requests total. See [BENCHMARK.md](BENCHMARK.md).
- The local native-host registration was completed. Reloading Chrome and final UI checks remained pending in that validation round.

## v1.0: initial validation

| Check | Result |
| --- | --- |
| Node automated tests | 16/16 passed |
| PowerShell installer/uninstaller parsing | Passed |
| Local Codex initialization and model catalog | Passed with the signed-in Windows user's Codex |
| Minimum effort and fast service | Selected from live model capabilities; observed `gpt-6-luna / low / priority` |
| Native protocol frames | Standard input/output handshake and streaming passed |
| Real translation and saving | Last example completed in about 5.6 seconds with 96 stream events; note included original text, translation and context |
| Duplicate saving | No second append for the same result and file |
| File protection | Append without overwrite; reject relative, non-Markdown and multiply linked destinations |
| Page isolation | Messages targeted by tab/frame/document; another tab could not save a foreign result |
| Cancellation and disconnect | Automated checks covered cancellation and error propagation |
| Floating panel | Browser test page checked three Chinese sections, settings and save confirmation |
| Corner resizing | All four corners visibly resized the panel in browser checks |
| Settings | Checked `medium` after disabling fast mode, path editing and save confirmation |
| Error state | Test adapter simulated a disconnect; unfinished result could not be saved |
| Esc | Closing still worked after focus left the panel; fixed and rechecked |

The sample latency describes one test and is not a service-speed guarantee. Page length, model, network and service load affect latency.

## Validation limits

- After updating an existing installation, reload the extension and refresh webpages before checking browser behavior.
- Real native-host tests used direct standard input/output. They do not prove Chrome registration and process launch work together.
- UI tests replayed real Codex output on a project test page. Extension communication and save messages used a test adapter; its Shadow DOM was open for inspection, while production Shadow DOM remains closed.
- Actual Markdown append and duplicate protection were checked through a separate native-host test, not inferred from the test page's success message.
- Chrome's native context menu, cross-origin iframes, PDFs and complex-page compatibility were not fully validated. Browser-restricted pages are listed in [README.md](README.md).
- Full browser acceptance path: reload `extension` in Chrome → select text on a normal webpage → use the context menu → confirm the real panel → click the flag → inspect the appended note.

## Packaging

`scripts/package.py` builds a ZIP from the per-file `release-files.json` allowlist and checks integrity, then creates a SHA-256 file. `scripts/check-publication.py --index --zip <zip>` checks the actual Git index and archive against that list. `.local`, `.dev`, personal notes and runtime files are excluded. Scans detect common credential, private-key, personal-email and local-user-path patterns. The extension's `manifest.key` is a public extension-ID key, not a credential.
