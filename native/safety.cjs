'use strict';
// Preserve common public resource identifiers; discard credentials and unknown query data.
function sourceUrl(value) {
  try {
    const url = new URL(String(value || ''));
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.username = ''; url.password = ''; url.hash = '';
    const safe = new URLSearchParams();
    for (const key of ['v', 'id', 'p', 'page', 'article', 'title']) {
      const value = url.searchParams.get(key);
      if (value && value.length <= 200) safe.set(key, value);
    }
    url.search = safe.toString();
    return url.href.length <= 2000 ? url.href : '';
  } catch { return ''; }
}
function plainMarkdown(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/([\\`*_[\]{}()#!|~$=+.-])/g, '\\$1');
}
function resultMarkdown(value) {
  return String(value).split(/\r?\n/).map(line => /^## [^\r\n]{1,160}$/.test(line) ? '## '+plainMarkdown(line.slice(3)) : plainMarkdown(line)).join('\n');
}
function disabledIntegrations(config) {
  // App Server splits dotted override paths literally, without TOML quote parsing.
  // Pass whole tables so names containing dots or quotes remain literal keys.
  return Object.fromEntries(['mcp_servers', 'plugins', 'apps'].map(section => [section,
    Object.fromEntries([...new Set([...(section === 'apps' ? ['_default'] : []), ...Object.keys(config[section] || {})])]
      .map(key => [key, {enabled:false}]))]));
}
module.exports = {sourceUrl, plainMarkdown, resultMarkdown, disabledIntegrations};
