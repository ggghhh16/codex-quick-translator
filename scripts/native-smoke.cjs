const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { encode, decoder } = require('../native/framing.cjs');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});
const isolated=fs.mkdtempSync(path.join(root,'.dev/smoke-'));
fs.cpSync(path.join(root,'native'),path.join(isolated,'native'),{recursive:true});
fs.copyFileSync(path.join(root,'package.json'),path.join(isolated,'package.json'));
fs.mkdirSync(path.join(isolated,'.local/work'),{recursive:true});
fs.copyFileSync(path.join(root,'.local/host-config.json'),path.join(isolated,'.local/host-config.json'));
const child=spawn(process.execPath,[path.join(isolated,'native/host.cjs')],{windowsHide:true,stdio:['pipe','pipe','inherit']});
let seq=0;const waiters=new Map();let deltaCount=0;
child.stdout.on('data',decoder(msg=>{if(msg.type==='delta'){deltaCount++;return;}const p=waiters.get(msg.id);if(p){clearTimeout(p.timer);waiters.delete(msg.id);msg.type==='error'?p.reject(new Error(msg.error)):p.resolve(msg);}},e=>{console.error(e);process.exitCode=1;}));
function request(type,data={}){const id=`smoke-${++seq}`;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Smoke request timed out')),160000);waiters.set(id,{resolve,reject,timer});child.stdin.write(encode({id,type,...data}));});}
(async()=>{
  try {
    const hello=await request('hello');console.log('Native handshake OK; models:',hello.models.length);
    const notesPath=path.join(isolated,'notes/translations.md');
    await request('settings',{preferences:{...hello.preferences,notesPath,fast:true}});
    const started=Date.now();
    const selected='The bank raised interest rates to curb inflation.';
    const result=await request('translate',{data:{selected,title:'Monetary policy explained',url:'https://example.com/monetary-policy',nearby:'The central bank raised rates this week.',main:'Central banks use interest rates to influence borrowing, spending, and inflation. Higher rates make borrowing more expensive.'}});
    console.log('Translation OK',JSON.stringify({model:result.settings.model,effort:result.settings.effort,tier:result.settings.serviceTier,deltaCount,ms:Date.now()-started}));
    if(!/## 翻译/.test(result.text)||!deltaCount)throw new Error('Missing translated sections or streaming events');
    const saved=await request('save',{target:result.id});
    const first=fs.readFileSync(notesPath,'utf8');
    await request('save',{target:result.id});
    if(fs.readFileSync(notesPath,'utf8')!==first)throw new Error('Duplicate save was not idempotent');
    if(!first.includes(selected)||!first.includes('## 翻译')||!first.includes('来源网址：<https://example.com/monetary-policy>'))throw new Error('Saved note missing content or attribution');
    fs.writeFileSync(path.join(root,'.dev/preview-result.json'),JSON.stringify({selected,...result},null,2));
    console.log('Save + deduplication OK:',saved.path);
  }catch(e){console.error(e.message);process.exitCode=1;}
  finally{child.stdin.end();for(const p of waiters.values())clearTimeout(p.timer);}
})();
