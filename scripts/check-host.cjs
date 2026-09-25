const {spawn}=require('node:child_process');
const path=require('node:path');
const {encode,decoder}=require('../native/framing.cjs');
const child=spawn(process.execPath,[path.resolve(__dirname,'../native/host.cjs')],{windowsHide:true,stdio:['pipe','pipe','inherit']});
const timer=setTimeout(()=>{child.kill();console.error('Host timeout');process.exitCode=1;},45000);
child.stdout.on('data',decoder(msg=>{
  clearTimeout(timer);
  if(msg.type==='error'){console.error(msg.error);process.exitCode=1;}
  else console.log(JSON.stringify({version:msg.hostVersion,models:msg.models.map(m=>({model:m.model,efforts:m.supportedReasoningEfforts.map(e=>e.reasoningEffort),tiers:m.serviceTiers})),preferences:{model:msg.preferences.model,effort:msg.preferences.effort,fast:msg.preferences.fast},effective:msg.effective},null,2));
  child.stdin.end();
},error=>{clearTimeout(timer);child.kill();console.error(error.message);process.exitCode=1;}));
child.stdin.write(encode({id:'check',type:'hello'}));
