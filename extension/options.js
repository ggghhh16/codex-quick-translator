const $ = id => document.getElementById(id);
let models = [];
async function ask(message) { const r=await chrome.runtime.sendMessage(message);if(!r?.ok)throw new Error(r?.error||'无法连接扩展');return r; }
function effective() {
  const m=models.find(m=>m.model===$('model').value);if(!m)return;
  const info=TranslatorSettings.speedInfo(m);
  $('fast-label').textContent=`⚡ ${info.label}`;
  $('fast').disabled=!info.supported;
  $('effective').textContent=info.hint;
}
function modelChanged(preferred=$('effort').value){const m=models.find(m=>m.model===$('model').value);if(!m)return;TranslatorSettings.fillEfforts($('effort'),m,preferred);effective();}
async function load() {
  $('extension-id').textContent=`扩展 ID：${chrome.runtime.id}`;
  try {
    const r=await ask({type:'hello'});models=r.models;
    $('model').replaceChildren(...models.map(m=>{const o=document.createElement('option');o.value=m.model;o.textContent=m.displayName||m.model;return o;}));
    $('model').value=r.preferences.model;$('fast').checked=r.preferences.fast;$('path').value=r.preferences.notesPath;
    $('model').disabled=false;$('save').disabled=false;$('connection').textContent='● 本地 Codex 已连接';modelChanged(r.preferences.effort);
  } catch(e){$('connection').textContent=e.message;$('connection').classList.add('error');$('help').open=true;}
}
$('model').onchange=()=>modelChanged();$('fast').onchange=effective;
$('settings').onsubmit=async e=>{e.preventDefault();$('save').disabled=true;try{await ask({type:'settings',preferences:{model:$('model').value,effort:$('effort').value,fast:$('fast').checked,notesPath:$('path').value.trim()}});$('status').textContent='设置已保存。下一次翻译生效。';$('status').className='';}catch(error){$('status').textContent=error.message;$('status').className='error';}finally{$('save').disabled=false;}};
void load();
