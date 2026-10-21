// Static checks (no browser). Run: node scripts/check-static.js   — exits 1 on any failure.
// These do NOT replace the browser suite in tests/ (rendering, animation, overflow, console errors).
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const pages=[];(function walk(d){for(const f of fs.readdirSync(d)){if(f==='.git'||f==='node_modules'||f==='tests'||f==='test-report'||f==='test-results'||f==='docs'||f==='dist')continue;const p=path.join(d,f);fs.statSync(p).isDirectory()?walk(p):f.endsWith('.html')&&pages.push(p)}})(ROOT);
const rel=p=>path.relative(ROOT,p);
const fails=[];const fail=(p,m)=>fails.push(rel(p)+': '+m);
const exists=f=>fs.existsSync(f);
const ids=new Map();
const read=p=>fs.readFileSync(p,'utf8');
for(const p of pages){const s=read(p);ids.set(p,new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1])))}
const HEADER_RE=/<!--SHELL:HEADER-->[\s\S]*?<!--\/SHELL:HEADER-->/;
const canon=new Map();
for(const p of pages){
  const s=read(p),root=p.includes(path.sep+'questions'+path.sep)?'../':'';
  // 1 header: exactly one shared header, no competing header classes
  const m=s.match(HEADER_RE);
  if(!m)fail(p,'missing shared header markers');
  else{const sig=m[0].split('href="'+root).join('href="').replace('href="#home"','href="index.html"');canon.set(p,sig)}
  if(/<header[^>]*class="(?!ca-global-header)[^"]*(site-header|topbar|top)\b/.test(s))fail(p,'competing header class');
  for(const need of ['site-header.css','site-header.js'])if(!s.includes(need))fail(p,'missing '+need);
  if(!/<main[^>]*id="main"/.test(s))fail(p,'main#main missing');
  // 2 content rules
  if(/\b(bullshit|fuck\w*|shit\w*|bitch\w*|bastard\w*)\b/i.test(s.replace(/<[^>]+>/g,' ')))fail(p,'profanity');
  if(/class="(step-number|lesson-number|case-num)"/.test(s))fail(p,'decorative numbering element');
  if(/unsplash\.com/.test(s))fail(p,'Unsplash stock image');
  // 3 images
  for(const t of s.match(/<img\b[^>]*>/g)||[]){if(!/\salt=/.test(t))fail(p,'img without alt: '+t.slice(0,80))}
  // 4 links
  const markup=s.replace(/<script[\s\S]*?<\/script>/g,'');
  for(const m of markup.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)){let h=m[1];if(/^(https?:|mailto:|tel:|javascript:)/.test(h))continue;
    const [file,frag]=h.split('#');let target=file?(file.startsWith('/')?path.resolve(ROOT,'.'+decodeURIComponent(file)):path.resolve(path.dirname(p),decodeURIComponent(file))):p;
    if(file&&!exists(target)&&exists(target+'.html'))target+='.html';
    if(file&&!exists(target)){fail(p,'dead link '+h);continue}
    if(frag&&target.endsWith('.html')&&ids.has(target)&&!ids.get(target).has(frag))fail(p,'missing anchor '+h)}
  // 5 inline JS parses; ids it references exist (static or created in JS)
  for(const m of s.matchAll(/<script(?![^>]*\ssrc)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)){
    try{new vm.Script(m[1])}catch(e){fail(p,'inline JS syntax: '+e.message)}
    for(const r of m[1].matchAll(/getElementById\(['"]([^'"]+)['"]\)/g))if(!ids.get(p).has(r[1])&&!m[1].includes('id="'+r[1]+'"')&&!m[1].includes("id='"+r[1]+"'"))fail(p,'JS references missing #'+r[1])}
  // 6 metadata
  if(!/<meta name="description"/.test(s)&&!/404/.test(p))fail(p,'no meta description');
  const c=s.match(/rel="canonical" href="([^"]+)"/);if(c&&/\.html$/.test(c[1]))fail(p,'canonical has .html');
}
// identical header on every page (normalised for relative root)
const sigs=new Set(canon.values());if(sigs.size>1)fail(ROOT,'header markup differs between pages ('+sigs.size+' variants)');
// sitemap covers every indexable page
const sm=read(path.join(ROOT,'sitemap.xml'));
for(const p of pages){const r=rel(p);if(r==='404.html')continue;const u='https://christianityapparently.com/'+(r==='index.html'?'':r.replace(/\.html$/,''));if(!sm.includes('<loc>'+u+'</loc>'))fail(p,'not in sitemap')}
// stylesheets: no stock photography or external photo backgrounds (HTML-only checks missed these once)
for(const f of fs.readdirSync(ROOT).filter(f=>f.endsWith('.css'))){const c=fs.readFileSync(path.join(ROOT,f),'utf8');
  if(/unsplash/i.test(c))fail(f,'Unsplash reference in CSS');
  if(/--photo-/.test(c))fail(f,'photo custom property in CSS');
  for(const m of c.matchAll(/url\(\s*["']?(https?:[^)"']+)/g))if(!/fonts\.(googleapis|gstatic)\.com/.test(m[1]))fail(f,'external url() in CSS: '+m[1].slice(0,80))}
if(fails.length){console.error(fails.length+' static check failure(s):\n'+fails.join('\n'));process.exit(1)}
console.log('static checks passed for '+pages.length+' pages (header identical, links, anchors, JS parse, images alt, content rules, sitemap)');
