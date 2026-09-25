(() => {
  if(globalThis.__localCodexTranslator) return;
  globalThis.__localCodexTranslator = true;
  const {t,locale,apply,error:displayError,setCatalog}=TranslatorI18n.create();
  const svg = (body) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const icons = {
    flag:svg('<path d="M5 21V4c4-4 9 4 14 0v11c-5 4-10-4-14 0"/>'),
    gear:svg('<path d="m9 3-.6 2.1-1.8 1L4.5 6 3 8.6l1.5 1.6v2L3 14l1.5 2.6 2.1-.1 1.8 1L9 20h3l.6-2.5 1.8-1 2.1.1L18 14l-1.5-1.8v-2L18 8.6 16.5 6l-2.1.1-1.8-1L12 3Z"/><circle cx="10.5" cy="11.5" r="3"/>'),
    close:svg('<path d="m6 6 12 12M6 18 18 6"/>'),
    bolt:svg('<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>'),
    check:svg('<path d="m5 12 4 4L19 6"/>'),
    arrow:svg('<path d="M5 12h14m-5-5 5 5-5 5"/>'),
    copy:svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>')
  };
  let host, shadow, ui, data, requestId, raw = '', done = false, prefs, models = [], started = 0, ticker, lastEffective, lastStatus, loadingHost;
  const ask = async msg => { const r = await chrome.runtime.sendMessage(msg); if(!r?.ok) throw Object.assign(new Error(r?.error || t('errorConnection')),{code:r?.errorCode,args:r?.errorArgs}); return r; };
  function collect(fallback) {
    const selection = window.getSelection();
    let selected = selection?.toString().trim() || fallback?.trim() || '';
    let rect = selection?.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : null;
    let element = selection?.anchorNode?.parentElement;
    const active = document.activeElement;
    if(active && /^(TEXTAREA|INPUT)$/.test(active.tagName) && active.type !== 'password' && active.selectionStart !== null) {
      selected = active.value.slice(active.selectionStart,active.selectionEnd) || selected;
      rect = active.getBoundingClientRect(); element = active.parentElement;
    }
    if(!selected) throw new Error(t('errorSelectText'));
    if(selected.length > 12000) throw new Error(t('errorSelectionLarge'));
    const nearby = element?.closest('p,li,section,article,main')?.innerText || element?.innerText || '';
    const candidates = [...document.querySelectorAll('article,main,[role="main"]')];
    const main = candidates.sort((a,b)=>b.innerText.length-a.innerText.length)[0] || document.body;
    const parts = []; let count = 0;
    for(const node of main.querySelectorAll('h1,h2,h3,p,li,blockquote,pre')) {
      if(node.closest('nav,header,footer,aside,script,style,[hidden],[aria-hidden="true"]') || !node.getClientRects().length) continue;
      if(node.parentElement?.closest('p,li,blockquote,pre')) continue;
      const text = node.innerText?.trim();
      if(text) {parts.push(text);count+=text.length;} if(count >= 16000) break;
    }
    // innerText excludes script/style and hidden DOM; collected content is bounded.
    const mainText = (parts.length ? parts.join('\n\n') : main.innerText || '').slice(0,16000);
    return {selected,title:document.title,url:location.href,nearby:nearby.slice(0,5000),main:mainText,rect:rect && {left:rect.left,top:rect.top,bottom:rect.bottom,right:rect.right}};
  }
  const css = `
    :host { all:initial; color-scheme:dark; font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif; font-size:14px; color:#e6e5e2; }
    * {box-sizing:border-box} button,input,select {font:inherit} button {cursor:pointer} button:disabled{cursor:default;opacity:.4}
    button:focus-visible,input:focus-visible,select:focus-visible {outline:2px solid #b4c5ba;outline-offset:3px}
    .panel {position:fixed;width:460px;height:530px;display:flex;flex-direction:column;background:#20201f;border:1px solid #454541;border-radius:15px;box-shadow:0 18px 70px #0008,0 3px 12px #0005;overflow:hidden;color:#e6e5e2;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;font-size:14px;line-height:1.7;text-align:start;letter-spacing:normal}
    .bar {display:flex;align-items:center;gap:7px;padding:13px 15px;border-bottom:1px solid #ffffff0e;cursor:move;touch-action:none;user-select:none;flex-shrink:0}
    .brand {display:flex;align-items:center;gap:9px;flex:1;font-size:13px;font-weight:600}.mark{font-family:Georgia,serif;font-size:16px;border:1px solid #77766f;border-radius:4px;line-height:23px;width:25px;text-align:center}
    .icon {display:inline-flex;align-items:center;justify-content:center;background:transparent;border:0;color:#a3a39d;width:29px;height:29px;border-radius:6px;padding:0}.icon:hover {background:#ffffff0b;color:#fff}.icon.active{color:#b7cfb9;background:#b7cfb912}
    .body {overflow:auto;padding:20px 24px;flex:1;min-height:0;scrollbar-width:thin;scrollbar-color:#4a4a45 transparent}
    .eyebrow {color:#92928b;font-size:10px;letter-spacing:1.6px;font-weight:600;margin:0 0 9px}.source {white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;color:#b9b9b1;max-height:116px;overflow:auto;margin:0;padding-inline-start:12px;border-inline-start:2px solid #65655c}
    .divider{height:1px;background:#ffffff10;margin:19px 0}.translation h2{font-size:12px;color:#adada5;font-weight:600;margin:19px 0 9px;letter-spacing:.5px}.translation h2:first-child{margin-top:0}.translation p{white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 10px;font-size:14px;line-height:1.85}.translation p.primary{font-size:17px;line-height:1.85;color:#f0efe9}
    .empty {color:#94948c;font-size:13px}.pulse{display:inline-block;width:6px;height:6px;background:#b7cfb9;border-radius:50%;margin-inline-end:8px;animation:pulse 1.2s infinite}@keyframes pulse{50%{opacity:.3}}
    .bottom {display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid #ffffff0e;padding:10px 18px;font-size:11px;color:#95958c;min-height:46px}.bottom-left{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status{overflow-wrap:anywhere;font-size:12px;color:#b0b6a4;margin-top:12px}.status.error {color:#e8aa96}.actions{display:flex;align-items:center;gap:5px}
    .text-button {border:0;border-radius:5px;background:transparent;color:#b7b7b0;font-size:11px;padding:4px 7px}.text-button:hover{background:#ffffff0a;color:#fff}
    .settings {display:none}.settings.visible {display:block}.reading.hidden {display:none} .section-title{font-size:18px;font-weight:600;margin:0 0 20px}.field{margin:17px 0}.field label{display:block;margin-bottom:7px;font-size:12px;color:#c0c0b8}.field input,.field select {width:100%;background:#292927;border:1px solid #45453f;border-radius:7px;color:#e9e9e2;padding:9px 10px;min-width:0;font-size:12px}.hint{font-size:11px;color:#92928b;line-height:1.7;margin-top:7px}.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.switch{display:flex;align-items:center;gap:6px;background:#30312c;border:1px solid #484b41;color:#c0c9ac;border-radius:20px;padding:5px 10px;font-size:12px}.switch[aria-checked="false"]{color:#92928b;background:#292927;border-color:#45453f}.save-settings{width:100%;border:1px solid #d5d6cb;background:#d5d6cb;color:#22241f;border-radius:7px;padding:9px;margin-top:14px;font-size:12px;font-weight:600}.privacy{font-size:10px;color:#84847d;line-height:1.7;margin-top:16px}
    .handle {position:absolute;width:16px;height:16px;touch-action:none;z-index:2}.nw{top:0;left:0;cursor:nwse-resize}.ne{top:0;right:0;cursor:nesw-resize}.sw{bottom:0;left:0;cursor:nesw-resize}.se{bottom:0;right:0;cursor:nwse-resize}.handle::after {content:'';position:absolute;width:5px;height:5px;opacity:.35;border-color:#b3b3a6;border-style:solid}.nw::after{top:5px;left:5px;border-width:1px 0 0 1px}.ne::after{top:5px;right:5px;border-width:1px 1px 0 0}.sw::after{bottom:5px;left:5px;border-width:0 0 1px 1px}.se::after{bottom:5px;right:5px;border-width:0 1px 1px 0}
    [hidden]{display:none!important} #custom-language{margin-top:8px}
    @media(prefers-reduced-motion:reduce){.pulse{animation:none}}
  `;
  function mount(rect) {
    if(host) close();
    raw='';lastEffective=null;lastStatus=null;prefs=null;models=[];
    host = document.createElement('div');
    host.id = 'local-codex-quick-translator';
    host.style.cssText='all:initial!important;position:fixed!important;inset:0!important;width:0!important;height:0!important;z-index:2147483647!important;';
    shadow = host.attachShadow({mode:'closed'});
    shadow.innerHTML=`<style>${css}</style><section class="panel" role="dialog" data-i18n-aria="appName" tabindex="-1">
      <header class="bar"><div class="brand"><span class="mark" aria-hidden="true">文</span><span data-i18n="appName"></span></div><button class="icon flag" data-i18n-title="saveNote" data-i18n-aria="saveNote" disabled>${icons.flag}</button><button class="icon gear" data-i18n-title="settings" data-i18n-aria="settings">${icons.gear}</button><button class="icon close" data-i18n-title="closeEsc" data-i18n-aria="close">${icons.close}</button></header>
      <div class="body"><div class="reading"><div class="eyebrow" data-i18n="original"></div><blockquote class="source" dir="auto"></blockquote><div class="divider"></div><div class="translation" aria-busy="true"></div></div>
      <form class="settings"><h1 class="section-title" data-i18n="translationSettings"></h1>
      <div class="field"><label for="target-language" data-i18n="targetLanguage"></label><select id="target-language"></select><input id="custom-language" dir="ltr" hidden maxlength="50" data-i18n-placeholder="languageCode" data-i18n-aria="languageCodeLabel" spellcheck="false"><div class="hint" data-i18n="targetHint"></div></div>
      <div class="field"><label for="model" data-i18n="model"></label><select id="model" name="model"><option data-i18n="connecting"></option></select></div><div class="field"><label for="effort" data-i18n="effort"></label><select id="effort" name="effort" disabled><option data-i18n="loading"></option></select><div class="hint" data-i18n="effortHint"></div></div>
      <div class="field"><div class="toggle-row"><label class="fast-label" data-i18n="fastMode"></label><button class="switch" type="button" role="switch" aria-checked="true">${icons.bolt}<span data-i18n="enabled"></span></button></div><div class="hint speed-hint" data-i18n="speedHint"></div></div><div class="field"><label for="notes-path" data-i18n="notesPath"></label><input id="notes-path" name="path" dir="ltr" placeholder="D:\\Notes\\translations.md" spellcheck="false" required><div class="hint" data-i18n="notesHint"></div></div><button class="save-settings" type="submit" disabled data-i18n="saveSettings"></button><div class="privacy" data-i18n="privacyShort"></div></form><div class="status" role="status" aria-live="polite"></div></div>
      <footer class="bottom"><span class="bottom-left"></span><div class="actions"><button class="text-button retry" hidden data-i18n="retry"></button><button class="text-button stop" data-i18n="stop"></button><button class="icon copy" data-i18n-title="copy" data-i18n-aria="copy" disabled>${icons.copy}</button></div></footer>
      ${['nw','ne','sw','se'].map(c=>`<div class="handle ${c}" data-corner="${c}" aria-hidden="true"></div>`).join('')}
    </section>`;
    apply(shadow);
    document.documentElement.append(host);
    ui = sel => shadow.querySelector(sel);
    ui('.bottom-left').textContent=t('connecting');
    const panel = ui('.panel'); panel.lang=locale();panel.dir=TranslatorLanguages.direction(locale()); const w=Math.min(460,innerWidth-16),h=Math.min(530,innerHeight-16);
    let x=Math.max(8,Math.min(rect?.left || 24,innerWidth-w-8));
    let y=rect ? rect.bottom+10 : 60;
    if(y+h>innerHeight-8) y=rect && rect.top-h-10>=8 ? rect.top-h-10 : innerHeight-h-8;
    Object.assign(panel.style,{left:`${x}px`,top:`${Math.max(8,y)}px`,width:`${w}px`,height:`${h}px`});
    ui('.close').onclick=close;
    ui('.gear').onclick=()=>{const showing=ui('.settings').classList.toggle('visible');ui('.reading').classList.toggle('hidden',showing);ui('.gear').classList.toggle('active',showing);if(showing&&!prefs)void loadSettings();};
    ui('.flag').onclick=save;
    ui('.stop').onclick=()=>void stop();
    ui('.retry').onclick=()=>void beginTranslation();
    ui('.copy').onclick=async()=>{try {await navigator.clipboard.writeText(raw);statusKey('copied');}catch{statusKey('copyFailed',[],true);}};
    ui('.settings').onsubmit=async event=>{event.preventDefault();const panelHost=host,button=ui('.save-settings');button.disabled=true;try {const r=await ask({type:'settings',preferences:{model:ui('#model').value,effort:ui('#effort').value,fast:ui('.switch').getAttribute('aria-checked')==='true',notesPath:ui('#notes-path').value.trim(),targetLanguage:TranslatorLanguages.read(ui('#target-language'),ui('#custom-language'))}});if(host!==panelHost)return;updateSettings(r);statusKey('settingsSaved');}catch(e){if(host===panelHost)status(displayError(e),true);}finally{button.disabled=false;}};
    ui('.switch').onclick=()=>{const on=ui('.switch').getAttribute('aria-checked')!=='true';toggle(on);speedHint();};
    ui('#model').onchange=()=>{fillEfforts(ui('#effort').value);speedHint();};
    shadow.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape') close();});
    drag(panel,ui('.bar'));
    for(const handle of shadow.querySelectorAll('.handle')) drag(panel,handle,handle.dataset.corner);
    panel.focus({preventScroll:true});
  }
  function drag(panel,target,corner) {
    target.addEventListener('pointerdown',e=>{
      if(e.button!==0 || e.target.closest('button')) return;
      e.preventDefault();target.setPointerCapture(e.pointerId);
      const r=panel.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;
      const move=ev=>{
        const dx=ev.clientX-sx,dy=ev.clientY-sy;let l=r.left,t=r.top,rr=r.right,b=r.bottom;
        if(!corner){l=Math.max(8,Math.min(innerWidth-r.width-8,l+dx));t=Math.max(8,Math.min(innerHeight-r.height-8,t+dy));rr=l+r.width;b=t+r.height;}
        else {const mw=Math.min(320,innerWidth-16),mh=Math.min(260,innerHeight-16);if(corner.includes('w')) l=Math.max(8,Math.min(rr-mw,r.left+dx));else rr=Math.min(innerWidth-8,Math.max(l+mw,r.right+dx));if(corner.includes('n'))t=Math.max(8,Math.min(b-mh,r.top+dy));else b=Math.min(innerHeight-8,Math.max(t+mh,r.bottom+dy));}
        Object.assign(panel.style,{left:`${l}px`,top:`${t}px`,width:`${rr-l}px`,height:`${b-t}px`});
      };
      const end=()=>{target.removeEventListener('pointermove',move);target.removeEventListener('pointerup',end);target.removeEventListener('pointercancel',end);};
      target.addEventListener('pointermove',move);target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);
    });
  }
  function status(text,error=false){if(!host)return;lastStatus={text,error};ui('.status').textContent=text;ui('.status').classList.toggle('error',error);}
  function statusKey(key,args=[],error=false){status(t(key,args),error);lastStatus={key,args,error};}
  function toggle(on){ui('.switch').setAttribute('aria-checked',String(on));ui('.switch span').textContent=t(on?'enabled':'disabled');}
  function fillEfforts(preferred){const m=models.find(m=>m.model===ui('#model').value);if(m)TranslatorSettings.fillEfforts(ui('#effort'),m,preferred,t);}
  function speedHint(){const m=models.find(m=>m.model===ui('#model').value);if(!m)return;const info=TranslatorSettings.speedInfo(m,t);ui('.fast-label').textContent=info.label;ui('.speed-hint').textContent=info.hint;ui('.switch').disabled=!info.supported;}
  function effective(settings){if(!host||!settings)return;lastEffective=settings;const language=settings.targetLanguage||TranslatorLanguages.resolve(prefs?.targetLanguage,chrome.i18n.getUILanguage());ui('.translation').lang=language;ui('.translation').dir=TranslatorLanguages.direction(language);ui('.bottom-left').textContent=`${settings.model} · ${settings.effort} · ${TranslatorLanguages.name(language,locale())}${settings.serviceTier!=='default'?' · ⚡':''}`;}
  function updateSettings(r){
    prefs=r.preferences;models=r.models||models;
    if(r.ui)setCatalog(r.ui);
    apply(shadow);ui('.panel').lang=locale();ui('.panel').dir=TranslatorLanguages.direction(locale());
    TranslatorLanguages.fill(ui('#target-language'),ui('#custom-language'),prefs.targetLanguage,locale(),t);
    const select=ui('#model');select.replaceChildren(...models.map(m=>{const o=document.createElement('option');o.value=m.model;o.textContent=m.displayName||m.model;return o;}));
    select.value=prefs.model;fillEfforts(prefs.effort);ui('#notes-path').value=prefs.notesPath;toggle(prefs.fast);speedHint();ui('.save-settings').disabled=false;
    // Existing output keeps its own language and direction; changing UI does not regenerate it.
    effective(lastEffective||r.effective);
    if(lastStatus?.key)statusKey(lastStatus.key,lastStatus.args,lastStatus.error);
  }
  async function loadSettings(){const panelHost=host;if(loadingHost===panelHost)return false;loadingHost=panelHost;try{const r=await ask({type:'hello'});if(host!==panelHost)return false;updateSettings(r);return true;}catch(e){if(host===panelHost)status(displayError(e),true);return false;}finally{if(loadingHost===panelHost)loadingHost=null;}}
  async function beginTranslation(){const panelHost=host;const ready=prefs||await loadSettings();if(host!==panelHost)return;if(ready)await translate();else finish(lastStatus?.text||t('errorConnection'));}
  function render(text){
    if(!host)return;const area=ui('.translation');area.replaceChildren();let primary=false,headingCount=0;
    for(const block of text.split(/\n(?=## )|(?<=\n)\n/)){
      const lines=block.trim().split('\n');if(!lines[0])continue;
      if(/^##\s/.test(lines[0])){const h=document.createElement('h2');h.textContent=lines.shift().replace(/^##\s+/,'');primary=++headingCount===1;area.append(h);}
      if(lines.length){const p=document.createElement('p');p.textContent=lines.join('\n');if(primary)p.className='primary';area.append(p);}
    }
  }
  async function translate(){
    if(!host || !data)return;
    if(requestId && !done) ask({type:'cancel',target:requestId}).catch(()=>{});
    requestId=crypto.randomUUID();raw='';done=false;started=performance.now();
    ui('.source').textContent=data.selected;ui('.flag').disabled=true;ui('.flag').classList.remove('active');ui('.flag').innerHTML=icons.flag;ui('.copy').disabled=true;ui('.stop').hidden=false;ui('.retry').hidden=true;
    ui('.translation').dir=TranslatorLanguages.direction(locale());ui('.translation').innerHTML='<div class="empty"><span class="pulse"></span><span data-i18n="translatingContext"></span></div>';apply(ui('.translation'));ui('.translation').setAttribute('aria-busy','true');status('');
    clearInterval(ticker);ticker=setInterval(()=>{if(host&&!raw)statusKey('elapsed',[String(Math.floor((performance.now()-started)/1000))]);},1000);
    const id=requestId;
    try{const {rect,...payload}=data;await ask({type:'translate',id,data:payload});}catch(e){if(id===requestId)finish(displayError(e));}
  }
  function finish(error){clearInterval(ticker);if(!host)return;done=true;ui('.translation').setAttribute('aria-busy','false');ui('.stop').hidden=true;ui('.retry').hidden=false;ui('.copy').disabled=!raw;ui('.flag').disabled=!!error||!raw;if(error){if(!raw)ui('.translation').textContent=t('incomplete');status(error,true);}else statusKey('complete',[((performance.now()-started)/1000).toFixed(1)]);}
  async function stop(){if(requestId&&!done){ask({type:'cancel',target:requestId}).catch(()=>{});finish(t('stopped'));requestId=null;}}
  async function save(){const id=requestId;ui('.flag').disabled=true;try{const r=await ask({type:'save',target:id});if(id!==requestId||!host)return;ui('.flag').innerHTML=icons.check;ui('.flag').classList.add('active');statusKey('savedTo',[r.path]);}catch(e){if(id===requestId&&host){ui('.flag').disabled=false;status(displayError(e),true);}}}
  function close(){if(requestId&&!done)ask({type:'cancel',target:requestId}).catch(()=>{});ask({type:'panel-closed'}).catch(()=>{});clearInterval(ticker);host?.remove();host=null;requestId=null;}
  document.addEventListener('keydown',event=>{if(host&&event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}},true);
  window.addEventListener('resize',()=>{if(!host)return;const panel=ui('.panel'),r=panel.getBoundingClientRect();const w=Math.min(r.width,innerWidth-16),h=Math.min(r.height,innerHeight-16);Object.assign(panel.style,{width:`${w}px`,height:`${h}px`,left:`${Math.max(8,Math.min(r.left,innerWidth-w-8))}px`,top:`${Math.max(8,Math.min(r.top,innerHeight-h-8))}px`});});
  chrome.runtime.onMessage.addListener(msg=>{
    if(msg.type==='open-translator') {try{const collected=collect(msg.selectionText);mount(collected.rect);data=collected;void beginTranslation();}catch(e){mount();status(displayError(e),true);ui('.translation').textContent=t('errorSelectText');ui('.stop').hidden=true;}return;}
    if(msg.type==='settings-updated'&&host){updateSettings(msg);return;}
    if(msg.type==='translation-event'&&msg.id===requestId&&host){if(msg.text!==undefined){raw=msg.text;render(raw);effective(msg.settings);statusKey('translating');}if(msg.event==='done')finish();if(msg.event==='error')finish(displayError({code:msg.errorCode,args:msg.errorArgs,message:msg.error}));}
  });
})();
