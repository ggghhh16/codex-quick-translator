(function(root){
  const fallback=typeof module==='object'&&module.exports?require('./_locales/en/messages.json'):null;
  function catalogLocale(language='en') {
    const code=String(language).replaceAll('_','-').toLowerCase();
    if(/^zh(?:-|$)/.test(code))return /^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(code)?'zh_TW':'zh_CN';
    if(/^pt(?:-|$)/.test(code))return 'pt_BR';
    const base=code.split('-')[0];
    return ['en','es','fr','de','ja','ko','ar'].includes(base)?base:'en';
  }
  function create() {
  let selected=null;
  function t(key,values=[]) {
    const args=Array.isArray(values)?values:[String(values)];
    if(selected)return (selected.messages[key]?.message||fallback?.[key]?.message||key).replace(/\$value(\d)\$/gi,(_,n)=>args[Number(n)-1]??'');
    const message=root.chrome?.i18n?.getMessage(key,args);
    return message || (fallback?.[key]?.message||key).replace(/\$value(\d)\$/gi,(_,n)=>args[Number(n)-1]??'');
  }
  const locale=()=>selected?.locale||root.chrome?.i18n?.getUILanguage()||'en';
  const setCatalog=catalog=>{selected=catalog;};
  function apply(scope) {
    for(const node of scope.querySelectorAll('[data-i18n]'))node.textContent=t(node.dataset.i18n);
    for(const [data,attribute] of [['i18nTitle','title'],['i18nAria','aria-label'],['i18nPlaceholder','placeholder']]){
      const selector=data.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
      for(const node of scope.querySelectorAll(`[data-${selector}]`))node.setAttribute(attribute,t(node.dataset[data]));
    }
  }
  const error=e=>e?.code&&t(e.code)!==e.code?t(e.code,e.args||[]):e?.message||t('errorConnection');
  return {t,locale,apply,error,setCatalog};
  }
  const api={...create(),create,catalogLocale};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TranslatorI18n=api;
})(globalThis);
