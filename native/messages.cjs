'use strict';
const fs=require('node:fs');const path=require('node:path');
const fallback=require('../extension/_locales/en/messages.json');const cache=new Map([['en',fallback]]);
function messages(locale='en') {
  let code=String(locale).replaceAll('-','_');
  if(!/^[a-z]{2,3}(?:_[a-z0-9]{2,8})*$/i.test(code))code='en';
  if(/^zh_(TW|HK|MO|Hant)/i.test(code))code='zh_TW';else if(/^zh/i.test(code))code='zh_CN';
  if(/^pt(?:_|$)/i.test(code))code='pt_BR';
  if(cache.has(code))return cache.get(code);
  for(const candidate of [code,code.split('_')[0]]){
    try{const result={...fallback,...JSON.parse(fs.readFileSync(path.join(__dirname,'../extension/_locales',candidate,'messages.json'),'utf8'))};cache.set(code,result);return result;}catch{}
  }
  return fallback;
}
function t(key,locale='en',args=[]) {return (messages(locale)[key]?.message||key).replace(/\$value(\d)\$/gi,(_,n)=>args[Number(n)-1]??'');}
function error(code,args=[]) {return Object.assign(new Error(t(code,'en',args)),{code,args});}
module.exports={t,error};
