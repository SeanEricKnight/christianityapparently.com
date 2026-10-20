/* Shared header behavior: mobile menu toggle, close on link/Escape/outside click, focus return. */
(()=>{function init(){const head=document.querySelector('.ca-global-header');if(!head)return;const btn=head.querySelector('.ca-menu-btn'),nav=head.querySelector('.ca-site-nav');if(!btn||!nav)return;
const set=o=>{nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o))};
btn.addEventListener('click',()=>set(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){set(false);btn.focus()}});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!head.contains(e.target))set(false)});
matchMedia('(min-width:701px)').addEventListener('change',e=>{if(e.matches)set(false)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();
