# Quick Translate · Local Codex — Privacy Policy

Effective September 25, 2026. Developer: GitHub user ggghhh16. Applies to the Chrome extension and its local companion. [中文版](PRIVACY.md). This independent project is not affiliated with OpenAI or Google.

## Data and purpose

Only when you request a translation through the context menu or shortcut, the extension reads selected text (up to 12,000 characters), nearby paragraphs (up to 5,000), main page excerpts (up to 16,000), page title and source URL. These provide translation, explanation and context in your chosen language. Text may contain personal information; the extension does not automatically remove it.

URLs have usernames, passwords and fragments removed. Only common content-identification query parameters `v/id/p/page/article/title` are retained. Paths and retained parameters may still contain personal information. The extension does not access the browsing-history database, continuously monitor browsing, read cookies or password fields, or build profiles.

## Data recipients

Chrome Native Messaging transfers page material to the local companion, which sends it through Codex App Server to the model provider configured in your Codex installation. This is usually OpenAI, but custom configurations may use other providers. Inference runs in the cloud, not offline. Provider retention and use depend on its policies and your account settings.

The developer has no server receiving translation data. The extension includes no analytics, advertising or telemetry service. The developer does not sell user data, use it for advertising, transfer it to data brokers, or use it for unrelated purposes. Transmission to your configured model provider is necessary to perform your requested translation.

## Local storage and deletion

Model, reasoning effort, speed, target language and note-path preferences are stored in the companion's `.local` directory. Chrome's interface language is used to localize the UI and resolve the “Follow browser language” target. Up to 100 completed translations are retained in companion process memory and cleared when that process exits.

Only clicking the flag appends original text, translation, explanation, context, page title, source URL, time, target language and model settings to your chosen Markdown file. The developer cannot access it. You may edit or delete notes yourself; uninstalling intentionally preserves them. Deleting the companion directory removes its settings and test data. Codex manages its own account data and logs separately.

## Permissions and security

`activeTab` and `scripting` provide access to the current page after your action; `contextMenus` supplies the translation command; `nativeMessaging` connects to Codex and saves notes on request. There is no persistent all-sites permission or remote executable script. The extension does not read or store Codex authentication tokens; Codex manages authentication and model requests.

Before translating, ensure the page material may be sent to your model provider, especially work documents, personal communications or sensitive data. Implementation details and limitations are documented in [SECURITY.md](SECURITY.md).

## Limited Use and contact

Use and transfer of information received from Chrome APIs adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data/), including Limited Use requirements. Data serves only the disclosed translation, explanation, context and user-initiated local saving features.

Policy changes update the effective date and repository release notes. Contact the developer through [project Issues](https://github.com/ggghhh16/codex-quick-translator/issues). Do not post private page contents, notes or credentials in public issues.
