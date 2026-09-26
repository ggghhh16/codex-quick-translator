# Security and privacy

## Data flow and permissions

After you explicitly request a translation, the extension reads the selected text, nearby paragraphs and a bounded excerpt of the main page content. It passes this material to the local Codex App Server and then to the model provider configured in Codex. Translation is not offline. Personal information in the selection or page text is not automatically detected or redacted.

The extension requests only `activeTab`, `scripting`, `contextMenus` and `nativeMessaging`. It has no persistent access to all websites, does not read cookies, include account credentials or load remote scripts. Native Messaging registration allows only the specified extension ID. The background script validates message origin and length, plus tab/frame/document ownership. The source URL comes from Chrome's sender information.

Webpage and model text are never executed as HTML. Model requests disable command tools, MCP, apps, plugins, hooks, memory and web search, and use temporary sessions with restricted read-only permissions. The client rejects requests for tools or approval. Integration settings are overridden as complete tables, including integration names containing periods.

## Markdown saving

- Saving appends only completed translations held by the local companion; webpages cannot supply arbitrary content to write.
- Each note records source page, source URL, save time and actual model settings.
- URLs lose usernames, passwords, fragments and query parameters outside the allowlist `v/id/p/page/article/title`. Paths and retained parameters may still contain personal information. Links that need other parameters may no longer resolve to the exact source.
- Original text uses a length-adjusted fenced code block. Model output and page titles escape HTML, images, embeds, code and other Markdown syntax, retaining only the three result headings. Safety takes priority over rich formatting.
- The destination must be an absolute `.md` path on a local disk. UNC paths, alternate data streams, device names, symlinks, directories and multiply linked files are rejected. The host checks file identity again after opening and appends instead of overwriting.
- These checks do not protect against malicious software with the same Windows user permissions that can concurrently change parent directories or project code. Keep the installation directory writable only by trusted users.

## Local files and release scope

`.local/` holds the runtime, host configuration, preferences and working directory. `.dev/` holds public test material, results and isolated test directories. `notes/` is the default notes directory. They are Git-ignored and excluded from the release file list. Users manage any separate notes destination they choose. Codex account data and logs follow Codex's own settings; this extension does not claim to remove them.

The uninstaller removes only the native-host registration. Remove the extension, project directory and notes separately as appropriate to avoid accidental note loss. Releases use the explicit file list in `release-files.json` and scan the worktree, Git index and ZIP contents. Signature-based secret scans are not a complete guarantee; review new release files manually. For the full data-use policy, see [PRIVACY.md](PRIVACY.md).

## Reporting an issue

Use the repository's Security page to report vulnerabilities privately when available. Public issues should include only reproduction details free of credentials, private page content and local paths.

References: [Chrome Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging) and [Chrome extension security guidance](https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure).
