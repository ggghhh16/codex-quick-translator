const $ = id => document.getElementById(id);
const {t,locale,apply,error:displayError}=TranslatorI18n;
document.documentElement.lang=locale();document.documentElement.dir=TranslatorLanguages.direction(locale());apply(document);
if(!locale().startsWith('zh'))document.querySelector('[data-i18n="privacyPolicy"]').href='https://github.com/ggghhh16/codex-quick-translator/blob/main/PRIVACY.en.md';
let models = [];
async function ask(message) { const r=await chrome.runtime.sendMessage(message);if(!r?.ok)throw new Error(r?.error||t('errorConnection'));return r; }
function effective() {
  const m=models.find(m=>m.model===$('model').value);if(!m)return;
  const info=TranslatorSettings.speedInfo(m);
  $('fast-label').textContent=`⚡ ${info.label}`;
  $('fast').disabled=!info.supported;
  $('effective').textContent=info.hint;
}
function modelChanged(preferred=$('effort').value){const m=models.find(m=>m.model===$('model').value);if(!m)return;TranslatorSettings.fillEfforts($('effort'),m,preferred);effective();}
async function load() {
  $('extension-id').textContent=t('extensionId',chrome.runtime.id);
  $('install-command').textContent=`powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\install.ps1 -ExtensionId ${chrome.runtime.id}`;
  try {
    const r=await ask({type:'hello'});models=r.models;
    $('model').replaceChildren(...models.map(m=>{const o=document.createElement('option');o.value=m.model;o.textContent=m.displayName||m.model;return o;}));
    $('model').value=r.preferences.model;$('fast').checked=r.preferences.fast;$('path').value=r.preferences.notesPath;
    TranslatorLanguages.fill($('target-language'),$('custom-language'),r.preferences.targetLanguage,locale(),t);
    $('model').disabled=false;$('save').disabled=false;$('connection').textContent='● '+t('connected');modelChanged(r.preferences.effort);
  } catch(e){$('connection').textContent=displayError(e);$('connection').classList.add('error');$('help').open=true;}
}
$('model').onchange=()=>modelChanged();$('fast').onchange=effective;
$('settings').onsubmit=async e=>{e.preventDefault();$('save').disabled=true;try{await ask({type:'settings',preferences:{model:$('model').value,effort:$('effort').value,fast:$('fast').checked,notesPath:$('path').value.trim(),targetLanguage:TranslatorLanguages.read($('target-language'),$('custom-language'))}});$('status').textContent=t('settingsSaved');$('status').className='';}catch(error){$('status').textContent=displayError(error);$('status').className='error';}finally{$('save').disabled=false;}};
void load();
