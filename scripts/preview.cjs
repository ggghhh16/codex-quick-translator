const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files={'/settings-ui.js':['extension/settings-ui.js','text/javascript; charset=utf-8'],'/':['tests/preview.html','text/html; charset=utf-8'],'/content.js':['extension/content.js','text/javascript; charset=utf-8'],'/result.json':['.dev/preview-result.json','application/json; charset=utf-8']};
const server=http.createServer((req,res)=>{const entry=files[req.url];if(!entry){res.writeHead(404);return res.end();}res.setHeader('Content-Type',entry[1]);res.setHeader('Cache-Control','no-store');fs.createReadStream(path.join(root,entry[0])).on('error',()=>{res.statusCode=500;res.end();}).pipe(res);});
server.listen(0,'127.0.0.1',()=>console.log(`http://127.0.0.1:${server.address().port}`));
setTimeout(()=>server.close(),30*60*1000).unref();
