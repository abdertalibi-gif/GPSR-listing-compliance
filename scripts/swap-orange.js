const fs=require('fs'),path=require('path');
function walk(d){
  for(const f of fs.readdirSync(d)){
    const p=path.join(d,f);
    const s=fs.statSync(p);
    if(s.isDirectory()){walk(p);continue;}
    if(!/\.(tsx?|css)$/.test(f)) continue;
    let c=fs.readFileSync(p,'utf8');
    const orig=c;
    c=c.replace(/#1677E8/g,'#EA580C');
    c=c.replace(/#1366C9/g,'#C2410C');
    c=c.replace(/#EFF6FF/g,'#FFF7ED');
    c=c.replace(/#BFDBFE/g,'#FED7AA');
    c=c.replace(/bg-\[#EA580C\]/g,'bg-[#EA580C]'); // keep
    if(c!==orig){fs.writeFileSync(p,c); console.log('updated',p);}
  }
}
walk('src');
console.log('done');
