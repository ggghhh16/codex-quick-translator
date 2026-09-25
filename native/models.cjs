'use strict';
const {error:localError} = require('./messages.cjs');
const ORDER = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'];
const {normalize} = require('../extension/languages.js');
const DEFAULT_SETTINGS = Object.freeze({model:'gpt-6-luna',effort:'low',fast:true,targetLanguage:'auto'});
// Explicitly requested models can lag behind the installed Codex picker catalog.
// Official model capabilities: https://developers.openai.com/api/docs/models/gpt-6-sol
// https://developers.openai.com/api/docs/models/gpt-6-luna
const REQUESTED_MODELS = ['gpt-6-sol','gpt-6-luna'];
function mergeModels(catalog) {
  const models = catalog.map(m=>({...m}));
  for(const id of REQUESTED_MODELS) {
    if(models.some(m=>m.model===id)) continue;
    models.push({id,model:id,displayName:id==='gpt-6-sol'?'GPT-6 Sol':'GPT-6 Luna',
      description:'Official model missing from the local picker catalog.',catalogSource:'supplemental',isDefault:false,
      defaultReasoningEffort:'medium',supportedReasoningEfforts:['none','low','medium','high','xhigh','max'].map(reasoningEffort=>({reasoningEffort})),
      serviceTiers:[{id:'priority',name:'Fast',description:'Fast service; actual speed varies.'}]});
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
  if (!model) throw localError('errorModel');
  const effort = settings.effort || (model.model === DEFAULT_SETTINGS.model ? DEFAULT_SETTINGS.effort : minimumEffort(model));
  if(!model.supportedReasoningEfforts.some(e=>e.reasoningEffort===effort)) throw localError('errorEffort');
  return {model:model.model,effort,serviceTier:settings.fast!==false ? fastTier(model) : 'default'};
}
function migratePreferences(models, prefs) {
  const targetLanguage = normalize(prefs.targetLanguage ?? (Object.keys(prefs).length ? 'zh-Hans' : 'auto'));
  prefs = {model:DEFAULT_SETTINGS.model,fast:true,...prefs};
  const model = models.find(m=>m.model===prefs.model) || models.find(m=>/luna|mini/.test(m.model)) || models[0];
  const effort = prefs.effort && model.supportedReasoningEfforts.some(e=>e.reasoningEffort===prefs.effort) ? prefs.effort :
    !prefs.effort && prefs.fast===false ? model.defaultReasoningEffort : model.model === DEFAULT_SETTINGS.model ? DEFAULT_SETTINGS.effort : minimumEffort(model);
  return {...prefs,model:model.model,effort,targetLanguage};
}
module.exports={DEFAULT_SETTINGS,mergeModels,chooseSettings,migratePreferences,minimumEffort,supportsFast};
