'use strict';
const fs=require('node:fs');const path=require('node:path');const {execFileSync}=require('node:child_process');
// A PATH entry may point at an older CLI than the installed desktop app runtime.
function resolveCodex(config={}) {
  if(config.codexPath && !path.isAbsolute(config.codexPath)) throw new Error('Codex 程序必须使用绝对路径。');
  const candidates=new Set();
  if(config.codexPath && fs.existsSync(config.codexPath))candidates.add(config.codexPath);
  if(config.pinCodexPath && candidates.size)return config.codexPath;
  const local=process.env.LOCALAPPDATA;
  if(local) {
    for(const dir of [path.join(local,'OpenAI','Codex','bin'),path.join(local,'Programs','OpenAI','Codex','bin')]) {
      if(!fs.existsSync(dir))continue;
      const direct=path.join(dir,'codex.exe');if(fs.existsSync(direct))candidates.add(direct);
      for(const e of fs.readdirSync(dir,{withFileTypes:true}))if(e.isDirectory()){
        const file=path.join(dir,e.name,'codex.exe');if(fs.existsSync(file))candidates.add(file);
      }
    }
  }
  const versions=[];
  for(const executable of candidates) {
    try{const version=execFileSync(executable,['--version'],{encoding:'utf8',windowsHide:true,timeout:5000,stdio:['ignore','pipe','ignore']}).match(/(\d+)\.(\d+)\.(\d+)/);if(version)versions.push({executable,version:version.slice(1).map(Number)});}catch{}
  }
  versions.sort((a,b)=>b.version[0]-a.version[0]||b.version[1]-a.version[1]||b.version[2]-a.version[2]);
  if(!versions.length)throw new Error('未找到可运行的 Codex，请重新运行安装脚本。');
  return versions[0].executable;
}
module.exports={resolveCodex};
