const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const crypto=require('node:crypto');
const event=()=>({listeners:[],addListener(fn){this.listeners.push(fn);}});
function harness(){
  const posted=[],sent=[];
  const port={onMessage:event(),onDisconnect:event(),postMessage(msg){posted.push(msg);}};
  const chrome={runtime:{id:'extension',onInstalled:event(),onStartup:event(),onMessage:event(),connectNative:()=>port,lastError:null},contextMenus:{removeAll:async()=>{},create(){},onClicked:event()},commands:{onCommand:event()},tabs:{sendMessage:async(...args)=>{sent.push(args);},onRemoved:event()},scripting:{},action:{}};
  vm.runInNewContext(fs.readFileSync('extension/background.js','utf8'),{chrome,crypto,URL,setTimeout,clearTimeout});
  const send=(msg,sender)=>new Promise(resolve=>chrome.runtime.onMessage.listeners[0](msg,{id:'extension',url:sender?.tab?'https://example.com/article':'chrome-extension://extension/options.html',...sender},resolve));
  return{send,chrome,port,posted,sent};
}
test('translation events retain envelope type, frame and document isolation',async()=>{const h=harness();await h.send({type:'translate',id:'test',data:{selected:'Hi'}},{tab:{id:8},frameId:2,documentId:'doc-a'});h.port.onMessage.listeners[0]({id:'test',type:'delta',text:'你好',settings:{}});assert.equal(h.sent[0][1].type,'translation-event');assert.equal(h.sent[0][1].event,'delta');assert.equal(h.sent[0][2].frameId,2);assert.equal(h.sent[0][2].documentId,'doc-a');});
test('another tab cannot save a translation it does not own',async()=>{const h=harness();await h.send({type:'translate',id:'one',data:{selected:'Hi'}},{tab:{id:1},documentId:'a'});const response=await h.send({type:'save',target:'one'},{tab:{id:2},documentId:'b'});assert.equal(response.ok,false);assert.match(response.error,/失效/);});
test('new selection cancels previous request in the same document',async()=>{const h=harness();const sender={tab:{id:1},documentId:'a'};await h.send({type:'translate',id:'one',data:{selected:'Hi'}},sender);await h.send({type:'translate',id:'two',data:{selected:'Hi'}},sender);assert.ok(h.posted.some(msg=>msg.type==='cancel'&&msg.target==='one'));});
test('host disconnect clears pending requests and informs active windows',async()=>{const h=harness();await h.send({type:'translate',id:'one',data:{selected:'Hi'}},{tab:{id:1},documentId:'a'});const hello=h.send({type:'hello'},{});h.port.onDisconnect.listeners[0]();const reply=await hello;assert.equal(reply.ok,false);assert.equal(h.sent[0][1].event,'error');assert.match(h.sent[0][1].error,/无法连接/);});
test('Chrome sender URL determines source attribution, never page-supplied URL',async()=>{const h=harness();await h.send({type:'translate',id:'source',data:{selected:'Hi',url:'https://forged.example/'}},{tab:{id:1},url:'https://example.com/real'});assert.equal(h.posted[0].data.url,'https://example.com/real');});
test('untrusted extension pages and malformed content cannot reach native host',async()=>{const h=harness();for(const [msg,sender] of [[{type:'hello'},{url:'chrome-extension://other/options.html'}],[null,{tab:{id:1}}],[{type:'translate',id:'bad',data:{selected:'x'.repeat(12001)}},{tab:{id:1}}]]){assert.equal((await h.send(msg,sender)).ok,false);}assert.equal(h.posted.length,0);});
test('duplicate IDs cannot reassign a translation to another tab',async()=>{const h=harness();await h.send({type:'translate',id:'same',data:{selected:'A'}},{tab:{id:1}});const result=await h.send({type:'translate',id:'same',data:{selected:'B'}},{tab:{id:2}});assert.equal(result.ok,false);assert.equal(h.posted.length,1);});
