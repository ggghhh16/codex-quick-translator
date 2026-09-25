'use strict';
const ORDER = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'];
const DEFAULT_SETTINGS = Object.freeze({model:'gpt-6-luna',effort:'low',fast:true});
// Explicitly requested models can lag behind the installed Codex picker catalog.
// Official model capabilities: https://developers.openai.com/api/docs/models/gpt-6-sol
// https://developers.openai.com/api/docs/models/gpt-6-luna
const REQUESTED_MODELS = ['gpt-6-sol','gpt-6-luna'];
function mergeModels(catalog) {
  const models = catalog.map(m=>({...m}));
  for(const id of REQUESTED_MODELS) {
    if(models.some(m=>m.model===id)) continue;
    models.push({id,model:id,displayName:id==='gpt-6-sol'?'GPT-6 Sol':'GPT-6 Luna',
      description:'官方模型；补充本地 Codex 目录遗漏的选项。',catalogSource:'supplemental',isDefault:false,
      defaultReasoningEffort:'medium',supportedReasoningEfforts:['none','low','medium','high','xhigh','max'].map(reasoningEffort=>({reasoningEffort})),
      serviceTiers:[{id:'priority',name:'Fast',description:'快速服务，实际速度由服务端决定。'}]});
  }
  const rank = ['gpt-6-luna','gpt-6-sol','gpt-6-astra'];
  return models.sort((a,b)=>(rank.indexOf(a.model)<0?99:rank.indexOf(a.model))-(rank.indexOf(b.model)<0?99:rank.indexOf(b.model)));
}
const fastTier = m => (m.serviceTiers || []).find(t => t.id === 'priority')?.id || (m.serviceTiers || []).find(t => t.id === 'fast')?.id || ((m.additionalSpeedTiers || []).includes('fast') ? 'fast' : 'default');
const supportsFast = m => fastTier(m) !== 'default';
const minimumEffort = m => ORDER.find(e=>m.supportedReasoningEfforts.some(v=>v.reasoningEffort===e)) || m.defaultReasoningEffort;
function chooseSettings(models, settings = {}) {
  const model = settings.model ? models.find(m => m.model === settings.model) :
    models.find(m => m.model === DEFAULT_SETTINGS.model) || models.find(m => /luna|mini/.test(m.model)) || models.find(m => m.isDefault) || models[0];
  if (!model) throw new Error('所选模型不可用，请在设置中重新选择。');
  const effort = settings.effort || (model.model === DEFAULT_SETTINGS.model ? DEFAULT_SETTINGS.effort : minimumEffort(model));
  if(!model.supportedReasoningEfforts.some(e=>e.reasoningEffort===effort)) throw new Error('所选模型不支持此思考强度，请重新选择。');
  return {model:model.model,effort,serviceTier:settings.fast!==false ? fastTier(model) : 'default'};
}
function migratePreferences(models, prefs) {
  prefs = {model:DEFAULT_SETTINGS.model,fast:true,...prefs};
  const model = models.find(m=>m.model===prefs.model) || models.find(m=>/luna|mini/.test(m.model)) || models[0];
  const effort = prefs.effort && model.supportedReasoningEfforts.some(e=>e.reasoningEffort===prefs.effort) ? prefs.effort :
    !prefs.effort && prefs.fast===false ? model.defaultReasoningEffort : model.model === DEFAULT_SETTINGS.model ? DEFAULT_SETTINGS.effort : minimumEffort(model);
  return {...prefs,model:model.model,effort};
}
module.exports={DEFAULT_SETTINGS,mergeModels,chooseSettings,migratePreferences,minimumEffort,supportsFast};
