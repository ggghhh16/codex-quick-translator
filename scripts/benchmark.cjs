'use strict';
const fs=require('node:fs');const path=require('node:path');
const {Codex,chooseSettings}=require('../native/codex.cjs');
const {resolveCodex}=require('../native/runtime.cjs');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'.dev'),{recursive:true});fs.mkdirSync(path.join(root,'.local/work'),{recursive:true});
const installed=JSON.parse(fs.readFileSync(path.join(root,'.local/host-config.json'),'utf8'));
const executable=process.argv.includes('--codex')?process.argv[process.argv.indexOf('--codex')+1]:resolveCodex(installed);
const c=new Codex(executable,path.join(root,'.local/work'));
const cases=[
  {selected:'The bank raised interest rates to curb inflation.',title:'Monetary policy',nearby:'The central bank raised interest rates this week.',main:'Central banks use interest rates to influence borrowing, spending, and inflation. Higher rates make borrowing more expensive.'},
  {selected:'Cache invalidation is one of the hardest problems in computer science.',title:'Caching strategies',nearby:'Stale cached entries can cause a client to display out-of-date data.',main:'This article compares time-to-live expiration and event-driven invalidation. It discusses correctness and performance trade-offs in distributed caches.'},
  {selected:'この機能は、ネットワーク接続が不安定な場合でも利用できます。',title:'オフライン対応',nearby:'アプリは端末内にデータを保存します。',main:'この記事では、アプリのオフライン機能と、接続回復後のデータ同期について説明しています。'}
];
const rows=[];const excluded=new Set();let configs=[];
const out=path.join(root,'.dev',process.argv.includes('--probe')?'benchmark-probe.json':'benchmark.json');
const median=values=>{const sorted=[...values].sort((a,b)=>a-b);const m=Math.floor(sorted.length/2);return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;};
function summary(){return configs.map(config=>{const samples=rows.filter(r=>r.key===config.key&&!r.error);return{...config,samples:samples.length,medianFirstMs:samples.length?median(samples.map(r=>r.firstMs)):null,medianTotalMs:samples.length?median(samples.map(r=>r.totalMs)):null};}).sort((a,b)=>(a.medianFirstMs??Infinity)-(b.medianFirstMs??Infinity));}
function persist(){fs.writeFileSync(out,JSON.stringify({date:new Date().toISOString(),method:'Sequential, rotated order; five rounds of three cycling identical-per-round translation fixtures; fresh ephemeral thread for each request; persistent app-server; first visible text and complete result timing; not a fixed-output throughput benchmark.',models:c.models,summary:summary(),rows},null,2));}
async function run(config,round){
  if(excluded.has(config.key))return;
  if(rows.some(row=>row.key===config.key&&row.round===round+1))return;
  const start=performance.now();let firstMs;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
  try {
    const result=await c.translate({...cases[round % cases.length],url:'https://example.com/benchmark'},config,()=>{firstMs??=Math.round(performance.now()-start);},controller.signal);
    if(!['## 翻译','## 解释','## 语境'].every(h=>result.text.includes(h)))throw new Error('Missing requested output sections');
    const row={key:config.key,round:round+1,settings:result.settings,firstMs,totalMs:Math.round(performance.now()-start),characters:result.text.length,text:result.text};rows.push(row);
    console.log(JSON.stringify({key:row.key,round:row.round,firstMs:row.firstMs,totalMs:row.totalMs,characters:row.characters}));
  }catch(e){rows.push({key:config.key,round:round+1,error:e.message});excluded.add(config.key);console.log(JSON.stringify({key:config.key,error:e.message}));}
  finally{clearTimeout(timer);persist();}
}
(async()=>{try{
  await c.ready;
  const quick=process.argv.includes('--probe');
  const extending=process.argv.includes('--extend');
  if(extending){const previous=JSON.parse(fs.readFileSync(out,'utf8'));rows.push(...previous.rows);configs=previous.summary.map(({key,model,effort,fast})=>({key,model,effort,fast}));for(const row of rows)if(row.error)excluded.add(row.key);}
  for(const m of extending?[]:c.models){
    if(quick&&!['gpt-6-sol','gpt-6-luna'].includes(m.model))continue;
    configs.push({key:`${m.model}/low/priority`,model:m.model,effort:'low',fast:true});
    if(['gpt-6-sol','gpt-6-luna'].includes(m.model)&&m.supportedReasoningEfforts.some(e=>e.reasoningEffort==='none'))configs.push({key:`${m.model}/none/priority`,model:m.model,effort:'none',fast:true});
  }
  console.log('Configs',configs.map(c=>c.key).join(', '));
  for(let round=extending?3:0;round<(quick?1:5);round++){const order=[...configs.slice(round),...configs.slice(0,round)];for(const config of order)await run(config,round);}
  if(!quick&&!extending){
    const fastest=summary().filter(s=>s.samples===5)[0];
    if(fastest){const standard={key:`${fastest.model}/${fastest.effort}/default`,model:fastest.model,effort:fastest.effort,fast:false};configs.push(standard);for(let round=0;round<5;round++)await run(standard,round);}
  }
  console.log('SUMMARY',JSON.stringify(summary()));
}catch(e){console.error(e.message);process.exitCode=1;}finally{persist();c.dispose();}})();
