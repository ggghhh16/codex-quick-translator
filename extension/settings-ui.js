(function(root){
  const order=['none','minimal','low','medium','high','xhigh','max','ultra'];
  const {t}=typeof module==='object'&&module.exports?require('./i18n.js'):root.TranslatorI18n;
  function effortChoices(model,preferred){
    const values=order.filter(e=>model.supportedReasoningEfforts.some(v=>v.reasoningEffort===e));
    return {values,selected:values.includes(preferred)?preferred:values[0]||model.defaultReasoningEffort};
  }
  function fillEfforts(select,model,preferred,translate=t){
    const {values,selected}=effortChoices(model,preferred);
    select.replaceChildren(...values.map(value=>{const option=document.createElement('option');option.value=value;option.textContent=`${translate('effort_'+value)} (${value})`;return option;}));select.value=selected;select.disabled=false;
  }
  function speedInfo(model,translate=t){
    const tier=(model.serviceTiers||[]).find(t=>t.id==='priority'||t.id==='fast');
    const supported=!!tier||(model.additionalSpeedTiers||[]).includes('fast');
    const multiplier=tier?.description?.match(/(\d+(?:\.\d+)?)\s*[x×]/i)?.[1];
    return {supported,label:multiplier?translate('fastMultiplier',multiplier):translate('fastMode'),hint:supported?
      `${translate('speedSupported')} ${multiplier?translate('nominalSpeed',multiplier):''}`:translate('speedUnavailable')};
  }
  const api={effortChoices,fillEfforts,speedInfo};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TranslatorSettings=api;
})(globalThis);
