# English Chrome Web Store listing

Name: Quick Translate · Local Codex

Short description: Translate selected text with page context into your chosen language. Save results and source links to Markdown.

## Detailed description

Read the web in your own language. Select text on a webpage, right-click **Quick Translate**, and get a translation, a clear explanation and the passage's meaning in context. You can also press **Alt+Shift+T**. Results appear in a resizable floating window beside the text you selected.

**Requirements:** Windows, Node.js 20+, Codex installed and signed in, and this project's separate open-source local companion. The extension alone cannot perform translations. Follow the installation instructions in settings. Requests use the cloud model provider configured in Codex and may consume your account quota. No free model access is included.

Features:
- **Choose your target language.** Translation, explanation, context and section headings use the selected language. Pick from more than 150 languages or enter a language code. Translation availability and quality depend on the model.
- **Use the extension in your language.** The floating panel follows your target language and updates immediately after saving. The toolbar settings page and context menu follow Chrome. Interface translations include English, Simplified and Traditional Chinese, Spanish, French, German, Japanese, Korean, Arabic and Brazilian Portuguese. Unavailable panel languages use English; model output still follows your selected target language. New installations follow the browser language by default; existing installations keep Chinese until you change it.
- **Read comfortably.** The dark, rounded panel can be moved and resized from any corner. Right-to-left languages are displayed in the appropriate direction.
- **Set up your model.** Choose a model, reasoning effort and fast service independently. The default is GPT-6 Luna with low reasoning effort and the advertised 1.5× service tier. Model access and actual response time depend on your Codex account and service.
- **Keep useful passages.** Click the flag to append the original text, translation, explanation, context, page title and source URL to a local Markdown file.
- Stop a translation, retry, copy the result or close the panel with Esc.

The extension reads webpage content only after you request a translation. It does not continuously track browsing or read cookies, and it contains no ads or analytics. Selected text and limited page context are sent to your configured model provider. Translation is not performed offline.

Chrome internal pages, the Web Store, the built-in PDF viewer and some cross-origin frames cannot display the panel. For long or dynamically loaded pages, only a limited amount of visible page context is available. Privacy filtering may affect source links that rely on unusual query parameters.

Independent open-source project; not affiliated with OpenAI or Google.

Source, installation and support: https://github.com/ggghhh16/codex-quick-translator

Privacy policy: https://github.com/ggghhh16/codex-quick-translator/blob/main/PRIVACY.en.md

## Single purpose

Translate user-selected webpage text with bounded page context into the user's chosen language, with optional user-initiated local Markdown saving of that same result and source.

Permissions and data disclosures are equivalent to LISTING.zh-CN.md. Upload a localized English listing alongside the Chinese listing; packaged UI catalogs do not automatically translate developer-dashboard description fields.
