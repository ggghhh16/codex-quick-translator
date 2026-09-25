(function(root){
  const fallback=typeof module==='object'&&module.exports?require('./_locales/en/messages.json'):null;
  function t(key,values=[]) {
    const args=Array.isArray(values)?values:[String(values)];
    const message=root.chrome?.i18n?.getMessage(key,args);
    return message || (fallback?.[key]?.message||key).replace(/\$value(\d)\$/gi,(_,n)=>args[Number(n)-1]??'');
  }
  const locale=()=>root.chrome?.i18n?.getUILanguage()||'en';
  function apply(scope) {
    for(const node of scope.querySelectorAll('[data-i18n]'))node.textContent=t(node.dataset.i18n);
    for(const [data,attribute] of [['i18nTitle','title'],['i18nAria','aria-label'],['i18nPlaceholder','placeholder']]){
      const selector=data.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
      for(const node of scope.querySelectorAll(`[data-${selector}]`))node.setAttribute(attribute,t(node.dataset[data]));
    }
  }
  const error=e=>e?.code&&t(e.code)!==e.code?t(e.code,e.args||[]):e?.message||t('errorConnection');
  const api={t,locale,apply,error};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TranslatorI18n=api;
})(globalThis);
