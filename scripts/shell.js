// Single source for the shared site shell (header + head assets). Used by build-shell.js and build-questions.js.
const NAV=[['basics.html','Start here'],['questions.html','Questions ↗'],['index.html#bible','Bible'],['index.html#jesus','Jesus'],['index.html#history','History'],['councils.html','Councils ↗']];
const FONT='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap';
const START='<!--SHELL:HEADER-->',END='<!--/SHELL:HEADER-->';
function header(root,{home=false}={}){
  const brand=home?'#home':root+'index.html';
  const nav=NAV.map(([h,t])=>`<a href="${root}${h}">${t}</a>`).join('');
  return `${START}<a class="ca-skip" href="#main">Skip to content</a><header class="ca-global-header"><div class="ca-header-inner"><a class="ca-brand" href="${brand}" aria-label="Christianity Apparently home">CHRISTIANITY<em>APPARENTLY.</em></a><button class="ca-menu-btn" type="button" aria-controls="ca-nav" aria-expanded="false">INDEX ☰</button><nav class="ca-site-nav" id="ca-nav" aria-label="Main sections">${nav}</nav></div></header>${END}`;
}
// Ensure shared stylesheet/script/font tags exist in <head>/<body>.
function assets(html,root){
  if(!/site-header\.css/.test(html)) html=html.replace('</head>',`<link rel="stylesheet" href="${root}site-header.css">\n</head>`);
  if(!/family=Space\+Grotesk/.test(html)) html=html.replace('</head>',`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${FONT}" rel="stylesheet">\n</head>`);
  if(!/site-header\.js/.test(html)) html=html.replace('</body>',`<script src="${root}site-header.js" defer></script>\n</body>`);
  return html;
}
function apply(html,root,opts){
  const h=header(root,opts);
  if(html.includes(START)) html=html.replace(new RegExp(START+'[\\s\\S]*?'+END),()=>h);
  else if(/<header\b[^>]*>[\s\S]*?<\/header>/.test(html)) html=html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/,()=>h);
  else html=html.replace(/<body[^>]*>/,m=>m+h);
  if(!/<main\b[^>]*\bid=/.test(html)) html=html.replace(/<main\b/,'<main id="main"');
  return assets(html,root);
}
module.exports={header,apply,NAV};
