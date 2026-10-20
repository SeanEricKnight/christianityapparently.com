// Applies the shared shell to every HTML page. Idempotent. Run: node scripts/build-shell.js
const fs=require('fs'),path=require('path');
const shell=require('./shell');
const ROOT=path.join(__dirname,'..');
function pages(){const out=[];for(const f of fs.readdirSync(ROOT))if(f.endsWith('.html'))out.push(f);
  const q=path.join(ROOT,'questions');if(fs.existsSync(q))for(const f of fs.readdirSync(q))if(f.endsWith('.html'))out.push('questions/'+f);return out}
function run(){let changed=0;for(const p of pages()){const file=path.join(ROOT,p);const src=fs.readFileSync(file,'utf8');
  const root=p.includes('/')?'../':'';const out=shell.apply(src,root,{home:p==='index.html'});
  if(out!==src){fs.writeFileSync(file,out);changed++}}
  return changed}
if(require.main===module)console.log('shell applied; files changed:',run());
module.exports={run};
