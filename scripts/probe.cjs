const { Codex, chooseSettings } = require('../native/codex.cjs');
const path = require('node:path');
require('node:fs').mkdirSync(path.resolve(__dirname,'../.local/work'),{recursive:true});
let config={};try{config=JSON.parse(require('node:fs').readFileSync(path.resolve(__dirname,'../.local/host-config.json'),'utf8'));}catch{}
const client = new Codex(process.env.CODEX_EXECUTABLE || require('../native/runtime.cjs').resolveCodex(config), path.resolve(__dirname,'../.local/work'));
(async () => {
  try {
    const models = await client.ready;
    console.log(JSON.stringify(models.map(m => ({model:m.model,efforts:m.supportedReasoningEfforts.map(e=>e.reasoningEffort),tiers:m.serviceTiers})),null,2));
    console.log('selected',chooseSettings(models));
    if(process.argv.includes('--translate')) {
      const start = Date.now(); let first = false;
      const result = await client.translate({selected:'The bank raised interest rates.',title:'Monetary policy',main:'The central bank is responding to inflation by raising interest rates.'},{fast:true},() => { if(!first) { first = true; console.log('first delta ms',Date.now()-start); } });
      console.log(result); console.log('total ms',Date.now()-start);
    }
  } catch(e) { console.error(e.message); process.exitCode = 1; } finally {client.dispose();}
})();
