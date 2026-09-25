const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {sourceUrl,disabledIntegrations,resultMarkdown}=require('../native/safety.cjs');
const {markdown,validatePath}=require('../native/notes.cjs');
const {buildPrompt}=require('../native/codex.cjs');
const {resolveCodex}=require('../native/runtime.cjs');
const {chooseSettings,migratePreferences,mergeModels}=require('../native/models.cjs');
test('new installation explicitly defaults to Luna low priority even when none exists',()=>{
  const models=mergeModels([]);
  assert.deepEqual(chooseSettings(models),{model:'gpt-6-luna',effort:'low',serviceTier:'priority'});
  assert.deepEqual(migratePreferences(models,{}),{model:'gpt-6-luna',effort:'low',fast:true});
});
test('source link strips credentials and secret query data while retaining resource identity',()=>{
  const url='https://user:password@example.com/watch?v=video123&token=secret&session=hidden#access_token=hidden';
  assert.equal(sourceUrl(url),'https://example.com/watch?v=video123');
  assert.equal(JSON.parse(buildPrompt({selected:'hello',url})).url,sourceUrl(url));
  assert.equal(sourceUrl('javascript:alert(1)'),'');
});
test('Markdown explicitly attributes the source title and clickable URL',()=>{
  const md=markdown({title:'Source page',url:'https://example.com/article?id=123&token=secret',selected:'text',text:'## 翻译\n文本',settings:{model:'test',effort:'low',serviceTier:'priority'}});
  assert.ok(md.includes('来源网页：Source page'));
  assert.ok(md.includes('来源网址：<https://example.com/article?id=123>'));
  assert.ok(!md.includes('secret'));
});
test('model Markdown cannot introduce images HTML embedded notes or executable fences',()=>{
  const input='## 翻译\n![track](https://example.com)\n<img src=x>\n![[secret]]\n```dataviewjs\nalert(1)\n```\n`$= app.vault`';
  const result=resultMarkdown(input);
  assert.ok(result.startsWith('## 翻译\n'));
  assert.ok(result.includes('\\!\\['));
  assert.ok(!result.includes('<img'));
  assert.ok(!result.includes('```'));
  assert.ok(result.includes('\\`\\$\\='));
});
test('dotted and quoted inherited integration names remain literal table keys',()=>{
  const cfg=disabledIntegrations({mcp_servers:{'example.com':{}},plugins:{'quote"name':{}},apps:{'a.b':{}}});
  assert.equal(cfg.mcp_servers['example.com'].enabled,false);
  assert.equal(cfg.plugins['quote"name'].enabled,false);
  assert.equal(cfg.apps['a.b'].enabled,false);
});
test('relative executable is rejected before any process launches',()=>assert.throws(()=>resolveCodex({codexPath:'codex.exe'}),/绝对路径/));
test('Windows devices and ambiguous path components are rejected',()=>{
  if(process.platform!=='win32')return;
  for(const leaf of ['CON.md','nul.md','COM1.md','bad.\\file.md','bad \\file.md'])assert.throws(()=>validatePath(path.join('C:\\Notes',leaf)));
});
