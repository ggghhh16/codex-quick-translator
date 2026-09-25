'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const {constants} = require('node:fs');
const {sourceUrl,plainMarkdown,resultMarkdown} = require('./safety.cjs');
function validatePath(file) {
  if (typeof file !== 'string' || !path.isAbsolute(file) || path.extname(file).toLowerCase() !== '.md') throw new Error('请输入完整的本地 .md 文件路径。');
  if (process.platform === 'win32' && (!/^[a-z]:\\/i.test(file) || file.slice(2).includes(':') || /[<>"|?*\x00-\x1f]/.test(file))) throw new Error('只支持本地磁盘上的 Markdown 文件。');
  if (process.platform === 'win32' && file.slice(3).split(/[\\/]/).some(part => /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(part) || /[. ]$/.test(part) && part !== '..' && part !== '.')) throw new Error('保存路径不能包含设备名称或尾部空格、点号。');
  return path.resolve(file);
}
function markdown(record) {
  const title = plainMarkdown(String(record.title || '网页摘录').replace(/[\r\n]+/g,' ').slice(0,500));
  const url = sourceUrl(record.url).replace(/[<>]/g,c=>encodeURIComponent(c));
  const fence = '`'.repeat(Math.max(3,...[...String(record.selected).matchAll(/`+/g)].map(m=>m[0].length+1)));
  return `\n\n---\n\n## ${title}\n\n- 来源网页：${title}\n- 来源网址：${url ? `<${url}>` : '未提供可公开的 HTTP(S) 网址'}\n- 保存时间：${new Date().toISOString()}\n- 模型：${plainMarkdown(record.settings.model)} · ${plainMarkdown(record.settings.effort)} · ${plainMarkdown(record.settings.serviceTier)}\n\n### 原文\n\n${fence}text\n${record.selected}\n${fence}\n\n${resultMarkdown(record.text)}\n`;
}
async function appendNote(file, record) {
  file = validatePath(file);
  // Reject existing symbolic links/junctions and hard-linked files before appending.
  let parent = file;
  while (true) {
    try { const stat = await fs.lstat(parent); if(stat.isSymbolicLink() || (parent === file && (!stat.isFile() || stat.nlink > 1))) throw new Error('保存路径不能是链接、目录或多重硬链接文件。'); }
    catch(e) { if(e.code !== 'ENOENT') throw e; }
    const next = path.dirname(parent); if(next === parent) break; parent = next;
  }
  await fs.mkdir(path.dirname(file), {recursive:true});
  const handle = await fs.open(file, constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT | (constants.O_NOFOLLOW || 0), 0o600);
  try {
    const stat = await handle.stat(); const current = await fs.lstat(file);
    if (!stat.isFile() || stat.nlink > 1 || current.isSymbolicLink() || stat.dev !== current.dev || stat.ino !== current.ino) throw new Error('保存路径不能是链接或被替换的文件。');
    await handle.writeFile(markdown(record), 'utf8');
  } finally { await handle.close(); }
  return file;
}
module.exports = { appendNote, validatePath, markdown };
