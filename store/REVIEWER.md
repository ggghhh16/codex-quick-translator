# Reviewer test instructions

This is an independent Windows-only extension. It requires a separately installed open-source native messaging companion, Node.js 20+, and a signed-in Codex installation with access to a supported model. It is not affiliated with OpenAI. Model requests consume the reviewer's own configured service quota; no developer account credentials are supplied or shared.

1. Download the matching v1.3.0 or later `codex-quick-translator` source/companion ZIP from the GitHub release linked in the extension settings, then extract it to a fixed directory.
2. Install/sign in to Codex using an account allowed to access the selected model. Do not use developer-provided shared credentials.
3. Install the extension from the review package. Open its toolbar settings and expand the local connection/help section. Copy the installation command shown there; it includes the runtime extension ID.
4. Run that command in PowerShell from the extracted companion directory. The script creates only a current-user Native Messaging registration for the exact extension ID. No administrator account is required. Do not load a second unpacked extension when testing the store build.
5. Reopen settings. Check that the local Codex connection succeeds. Select a target language, available model, reasoning effort and speed tier. Model availability depends on the account/runtime; GPT-6 Luna/low/priority is the configured default.
6. Open an ordinary HTTP(S) article, select a short sentence, and choose “Quick Translate” (localized to Chrome) from the context menu. Expect a dark floating panel with translation, explanation and context entirely in your chosen target language. Resize from any corner and try Stop/Retry/Copy.
7. Set an absolute local `.md` path in settings, translate again and click the flag. Confirm the note includes source title, URL, original text, three result sections in the selected language and model metadata. Repeated saving of the same result must not duplicate it.
8. Switch the target to Japanese or Arabic and translate again. All three sections should follow the target. Floating-panel labels/settings update immediately to the selected target language, also when saved from toolbar settings. Unavailable panel languages fall back to English. Toolbar settings and the context menu still follow Chrome. Arabic UI/output are right-to-left. New users default to browser language, while legacy preferences retain Chinese.
9. Remove the companion registration using `scripts/uninstall.ps1` and remove the extension. Notes are intentionally preserved.

Data flow: explicitly selected text and bounded page context go through the companion to the user's configured Codex model provider. The extension does not provide anonymous free translation, background browsing surveillance, advertising, analytics, or remote executable code. Native code is used only as the disclosed bridge to Codex and local note appending.

Source and companion: https://github.com/ggghhh16/codex-quick-translator

If the review environment cannot install native software or provide a Codex account with model access, contact the developer through the repository support link. Do not treat the demonstration screenshots as proof of a simulated translation backend: the production package has no mock mode.
