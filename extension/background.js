importScripts('i18n.js','languages.js');
const {t,locale,error:displayError}=TranslatorI18n;
const HOST = 'com.local.codex_quick_translator';
let nativePort, languageCapable=false, checkingHost;
const panels=new Map(),catalogs=new Map();
async function localized(result) {
  const code=TranslatorI18n.catalogLocale(TranslatorLanguages.resolve(result.preferences.targetLanguage,locale()));
  if(!catalogs.has(code))catalogs.set(code,fetch(chrome.runtime.getURL(`_locales/${code}/messages.json`)).then(response=>{
    if(!response.ok)throw new Error(t('errorConnection'));
    return response.json();
  }).catch(error=>{catalogs.delete(code);throw error;}));
  return {...result,ui:{locale:code.replace('_','-'),messages:await catalogs.get(code)}};
}
function watchPanel(sender) {
  if(!sender.tab)return;
  panels.set(owner(sender),{tabId:sender.tab.id,frameId:sender.frameId||0,documentId:sender.documentId});
  if(panels.size>200)panels.delete(panels.keys().next().value);
}
function notifySettings(result,sender) {
  for(const [key,panel] of panels){
    if(key===owner(sender))continue;
    chrome.tabs.sendMessage(panel.tabId,{type:'settings-updated',preferences:result.preferences,effective:result.effective,ui:result.ui},{frameId:panel.frameId,documentId:panel.documentId}).catch(()=>panels.delete(key));
  }
}
async function hello() {
  const result=await request('hello');
  languageCapable=result.capabilities?.targetLanguage===true;
  if(!languageCapable)throw new Error(t('errorUpdateHost'));
  return result;
}
async function ensureHost() {
  if(languageCapable)return;
  if(!checkingHost)checkingHost=hello().finally(()=>{checkingHost=null;});
  await checkingHost;
}
const pending = new Map();
const routes = new Map();
const owners = new Map();
function owner(sender) { return `${sender.tab?.id}:${sender.frameId || 0}:${sender.documentId || ''}`; }
function connect() {
  if(nativePort) return nativePort;
  const port = chrome.runtime.connectNative(HOST); nativePort = port;
  port.onMessage.addListener(message => {
    if(message.type==='error')message={...message,error:displayError({code:message.errorCode,args:message.errorArgs,message:message.error})};
    const route = routes.get(message.id);
    if(route) {
      chrome.tabs.sendMessage(route.tabId,{...message,type:'translation-event',event:message.type},{frameId:route.frameId,documentId:route.documentId}).catch(()=>{});
      if(message.type === 'done' || message.type === 'error') routes.delete(message.id);
    }
    const p = pending.get(message.id);
    if(p) { clearTimeout(p.timer); pending.delete(message.id); message.type === 'error' ? p.reject(Object.assign(new Error(message.error),{code:message.errorCode,args:message.errorArgs})) : p.resolve(message); }
  });
  port.onDisconnect.addListener(()=>{
    const error = chrome.runtime.lastError?.message || t('errorHostDisconnected');
    nativePort = null; languageCapable=false;
    const message = t('errorHostConnect',[error]);
    for(const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error(message)); } pending.clear();
    for(const [id,route] of routes) chrome.tabs.sendMessage(route.tabId,{type:'translation-event',id,event:'error',error:message},{frameId:route.frameId,documentId:route.documentId}).catch(()=>{});
    routes.clear(); owners.clear();
  });
  return port;
}
function request(type,data={}) {
  const id = crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    const timer = setTimeout(()=>{pending.delete(id);reject(new Error(t('errorHostTimeout')));},60000);
    pending.set(id,{resolve,reject,timer});
    try {connect().postMessage({id,type,...data,uiLanguage:locale()});} catch(e) {clearTimeout(timer);pending.delete(id);reject(e);}
  });
}
async function menu() { await chrome.contextMenus.removeAll(); chrome.contextMenus.create({id:'quick-translate',title:t('appName'),contexts:['selection']}); }
chrome.runtime.onInstalled.addListener(menu);
chrome.runtime.onStartup.addListener(menu);
async function openTranslation(tab,frameId=0,selectionText) {
  if(!tab?.id) return;
  try {
    await chrome.scripting.executeScript({target:{tabId:tab.id,frameIds:[frameId]},files:['i18n.js','languages.js','settings-ui.js','content.js']});
    await chrome.tabs.sendMessage(tab.id,{type:'open-translator',selectionText},{frameId});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
    await chrome.action.setTitle({tabId:tab.id,title:t('settingsTitle')});
  } catch {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setBadgeBackgroundColor({tabId:tab.id,color:'#b46a4c'});
    await chrome.action.setTitle({tabId:tab.id,title:t('errorPage')});
  }
}
chrome.contextMenus.onClicked.addListener((info,tab)=>{if(info.menuItemId==='quick-translate') void openTranslation(tab,info.frameId||0,info.selectionText);});
chrome.commands.onCommand.addListener(async command=>{if(command==='translate-selection') {const [tab]=await chrome.tabs.query({active:true,currentWindow:true});void openTranslation(tab);}});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  if(sender.id !== chrome.runtime.id) return;
  (async()=>{
    if(!msg || typeof msg !== 'object' || Array.isArray(msg)) throw new Error(t('errorRequest'));
    const source = new URL(sender.url || '');
    const ownOptions = source.href === `chrome-extension://${chrome.runtime.id}/options.html`;
    if(!(sender.tab && ['https:','http:'].includes(source.protocol)) && !ownOptions) throw new Error(t('errorSender'));
    if(msg.type === 'hello') {watchPanel(sender);return localized(await hello());}
    if(msg.type === 'panel-closed' && sender.tab) {panels.delete(owner(sender));return {ok:true};}
    if(msg.type === 'settings') {
      const p=msg.preferences;
      if(!p || typeof p.model!=='string' || p.model.length>160 || typeof p.effort!=='string' || p.effort.length>20 || typeof p.fast!=='boolean' || typeof p.notesPath!=='string' || p.notesPath.length>2048 || typeof p.targetLanguage!=='string') throw new Error(t('errorSettings'));
      const targetLanguage=TranslatorLanguages.normalize(p.targetLanguage);
      await ensureHost();
      const result=await localized(await request('settings',{preferences:{model:p.model,effort:p.effort,fast:p.fast,notesPath:p.notesPath,targetLanguage}}));
      notifySettings(result,sender);
      return result;
    }
    if(msg.type === 'translate' && sender.tab) {
      if(typeof msg.id !== 'string' || !msg.id || msg.id.length > 120 || owners.has(msg.id)) throw new Error(t('errorRequest'));
      if(!msg.data || typeof msg.data.selected!=='string' || !msg.data.selected.trim() || msg.data.selected.length>12000) throw new Error(t('errorSelectText'));
      await ensureHost();
      if(owners.has(msg.id))throw new Error(t('errorRequest'));
      const data={selected:msg.data.selected,title:String(msg.data.title||'').slice(0,500),url:source.href,nearby:String(msg.data.nearby||'').slice(0,5000),main:String(msg.data.main||'').slice(0,16000)};
      const key = owner(sender);
      for(const [id,route] of routes) if(route.owner === key) {connect().postMessage({id:crypto.randomUUID(),type:'cancel',target:id});routes.delete(id);}
      routes.set(msg.id,{tabId:sender.tab.id,frameId:sender.frameId||0,documentId:sender.documentId,owner:key});
      owners.set(msg.id,key); if(owners.size > 200) owners.delete(owners.keys().next().value);
      connect().postMessage({id:msg.id,type:'translate',data,uiLanguage:locale()}); return {ok:true};
    }
    if((msg.type === 'save' || msg.type === 'cancel') && sender.tab) {
      if(owners.get(msg.target) !== owner(sender)) throw new Error(t('errorExpired'));
      if(msg.type === 'cancel') routes.delete(msg.target);
      return request(msg.type,{target:msg.target});
    }
    throw new Error(t('errorRequest'));
  })().then(result=>reply({ok:true,...result}),e=>reply({ok:false,error:displayError(e),errorCode:e.code,errorArgs:e.args}));
  return true;
});
chrome.tabs.onRemoved.addListener(tabId=>{
  for(const [key,panel] of panels)if(panel.tabId===tabId)panels.delete(key);
  for(const [id,route] of routes) if(route.tabId===tabId) {if(nativePort) nativePort.postMessage({id:crypto.randomUUID(),type:'cancel',target:id});routes.delete(id);}
  for(const [id,key] of owners) if(key.startsWith(`${tabId}:`)) owners.delete(id);
});
