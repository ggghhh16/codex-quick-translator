const test=require('node:test');const assert=require('node:assert/strict');
const {mergeModels,chooseSettings,migratePreferences}=require('../native/models.cjs');
const {effortChoices,speedInfo}=require('../extension/settings-ui.js');
const luna={model:'gpt-6-luna',defaultReasoningEffort:'medium',supportedReasoningEfforts:[{reasoningEffort:'low'},{reasoningEffort:'medium'},{reasoningEffort:'high'}],serviceTiers:[{id:'priority',description:'1.5x speed'}]};
test('fast toggle changes only service tier for every supported effort',()=>{
  for(const effort of ['low','medium','high']){
    const on=chooseSettings([luna],{model:luna.model,effort,fast:true});
    const off=chooseSettings([luna],{model:luna.model,effort,fast:false});
    assert.equal(on.effort,effort);assert.equal(off.effort,effort);assert.equal(on.serviceTier,'priority');assert.equal(off.serviceTier,'default');
  }
});
test('unsupported explicit effort is rejected rather than silently lowered',()=>assert.throws(()=>chooseSettings([luna],{effort:'none'}),/不支持/));
test('catalog includes explicitly requested GPT-6 Sol and Luna without duplicates',()=>{const models=mergeModels([luna]);assert.equal(models.filter(m=>m.model==='gpt-6-luna').length,1);assert.ok(models.some(m=>m.model==='gpt-6-sol'));assert.deepEqual(models.find(m=>m.model==='gpt-6-luna').supportedReasoningEfforts,luna.supportedReasoningEfforts);});
test('legacy fast preference migrates to low and keeps notes path',()=>{const prefs=migratePreferences([luna],{model:luna.model,fast:true,notesPath:'D:\\notes.md'});assert.equal(prefs.effort,'low');assert.equal(prefs.notesPath,'D:\\notes.md');});
test('legacy standard preference migrates to previous model default',()=>assert.equal(migratePreferences([luna],{model:luna.model,fast:false}).effort,'medium'));
test('saved explicit effort survives migration with fast off or on',()=>{for(const fast of [true,false])assert.equal(migratePreferences([luna],{model:luna.model,effort:'high',fast}).effort,'high');});
test('effort picker preserves supported value on model change',()=>assert.equal(effortChoices(luna,'high').selected,'high'));
test('effort picker excludes unsupported none and explains fallback via selected value',()=>assert.deepEqual(effortChoices(luna,'none'),{values:['low','medium','high'],selected:'low'}));
test('speed label uses server multiplier without promising all models are 1.5x',()=>{assert.equal(speedInfo(luna).label,'快速模式（1.5×）');assert.equal(speedInfo({...luna,serviceTiers:[{id:'priority',description:'2x speed'}]}).label,'快速模式（2×）');assert.equal(speedInfo({...luna,serviceTiers:[]}).supported,false);});
