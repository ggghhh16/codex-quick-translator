(function(root){
  function normalize(value='auto') {
    if(value==='auto')return value;
    if(typeof value!=='string'||value.length>50||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,4}$/i.test(value))throw Object.assign(new Error('Invalid language code.'),{code:'errorInvalidLanguage'});
    try{return Intl.getCanonicalLocales(value)[0];}catch{throw Object.assign(new Error('Invalid language code.'),{code:'errorInvalidLanguage'});}
  }
  function resolve(value,uiLanguage='en') {
    value=normalize(value);
    if(value!=='auto')return value;
    try{const ui=normalize(uiLanguage);return ui==='auto'?'en':ui;}catch{return 'en';}
  }
  function name(code,locale='en') {try{return new Intl.DisplayNames([locale],{type:'language'}).of(normalize(code))||code;}catch{return code;}}
  function direction(code) {
    try{const locale=new Intl.Locale(resolve(code));return locale.getTextInfo?.().direction||locale.textInfo?.direction||(/^(ar|fa|he|ur|ps|sd|ug|yi|dv|ku|ckb)(-|$)/.test(code)?'rtl':'ltr');}catch{return 'ltr';}
  }
  let codes;
  function available() {
    if(codes)return codes;
    const known=new Set(['zh-Hans','zh-Hant','pt-BR','pt-PT','fil','yue','haw','ceb','ckb','bho','mai','sat','mni','doi','kok','sco','ast','bal','chr','nah','sah','tet','tok']);
    // CLDR names provide a localized picker without a second hard-coded language-name catalog.
    for(let a=97;a<=122;a++)for(let b=97;b<=122;b++){
      const code=String.fromCharCode(a,b);const canonical=normalize(code);
      if(name(canonical,'en')!==canonical)known.add(canonical);
    }
    codes=[...known].sort();return codes;
  }
  function fill(select,custom,value='auto',locale='en',t=key=>key){
    const entries=available().map(code=>[code,`${name(code,locale)} — ${name(code,code)}`]).sort((a,b)=>a[1].localeCompare(b[1],locale));
    select.replaceChildren(...[['auto',t('followBrowser')],...entries,['custom',t('otherLanguage')]].map(([code,label])=>{const o=document.createElement('option');o.value=code;o.textContent=label;return o;}));
    const supported=value==='auto'||available().includes(value);select.value=supported?value:'custom';custom.value=supported?'':value;
    const update=()=>{custom.hidden=select.value!=='custom';custom.required=!custom.hidden;};select.onchange=update;update();
  }
  function read(select,custom){return normalize(select.value==='custom'?custom.value.trim():select.value);}
  const api={normalize,resolve,name,direction,available,fill,read};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TranslatorLanguages=api;
})(globalThis);
