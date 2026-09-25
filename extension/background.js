const HOST = 'com.local.codex_quick_translator';
let nativePort;
const pending = new Map();
const routes = new Map();
const owners = new Map();
function owner(sender) { return `${sender.tab?.id}:${sender.frameId || 0}:${sender.documentId || ''}`; }
function connect() {
  if(nativePort) return nativePort;
  const port = chrome.runtime.connectNative(HOST); nativePort = port;
  port.onMessage.addListener(message => {
    const route = routes.get(message.id);
    if(route) {
      chrome.tabs.sendMessage(route.tabId,{...message,type:'translation-event',event:message.type},{frameId:route.frameId,documentId:route.documentId}).catch(()=>{});
      if(message.type === 'done' || message.type === 'error') routes.delete(message.id);
    }
    const p = pending.get(message.id);
    if(p) { clearTimeout(p.timer); pending.delete(message.id); message.type === 'error' ? p.reject(new Error(message.error)) : p.resolve(message); }
  });
  port.onDisconnect.addListener(()=>{
    const error = chrome.runtime.lastError?.message || '本地连接已断开';
    nativePort = null;
    const message = `无法连接本地翻译程序：${error}。请运行安装脚本，然后重试。`;
    for(const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error(message)); } pending.clear();
    for(const [id,route] of routes) chrome.tabs.sendMessage(route.tabId,{type:'translation-event',id,event:'error',error:message},{frameId:route.frameId,documentId:route.documentId}).catch(()=>{});
    routes.clear(); owners.clear();
  });
  return port;
}
function request(type,data={}) {
  const id = crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    const timer = setTimeout(()=>{pending.delete(id);reject(new Error('本地程序响应超时，请重试。'));},60000);
    pending.set(id,{resolve,reject,timer});
    try {connect().postMessage({id,type,...data});} catch(e) {clearTimeout(timer);pending.delete(id);reject(e);}
  });
}
async function menu() { await chrome.contextMenus.removeAll(); chrome.contextMenus.create({id:'quick-translate',title:'快速翻译',contexts:['selection']}); }
chrome.runtime.onInstalled.addListener(menu);
chrome.runtime.onStartup.addListener(menu);
async function openTranslation(tab,frameId=0,selectionText) {
  if(!tab?.id) return;
  try {
    await chrome.scripting.executeScript({target:{tabId:tab.id,frameIds:[frameId]},files:['settings-ui.js','content.js']});
    await chrome.tabs.sendMessage(tab.id,{type:'open-translator',selectionText},{frameId});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
    await chrome.action.setTitle({tabId:tab.id,title:'快速翻译设置'});
  } catch {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setBadgeBackgroundColor({tabId:tab.id,color:'#b46a4c'});
    await chrome.action.setTitle({tabId:tab.id,title:'此页面不允许扩展读取。请在普通网页使用快速翻译。'});
  }
}
chrome.contextMenus.onClicked.addListener((info,tab)=>{if(info.menuItemId==='quick-translate') void openTranslation(tab,info.frameId||0,info.selectionText);});
chrome.commands.onCommand.addListener(async command=>{if(command==='translate-selection') {const [tab]=await chrome.tabs.query({active:true,currentWindow:true});void openTranslation(tab);}});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  if(sender.id !== chrome.runtime.id) return;
  (async()=>{
    if(!msg || typeof msg !== 'object' || Array.isArray(msg)) throw new Error('无效请求');
    const source = new URL(sender.url || '');
    const ownOptions = source.href === `chrome-extension://${chrome.runtime.id}/options.html`;
    if(!(sender.tab && ['https:','http:'].includes(source.protocol)) && !ownOptions) throw new Error('不允许此页面访问本地翻译程序');
    if(msg.type === 'hello') return request('hello');
    if(msg.type === 'settings') {
      const p=msg.preferences;
      if(!p || typeof p.model!=='string' || p.model.length>160 || typeof p.effort!=='string' || p.effort.length>20 || typeof p.fast!=='boolean' || typeof p.notesPath!=='string' || p.notesPath.length>2048) throw new Error('设置格式无效');
      return request('settings',{preferences:{model:p.model,effort:p.effort,fast:p.fast,notesPath:p.notesPath}});
    }
    if(msg.type === 'translate' && sender.tab) {
      if(typeof msg.id !== 'string' || !msg.id || msg.id.length > 120 || owners.has(msg.id)) throw new Error('请求无效或编号重复');
      if(!msg.data || typeof msg.data.selected!=='string' || !msg.data.selected.trim() || msg.data.selected.length>12000) throw new Error('选中文字无效或过长');
      const data={selected:msg.data.selected,title:String(msg.data.title||'').slice(0,500),url:source.href,nearby:String(msg.data.nearby||'').slice(0,5000),main:String(msg.data.main||'').slice(0,16000)};
      const key = owner(sender);
      for(const [id,route] of routes) if(route.owner === key) {connect().postMessage({id:crypto.randomUUID(),type:'cancel',target:id});routes.delete(id);}
      routes.set(msg.id,{tabId:sender.tab.id,frameId:sender.frameId||0,documentId:sender.documentId,owner:key});
      owners.set(msg.id,key); if(owners.size > 200) owners.delete(owners.keys().next().value);
      connect().postMessage({id:msg.id,type:'translate',data}); return {ok:true};
    }
    if((msg.type === 'save' || msg.type === 'cancel') && sender.tab) {
      if(owners.get(msg.target) !== owner(sender)) throw new Error('此翻译已失效，请重新翻译。');
      if(msg.type === 'cancel') routes.delete(msg.target);
      return request(msg.type,{target:msg.target});
    }
    throw new Error('无效请求');
  })().then(result=>reply({ok:true,...result}),e=>reply({ok:false,error:e.message}));
  return true;
});
chrome.tabs.onRemoved.addListener(tabId=>{
  for(const [id,route] of routes) if(route.tabId===tabId) {if(nativePort) nativePort.postMessage({id:crypto.randomUUID(),type:'cancel',target:id});routes.delete(id);}
  for(const [id,key] of owners) if(key.startsWith(`${tabId}:`)) owners.delete(id);
});
