const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files={'/settings-ui.js':['extension/settings-ui.js','text/javascript; charset=utf-8'],'/':['tests/preview.html','text/html; charset=utf-8'],'/content.js':['extension/content.js','text/javascript; charset=utf-8'],'/result.json':['.dev/preview-result.json','application/json; charset=utf-8']};
for(const name of ['i18n.js','languages.js'])files['/'+name]=['extension/'+name,'text/javascript; charset=utf-8'];
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');res.setHeader('Cache-Control','no-store');
  if(url.pathname==='/preview-i18n.js'){
    const catalog=fs.readFileSync(path.join(root,'extension/_locales/en/messages.json'),'utf8');
    res.setHeader('Content-Type','text/javascript; charset=utf-8');
    return res.end(`if(!window.__testI18n){const catalog=${catalog};window.__testI18n={getUILanguage:()=> 'en',getMessage:(key,args=[])=>catalog[key]?.message.replace(/\\$value(\\d)\\$/gi,(_,n)=>args[Number(n)-1]??'')||''};}`);
  }
  if(url.pathname==='/result.json'&&fs.existsSync(path.join(root,'.dev/i18n-results.json'))){
    const samples=JSON.parse(fs.readFileSync(path.join(root,'.dev/i18n-results.json')));
    res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(samples[url.searchParams.get('language')]||samples.en));
  }
  const entry=Object.hasOwn(files,url.pathname)&&files[url.pathname];if(!entry){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',entry[1]);fs.createReadStream(path.join(root,entry[0])).on('error',()=>{res.statusCode=500;res.end();}).pipe(res);
});
server.listen(0,'127.0.0.1',()=>console.log(`http://127.0.0.1:${server.address().port}`));
setTimeout(()=>server.close(),30*60*1000).unref();
