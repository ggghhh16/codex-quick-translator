'use strict';
const {error:localError} = require('./messages.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');
const {constants} = require('node:fs');
const {sourceUrl,plainMarkdown,resultMarkdown} = require('./safety.cjs');
const {t} = require('./messages.cjs');
function validatePath(file) {
  if (typeof file !== 'string' || !path.isAbsolute(file) || path.extname(file).toLowerCase() !== '.md') throw localError('errorInvalidPath');
  if (process.platform === 'win32' && (!/^[a-z]:\\/i.test(file) || file.slice(2).includes(':') || /[<>"|?*\x00-\x1f]/.test(file))) throw localError('errorLocalPath');
  if (process.platform === 'win32' && file.slice(3).split(/[\\/]/).some(part => /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(part) || /[. ]$/.test(part) && part !== '..' && part !== '.')) throw localError('errorDevicePath');
  return path.resolve(file);
}
function markdown(record) {
  const label=key=>t(key,record.settings.targetLanguage||'zh-Hans');
  const title = plainMarkdown(String(record.title || label('untitledPage')).replace(/[\r\n]+/g,' ').slice(0,500));
  const url = sourceUrl(record.url).replace(/[<>]/g,c=>encodeURIComponent(c));
  const fence = '`'.repeat(Math.max(3,...[...String(record.selected).matchAll(/`+/g)].map(m=>m[0].length+1)));
  return `\n\n---\n\n## ${title}\n\n- ${label('sourcePage')}: ${title}\n- ${label('sourceUrl')}: ${url ? `<${url}>` : label('noSource')}\n- ${label('savedAt')}: ${new Date().toISOString()}\n- ${label('model')}: ${plainMarkdown(record.settings.model)} · ${plainMarkdown(record.settings.effort)} · ${plainMarkdown(record.settings.serviceTier)}\n- ${label('targetLanguage')}: ${plainMarkdown(record.settings.targetLanguage||'zh-Hans')}\n\n### ${label('original')}\n\n${fence}text\n${record.selected}\n${fence}\n\n${resultMarkdown(record.text)}\n`;
}
async function appendNote(file, record) {
  file = validatePath(file);
  // Reject existing symbolic links/junctions and hard-linked files before appending.
  let parent = file;
  while (true) {
    try { const stat = await fs.lstat(parent); if(stat.isSymbolicLink() || (parent === file && (!stat.isFile() || stat.nlink > 1))) throw localError('errorLinkedPath'); }
    catch(e) { if(e.code !== 'ENOENT') throw e; }
    const next = path.dirname(parent); if(next === parent) break; parent = next;
  }
  await fs.mkdir(path.dirname(file), {recursive:true});
  const handle = await fs.open(file, constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT | (constants.O_NOFOLLOW || 0), 0o600);
  try {
    const stat = await handle.stat(); const current = await fs.lstat(file);
    if (!stat.isFile() || stat.nlink > 1 || current.isSymbolicLink() || stat.dev !== current.dev || stat.ino !== current.ino) throw localError('errorChangedPath');
    await handle.writeFile(markdown(record), 'utf8');
  } finally { await handle.close(); }
  return file;
}
module.exports = { appendNote, validatePath, markdown };
