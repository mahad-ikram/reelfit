const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs'), crypto=require('crypto');
process.on('unhandledRejection',()=>{});
function boot(file){
  const vc=new VirtualConsole(); const errs=[];
  vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,90)));
  const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
  const w=dom.window;
  w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
  w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
  w.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,x';
  w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'file://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'data:image/png;base64,x'}),pickImage:async()=>({path:'/i.jpg'}),pickAudio:async()=>({path:'/a.mp3'}),export:async()=>({saved:true,uri:'c://x'}),saveToMovies:async()=>({uri:'c://y'})}}};
  w.localStorage.setItem('rf_ob','1');
  try{ w.eval(fs.readFileSync(file,'utf8')); }catch(e){ errs.push('THROW '+e.message); }
  return {w,errs};
}
const tap=(w,l)=>{const e=[...w.document.querySelectorAll('div,button,span')].filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// structural signature: tag skeleton + text + svg path data (ignores nothing meaningful)
const sig=w=>{
  const r=w.document.getElementById('root');
  const tags=[...r.querySelectorAll('*')].map(e=>e.tagName.toLowerCase()).join(',');
  const text=(r.textContent||'').replace(/\s+/g,' ').trim();
  const paths=[...r.querySelectorAll('svg *')].map(e=>e.getAttribute('d')||e.tagName).join('|');
  return {tags:crypto.createHash('md5').update(tags).digest('hex').slice(0,8),
          text:crypto.createHash('md5').update(text).digest('hex').slice(0,8),
          icons:crypto.createHash('md5').update(paths).digest('hex').slice(0,8),
          n:r.querySelectorAll('*').length, svg:r.querySelectorAll('svg').length, t:text.slice(0,40)};
};
async function run(file){
  const {w,errs}=boot(file); const out={};
  await wait(2400); out.HOME=sig(w);
  tap(w,'Import video'); await wait(700); tap(w,'Reels'); await wait(1500); out.EDITOR=sig(w);
  for(const t of ['Background','Adjust','Filters','Text','Trim','Audio','Speed']){ tap(w,t); await wait(350); out['TOOL_'+t]=sig(w); }
  tap(w,'Background'); await wait(350);
  for(const b of ['Blur','Color','Glow','Black','White','Image']){ tap(w,b); await wait(300); out['BG_'+b]=sig(w); }
  tap(w,'Speed'); await wait(300);
  for(const p of ['2x','0.5x','1x']){ tap(w,p); await wait(300); out['SPD_'+p]=sig(w); }
  tap(w,'Audio'); await wait(300);
  for(const v of ['Mute','50%','100%']){ tap(w,v); await wait(300); out['VOL_'+v]=sig(w); }
  tap(w,'Export'); await wait(600); out.EXPORT=sig(w);
  // fresh boot for nav screens
  const s2=boot(file); await wait(2400);
  tap(s2.w,'About'); await wait(500); out.ABOUT=sig(s2.w);
  tap(s2.w,'Pro'); await wait(500); out.PRO=sig(s2.w);
  errs.push(...s2.errs);
  return {out,errs};
}
(async()=>{
  const A=await run(process.argv[2]), B=await run(process.argv[3]);
  let same=0,diff=0;
  console.log('SCREEN         nodes(A/B)  svg(A/B)  tags  text  icons');
  for(const k of Object.keys(A.out)){
    const a=A.out[k], b=B.out[k];
    const okT=a.tags===b.tags, okX=a.text===b.text, okI=a.icons===b.icons;
    const ok=okT&&okX&&okI; ok?same++:diff++;
    console.log(`${ok?'OK ':'XX '}${k.padEnd(13)} ${String(a.n).padStart(4)}/${String(b.n).padEnd(4)} ${String(a.svg).padStart(4)}/${String(b.svg).padEnd(4)}  ${okT?' = ':'DIF'}  ${okX?' = ':'DIF'}  ${okI?' = ':'DIF'}`);
  }
  console.log('-'.repeat(60));
  console.log(`IDENTICAL: ${same}   DIFFERENT: ${diff}`);
  if(A.errs.length) console.log('A errors:',[...new Set(A.errs)].join('|'));
  if(B.errs.length) console.log('B errors:',[...new Set(B.errs)].join('|'));
})();
