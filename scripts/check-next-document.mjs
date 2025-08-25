import fs from 'fs'; 
import path from 'path';

const roots = ['src','pages','app']; 
const exts = new Set(['.js','.jsx','.ts','.tsx']); 
const offenders = [];

function walk(d) { 
  if(!fs.existsSync(d)) return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p = path.join(d,e.name);
    if(e.isDirectory()) walk(p);
    else if(exts.has(path.extname(e.name))){
      const rel = p.replace(process.cwd()+path.sep,'');
      if(/(^|\/)pages\/_document\.(t|j)sx?$/.test(rel)) continue;
      const c = fs.readFileSync(p,'utf8');
      if(/from\s+['"]next\/document['"]/.test(c) || /<(Html|Head|Main|NextScript)\b/.test(c)) offenders.push(rel);
    }
  }
}

roots.forEach(walk);

if(offenders.length){ 
  console.error('Invalid next/document usage found:\n- '+offenders.join('\n- ')); 
  process.exit(1); 
} else {
  console.log('OK: no invalid next/document usage.');
}
