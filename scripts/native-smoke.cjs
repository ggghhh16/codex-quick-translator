const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { encode, decoder } = require('../native/framing.cjs');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
const isolated=fs.mkdtempSync(path.join(root,'.dev/smoke-'));
fs.cpSync(path.join(root,'native'),path.join(isolated,'native'),{recursive:true});
fs.mkdirSync(path.join(isolated,'extension'),{recursive:true});
fs.copyFileSync(path.join(root,'extension/languages.js'),path.join(isolated,'extension/languages.js'));
fs.cpSync(path.join(root,'extension/_locales'),path.join(isolated,'extension/_locales'),{recursive:true});
fs.copyFileSync(path.join(root,'package.json'),path.join(isolated,'package.json'));
fs.mkdirSync(path.join(isolated,'.local/work'),{recursive:true});
fs.copyFileSync(path.join(root,'.local/host-config.json'),path.join(isolated,'.local/host-config.json'));
const child=spawn(process.execPath,[path.join(isolated,'native/host.cjs')],{windowsHide:true,stdio:['pipe','pipe','inherit']});
let seq=0;const waiters=new Map();let deltaCount=0;
child.stdout.on('data',decoder(msg=>{if(msg.type==='delta'){deltaCount++;return;}const p=waiters.get(msg.id);if(p){clearTimeout(p.timer);waiters.delete(msg.id);msg.type==='error'?p.reject(new Error(msg.error)):p.resolve(msg);}},e=>{console.error(e);process.exitCode=1;}));
function request(type,data={}){const id=`smoke-${++seq}`;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Smoke request timed out')),160000);waiters.set(id,{resolve,reject,timer});child.stdin.write(encode({id,type,uiLanguage:'en',...data}));});}
(async()=>{
  try {
    const hello=await request('hello');console.log('Native handshake OK; models:',hello.models.length);
    const notesPath=path.join(isolated,'notes/translations.md');
    if(!hello.capabilities.targetLanguage||hello.preferences.targetLanguage!=='auto'||hello.effective.targetLanguage!=='en')throw new Error('Language negotiation failed');
    const samples={};
    for(const language of ['ja','ar','en']) {
    await request('settings',{preferences:{...hello.preferences,notesPath,fast:true,targetLanguage:language}});
    const refreshed=await request('hello');
    if(refreshed.preferences.targetLanguage!==language)throw new Error('Language preference was not persisted');
    const started=Date.now();
    const selected='The bank raised interest rates to curb inflation.';
    const result=await request('translate',{data:{selected,title:'Monetary policy explained',url:'https://example.com/monetary-policy',nearby:'The central bank raised rates this week.',main:'Central banks use interest rates to influence borrowing, spending, and inflation. Higher rates make borrowing more expensive.'}});
    console.log('Translation OK',JSON.stringify({model:result.settings.model,effort:result.settings.effort,tier:result.settings.serviceTier,deltaCount,ms:Date.now()-started}));
    fs.writeFileSync(path.join(root,`.dev/smoke-result-${language}.json`),JSON.stringify(result,null,2));
    if((result.text.match(/^## /gm)||[]).length!==3||!deltaCount||result.settings.targetLanguage!==language)throw new Error('Missing translated sections, target language or streaming events');
    if(language==='ja'&&!/[\u3040-\u30ff]/.test(result.text))throw new Error('Missing Japanese output');
    if(language==='ar'&&!/[\u0600-\u06ff]/.test(result.text))throw new Error('Missing Arabic output');
    if(language==='en'&&!/^## Translation/m.test(result.text))throw new Error('Missing English output');
    // Changing the preference must not rewrite metadata of this completed result.
    await request('settings',{preferences:{...refreshed.preferences,targetLanguage:'fr'}});
    const saved=await request('save',{target:result.id});
    const first=fs.readFileSync(notesPath,'utf8');
    await request('save',{target:result.id});
    if(fs.readFileSync(notesPath,'utf8')!==first)throw new Error('Duplicate save was not idempotent');
    if(!first.includes(selected)||!first.includes(`<https://example.com/monetary-policy>`)||!first.includes(': '+language))throw new Error('Saved note missing content, original result language or attribution');
    samples[language]={selected,...result};
    fs.writeFileSync(path.join(root,'.dev/preview-result.json'),JSON.stringify({selected,...result},null,2));
    console.log('Save + deduplication OK:',saved.path);
    }
    fs.writeFileSync(path.join(root,'.dev/i18n-results.json'),JSON.stringify(samples,null,2));
  }catch(e){console.error(e.message);process.exitCode=1;}
  finally{child.stdin.end();for(const p of waiters.values())clearTimeout(p.timer);}
})();
