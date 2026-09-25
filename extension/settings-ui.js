(function(root){
  const order=['none','minimal','low','medium','high','xhigh','max','ultra'];
  const {t}=typeof module==='object'&&module.exports?require('./i18n.js'):root.TranslatorI18n;
  function effortChoices(model,preferred){
    const values=order.filter(e=>model.supportedReasoningEfforts.some(v=>v.reasoningEffort===e));
    return {values,selected:values.includes(preferred)?preferred:values[0]||model.defaultReasoningEffort};
  }
  function fillEfforts(select,model,preferred){
    const {values,selected}=effortChoices(model,preferred);
    select.replaceChildren(...values.map(value=>{const option=document.createElement('option');option.value=value;option.textContent=`${t('effort_'+value)} (${value})`;return option;}));select.value=selected;select.disabled=false;
  }
  function speedInfo(model){
    const tier=(model.serviceTiers||[]).find(t=>t.id==='priority'||t.id==='fast');
    const supported=!!tier||(model.additionalSpeedTiers||[]).includes('fast');
    const multiplier=tier?.description?.match(/(\d+(?:\.\d+)?)\s*[x×]/i)?.[1];
    return {supported,label:multiplier?t('fastMultiplier',multiplier):t('fastMode'),hint:supported?
      `${t('speedSupported')} ${multiplier?t('nominalSpeed',multiplier):''}`:t('speedUnavailable')};
  }
  const api={effortChoices,fillEfforts,speedInfo};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TranslatorSettings=api;
})(globalThis);
