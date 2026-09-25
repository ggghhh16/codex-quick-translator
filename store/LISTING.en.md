# English Chrome Web Store listing

Name: Quick Translate · Local Codex

Short description: Translate selections with page context into your chosen language. Save sources to Markdown. Requires Windows and local Codex.

## Detailed description

Select text on a webpage, right-click Quick Translate, and read the translation, explanation and page context beside the original. You can also use Alt+Shift+T.

Requirements: Windows, Node.js 20+, an installed and signed-in Codex, and this project's separate open-source local companion. The browser extension alone cannot translate. Installation instructions appear in settings. Model inference uses your configured cloud provider and may consume account quota; this extension does not provide free model access.

Features:
- Choose a target language in settings. Translation, explanation and context all follow that choice. The picker includes over 150 languages and accepts custom language codes; actual support and quality depend on the model.
- New installations follow the browser language by default. Existing users retain Chinese until changed.
- The interface follows Chrome, with English, Simplified/Traditional Chinese, Spanish, French, German, Japanese, Korean, Arabic and Brazilian Portuguese. Other interface languages fall back to English.
- Dark rounded floating panel with dragging, four-corner resizing and right-to-left text support.
- Independent model, reasoning-effort and fast-service settings. Defaults to GPT-6 Luna, low and advertised 1.5× service; availability and latency depend on Codex.
- The flag saves the original, translation, explanation, context, source page title and clickable URL to a local Markdown file.
- Stop, retry, copy and close with Esc.

Page content is read only after your translation request. The extension does not continuously track browsing, read cookies, or contain ads or analytics. Selected text and limited page context are sent to your configured model provider; this is not offline translation.

Chrome internal pages, the Web Store, the built-in PDF viewer and some cross-origin frames cannot display the panel. Long or dynamically loaded pages provide only bounded visible context. Privacy filtering of source URLs may affect links requiring unusual query parameters.

Independent open-source project; not affiliated with OpenAI or Google.

Source, installation and support: https://github.com/ggghhh16/codex-quick-translator

Privacy policy: https://github.com/ggghhh16/codex-quick-translator/blob/main/PRIVACY.en.md

## Single purpose

Translate user-selected webpage text with bounded page context into the user's chosen language, with optional user-initiated local Markdown saving of that same result and source.

Permissions and data disclosures are equivalent to LISTING.zh-CN.md. Upload a localized English listing alongside the Chinese listing; packaged UI catalogs do not automatically translate developer-dashboard description fields.
