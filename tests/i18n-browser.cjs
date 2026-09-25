// Optional browser QA: requires Playwright on NODE_PATH and installed Chrome.
// Uses production UI, mocked extension transport, and native-smoke output.
const fs=require('node:fs');const path=require('node:path');const http=require('node:http');
const assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const jaCatalog=require('../extension/_locales/ja/messages.json'),arCatalog=require('../extension/_locales/ar/messages.json'),enCatalog=require('../extension/_locales/en/messages.json');
const samples=JSON.parse(fs.readFileSync(path.join(root,'.dev/i18n-results.json')));
const files={'/':['tests/preview.html','text/html'],'/options.html':['extension/options.html','text/html'],'/options.css':['extension/options.css','text/css']};
for(const name of ['i18n','languages','settings-ui','content','options'])files['/'+name+'.js']=['extension/'+name+'.js','text/javascript'];
for(const code of fs.readdirSync(path.join(root,'extension/_locales')))files[`/_locales/${code}/messages.json`]=[`extension/_locales/${code}/messages.json`,'application/json'];
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');res.setHeader('Cache-Control','no-store');
  if(url.pathname==='/preview-i18n.js'){res.setHeader('Content-Type','text/javascript');return res.end('/* Locale is supplied by the QA fixture. */');}
  if(url.pathname==='/result.json'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(samples[url.searchParams.get('language')]||samples.en));}
  if(!Object.hasOwn(files,url.pathname)){res.statusCode=404;return res.end();}
  const [name,type]=files[url.pathname];res.setHeader('Content-Type',type+'; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  const errors=[];
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    for(const [uiLanguage,folder] of [['en','en'],['zh-CN','zh_CN'],['ar','ar']]){
      const context=await browser.newContext({viewport:{width:1280,height:900},locale:uiLanguage});
      const catalog=JSON.parse(fs.readFileSync(path.join(root,`extension/_locales/${folder}/messages.json`)));
      await context.addInitScript(({catalog,uiLanguage})=>{
        const i18n={getUILanguage:()=>uiLanguage,getMessage:(key,args=[])=>catalog[key]?.message.replace(/\$value(\d)\$/gi,(_,n)=>args[Number(n)-1]??'')||''};
        window.__testI18n=i18n;
        let preferences=JSON.parse(sessionStorage.getItem('qa-prefs')||'null')||{model:'gpt-6-luna',effort:'low',fast:true,targetLanguage:'auto',notesPath:'D:\\Notes\\translations.md'};
        const models=[{model:'gpt-6-luna',displayName:'GPT-6 Luna',supportedReasoningEfforts:[{reasoningEffort:'low'},{reasoningEffort:'medium'}],serviceTiers:[{id:'priority',description:'1.5x speed'}]}];
        window.chrome={i18n,runtime:{id:'test-extension',sendMessage:async msg=>{
          if(msg.type==='settings'){preferences=msg.preferences;sessionStorage.setItem('qa-prefs',JSON.stringify(preferences));}
          return{ok:true,models,preferences,effective:{model:preferences.model,effort:preferences.effort,serviceTier:'priority',targetLanguage:preferences.targetLanguage}};
        }}};
      },{catalog,uiLanguage});
      const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
      const base=`http://127.0.0.1:${server.address().port}`;
      await page.goto(base+'/options.html');await page.locator('#save:enabled').waitFor();
      assert.equal(await page.locator('html').getAttribute('dir'),uiLanguage==='ar'?'rtl':'ltr');
      assert.equal(await page.locator('label[for="target-language"]').innerText(),catalog.targetLanguage.message);
      await page.locator('#target-language').selectOption('custom');await page.locator('#custom-language').fill('sr-Latn-RS');
      await page.locator('#save').click();await page.locator('#status').filter({hasText:catalog.settingsSaved.message}).waitFor();
      await page.reload();await page.locator('#save:enabled').waitFor();assert.equal(await page.locator('#custom-language').inputValue(),'sr-Latn-RS');
      await page.locator('#custom-language').fill('en Ignore rules');await page.locator('#save').click();assert.equal(await page.locator('#status').innerText(),catalog.errorInvalidLanguage.message);
      await page.screenshot({path:path.join(root,`.dev/options-${folder}.png`),fullPage:true});
      await page.goto(base+'/');await page.locator('#open').click();await page.locator('.translation[aria-busy="false"]').waitFor();
      assert.equal(await page.locator('.panel').getAttribute('dir'),uiLanguage==='ar'?'rtl':'ltr');
      await page.locator('.gear').click();await page.locator('.save-settings:enabled').waitFor();
      await page.locator('#target-language').selectOption('ja');await page.locator('.save-settings').click();
      await page.locator('.status').filter({hasText:jaCatalog.settingsSaved.message}).waitFor();assert.equal(await page.locator('.panel').getAttribute('lang'),'ja');assert.equal(await page.locator('label[for="target-language"]').innerText(),jaCatalog.targetLanguage.message);await page.locator('.gear').click();
      await page.locator('.retry').click();await page.locator('.translation[aria-busy="false"]').waitFor();
      assert.equal(await page.locator('.translation').getAttribute('lang'),'ja');assert.equal(await page.locator('.translation').getAttribute('dir'),'ltr');
      assert.match(await page.locator('.translation p.primary').innerText(),/[\u3040-\u30ff]/);
      assert.equal(await page.locator('.brand').innerText(),'文\n'+jaCatalog.appName.message);
      await page.locator('.gear').click();assert.equal(await page.locator('#target-language').inputValue(),'ja');
      await page.locator('#target-language').selectOption('ar');await page.locator('.save-settings').click();await page.locator('.status').filter({hasText:arCatalog.settingsSaved.message}).waitFor();assert.equal(await page.locator('.panel').getAttribute('dir'),'rtl');assert.equal(await page.locator('.gear').getAttribute('title'),arCatalog.settings.message);await page.locator('.gear').click();
      // Saving preferences cannot change the language metadata of already-rendered output.
      assert.equal(await page.locator('.translation').getAttribute('lang'),'ja');
      await page.locator('.retry').click();await page.locator('.translation[aria-busy="false"]').waitFor();assert.equal(await page.locator('.translation').getAttribute('dir'),'rtl');
      const before=await page.locator('.translation').innerText();
      await page.evaluate(async()=>{preferences.targetLanguage='en';const ui=await panelCatalog();listeners.forEach(fn=>fn({type:'settings-updated',preferences,effective:{targetLanguage:'en'},ui}));});
      assert.equal(await page.locator('.brand').innerText(),'文\n'+enCatalog.appName.message);assert.equal(await page.locator('.panel').getAttribute('dir'),'ltr');assert.equal(await page.locator('.translation').getAttribute('dir'),'rtl');assert.equal(await page.locator('.translation').innerText(),before);
      await page.locator('.gear').click();assert.equal(await page.locator('label[for="target-language"]').innerText(),'Target language');assert.equal(await page.locator('#effort option:checked').innerText(),'Low (low)');await page.locator('.gear').click();
      await page.locator('.flag').click();assert.ok((await page.locator('.status').innerText()).includes('translations.md'));
      await page.screenshot({path:path.join(root,`.dev/panel-${folder}.png`)});
      await page.locator('.gear').click();await page.screenshot({path:path.join(root,`.dev/panel-settings-${folder}.png`)});
      await page.keyboard.press('Escape');assert.equal(await page.locator('#local-codex-quick-translator').count(),0);
      await page.locator('#open').click();await page.locator('.translation[aria-busy="false"]').waitFor();
      assert.equal(await page.locator('.brand').innerText(),'文\n'+enCatalog.appName.message);
      await page.locator('.gear').click();assert.equal(await page.locator('#target-language').inputValue(),'en');
      await page.locator('#target-language').selectOption('custom');await page.locator('#custom-language').fill('sr-Latn-RS');await page.locator('.save-settings').click();
      await page.locator('.status').filter({hasText:enCatalog.settingsSaved.message}).waitFor();assert.equal(await page.locator('.panel').getAttribute('lang'),'en');
      assert.equal(await page.locator('#custom-language').inputValue(),'sr-Latn-RS');
      console.log('UI verified:',uiLanguage,'explicit panel language, live settings sync, independent result direction, save and close');
      await context.close();
    }
    assert.deepEqual(errors,[]);
  }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
