const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,110)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window; let played=0;
w.HTMLMediaElement.prototype.play=function(){ played++; return Promise.resolve(); };
w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'cap://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{
  pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:38000,thumb:'x'}),
  pickAudio:async()=>({path:'/m/track.mp3',durationMs:187000,name:'Knockout'}),
  export:async(o)=>{captured=o;return{saved:true,uri:'x',mixMode:'composition',audioProcess:'mixed'};},
  saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||'');
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const tapHas=l=>{const e=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes(l)); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const setRange=(el,v)=>{const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set; st.call(el,v); el.dispatchEvent(new w.Event('input',{bubbles:true}));};
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });
  await t('no audio element before music', ()=> w.document.querySelectorAll('audio').length===0);
  await t('add music', async()=>{ tap('Audio'); await wait(400); tapHas('Add music'); await wait(600); return txt().includes('Knockout'); });
  await t('preview gets a music audio element', ()=> w.document.querySelectorAll('audio').length===1);
  await t('audio src goes through convertFileSrc', ()=>{
    const a=w.document.querySelector('audio'); return a && (a.getAttribute('src')||'').startsWith('cap://');
  });
  await t('audio loops for short tracks', ()=>{ const a=w.document.querySelector('audio'); return a && a.hasAttribute('loop'); });
  await t('Music start slider appears when track selected', async()=>{
    tap('Knockout'); await wait(350);
    return txt().includes('Music start');
  });
  await t('dragging start shows mm:ss', async()=>{
    const rng=[...w.document.querySelectorAll('input[type="range"]')];
    const target=rng.find(r=>Number(r.max)>100000);
    if(!target) return false;
    setRange(target,'65000'); await wait(400);
    return txt().includes('1:05');
  });
  await t('MORE hint appears when the panel overflows', async()=>{
    // jsdom has no layout, so fake the overflow the checker measures
    const panel=[...w.document.querySelectorAll('div')].find(d=>(d.getAttribute('style')||'').includes('max-height: 200px'));
    if(!panel) return false;
    Object.defineProperty(panel,'scrollHeight',{value:420,configurable:true});
    Object.defineProperty(panel,'clientHeight',{value:200,configurable:true});
    Object.defineProperty(panel,'scrollTop',{value:0,writable:true,configurable:true});
    panel.dispatchEvent(new w.Event('scroll',{bubbles:false}));
    await wait(300);
    return txt().includes('MORE');
  });
  await t('MORE hint disappears once scrolled to the end', async()=>{
    const panel=[...w.document.querySelectorAll('div')].find(d=>(d.getAttribute('style')||'').includes('max-height: 200px'));
    Object.defineProperty(panel,'scrollTop',{value:220,writable:true,configurable:true});
    panel.dispatchEvent(new w.Event('scroll',{bubbles:false}));
    await wait(300);
    return !txt().includes('MORE');
  });
  await t('no diagnostic card in the app', ()=> !txt().includes('MUSIC DIAGNOSTIC'));
  await t('start offset reaches export payload', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && captured.musicStartMs===65000 && captured.musicPath==='/m/track.mp3';
  });
  await t('clip length still trim/speed aware', ()=> captured && captured.musicClipMs>1000 && captured.musicClipMs<=38000);
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
})();
