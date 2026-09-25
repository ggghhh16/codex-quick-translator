'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Codex, chooseSettings } = require('./codex.cjs');
const { migratePreferences, DEFAULT_SETTINGS } = require('./models.cjs');
const {sourceUrl} = require('./safety.cjs');
const { resolveCodex } = require('./runtime.cjs');
const { appendNote, validatePath } = require('./notes.cjs');
const { encode, decoder } = require('./framing.cjs');
const root = path.resolve(__dirname,'..');
const local = path.join(root,'.local');
let config;
try { config = JSON.parse(fs.readFileSync(path.join(local,'host-config.json'),'utf8')); }
catch { process.exit(1); }
let client; const active = new Map(); const records = new Map(); let saving = Promise.resolve();
const send = msg => { if(!process.stdout.destroyed) process.stdout.write(encode(msg)); };
function getClient() { if(!client || client.rpc.closed) client = new Codex(resolveCodex(config),path.join(local,'work')); return client; }
function preferences() {
  try { return JSON.parse(fs.readFileSync(path.join(local,'preferences.json'),'utf8')); }
  catch { return {...DEFAULT_SETTINGS,notesPath:path.join(root,'notes','translations.md')}; }
}
async function handle(msg) {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) return;
  const id = msg.id;
  if(typeof id !== 'string' || id.length > 120) return;
  try {
    if(msg.type === 'hello') {
      const c = getClient(); await c.ready; await c.refreshModels();
      const prefs = migratePreferences(c.models,preferences());
      const selected = chooseSettings(c.models,prefs);
      return send({id,type:'hello',hostVersion:require('../package.json').version,models:c.models,preferences:{...prefs,model:selected.model},effective:selected});
    }
    if(msg.type === 'settings') {
      if (!msg.preferences || typeof msg.preferences !== 'object' || typeof msg.preferences.fast !== 'boolean') throw new Error('设置格式无效。');
      const c = getClient(); await c.ready;
      const effective = chooseSettings(c.models,msg.preferences);
      const prefs = {model:effective.model,effort:effective.effort,fast:msg.preferences.fast !== false,notesPath:validatePath(msg.preferences.notesPath)};
      const tmp = path.join(local,`preferences-${process.pid}.tmp`);
      fs.writeFileSync(tmp,JSON.stringify(prefs,null,2)); fs.renameSync(tmp,path.join(local,'preferences.json'));
      return send({id,type:'settings',preferences:prefs,effective});
    }
    if(msg.type === 'translate') {
      if(active.has(id) || records.has(id)) throw new Error('翻译请求编号不能重复。');
      if(active.size >= 4) throw new Error('最多同时进行四次翻译，请等待或停止其他翻译。');
      const controller = new AbortController(); active.set(id,controller);
      try {
        const c = getClient(); await c.ready;
        const result = await c.translate(msg.data,migratePreferences(c.models,preferences()),(text,settings)=>send({id,type:'delta',text,settings}),controller.signal);
        if(controller.signal.aborted) return;
        records.set(id,{selected:msg.data.selected,title:String(msg.data.title || '').slice(0,500),url:sourceUrl(msg.data.url),...result});
        if(records.size > 100) records.delete(records.keys().next().value);
        send({id,type:'done',...result});
      } finally {active.delete(id);}
      return;
    }
    if(msg.type === 'cancel') { active.get(msg.target)?.abort(); return send({id,type:'cancelled'}); }
    if(msg.type === 'save') {
      const record = records.get(msg.target);
      if(!record) throw new Error('翻译记录已过期，请重新翻译后收藏。');
      const target = preferences().notesPath;
      // Serialize writes, and only save host-owned completed translations.
      const result = saving.catch(()=>{}).then(async()=> {
        if(record.savedPath === target) return target;
        const file = await appendNote(target,record); record.savedPath = file; return file;
      });
      saving = result;
      return send({id,type:'saved',path:await result});
    }
    throw new Error('不支持的本地请求。');
  } catch(e) { send({id,type:'error',error:e.message}); }
}
process.stdin.on('data',decoder(msg=>void handle(msg),()=>process.exit(1)));
process.stdin.on('end',()=>{client?.dispose();process.exit(0);});
process.stdout.on('error',()=>{client?.dispose();process.exit(0);});
process.on('SIGTERM',()=>{client?.dispose();process.exit(0);});
