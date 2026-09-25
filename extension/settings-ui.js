(function(root){
  const order=['none','minimal','low','medium','high','xhigh','max','ultra'];
  const labels={none:'不思考',minimal:'极低',low:'低',medium:'中',high:'高',xhigh:'很高',max:'最高',ultra:'极高'};
  function effortChoices(model,preferred){
    const values=order.filter(e=>model.supportedReasoningEfforts.some(v=>v.reasoningEffort===e));
    return {values,selected:values.includes(preferred)?preferred:values[0]||model.defaultReasoningEffort};
  }
  function fillEfforts(select,model,preferred){
    const {values,selected}=effortChoices(model,preferred);
    select.replaceChildren(...values.map(value=>{const option=document.createElement('option');option.value=value;option.textContent=`${labels[value]||value}（${value}）`;return option;}));select.value=selected;select.disabled=false;
  }
  function speedInfo(model){
    const tier=(model.serviceTiers||[]).find(t=>t.id==='priority'||t.id==='fast');
    const supported=!!tier||(model.additionalSpeedTiers||[]).includes('fast');
    const multiplier=tier?.description?.match(/(\d+(?:\.\d+)?)\s*[x×]/i)?.[1];
    return {supported,label:multiplier?`快速模式（${multiplier}×）`:'快速模式',hint:supported?
      `仅切换快速服务，不改变思考强度。${multiplier?`${multiplier}× 为服务标称速度；`:''}实际延迟会波动，可能增加额度消耗。`:
      '该模型未提供快速服务，将使用标准服务。思考强度独立设置。'};
  }
  const api={effortChoices,fillEfforts,speedInfo};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TranslatorSettings=api;
})(globalThis);
