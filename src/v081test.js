const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0, captured=null;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,100)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'file://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'data:image/png;base64,x'}),pickImage:async()=>({path:'/i.jpg'}),export:async(o)=>{captured=o;return{saved:true,uri:'content://x'}},saveToMovies:async()=>({uri:'content://y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||'');
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tapHas=l=>{const e=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes(l)); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const html=()=>root().innerHTML;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const type=(el,v)=>{const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set; st.call(el,v); el.dispatchEvent(new w.Event('input',{bubbles:true}));};
const t=async(name,fn)=>{const b=errs.length; let ok=false; try{ ok=await fn(); }catch(e){ errs.push(name+': '+e.message);} 
  ok=ok&&errs.length===b; console.log((ok?'  OK  ':'  X   ')+name+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  // ---- SPLASH (new design) ----
  await wait(300);
  await t('splash: new "Powered By" + arcs', ()=> txt().includes('Powered By') && html().includes('blur(9px)'));
  await t('splash: brand glow layers', ()=> html().includes('radial-gradient') && html().replace(/,\s+/g,',').includes('rgba(113,74,231,0.55)') && w.document.querySelectorAll('img').length===3);
  await wait(2200);

  // ---- FORMAT TILE -> FORMAT SCREEN ----
  await t('home: IG Post tile renamed', ()=> txt().includes('IG Post'));
  await t('tile YouTube -> Choose format screen', async()=>{ tap('YouTube'); await wait(900); return txt().includes('Choose format'); });
  await t('tapped format is highlighted', ()=>{
    const b=all().filter(x=>x.tagName==='BUTTON' && (x.textContent||'').includes('YouTube') && (x.textContent||'').includes('16:9'));
    return b.some(x=>(x.getAttribute('style')||'').includes('rgb(108, 58, 255)'));
  });
  await t('format screen -> Editor', async()=>{ tap('YouTube'); await wait(1300); return txt().includes('Background') && txt().includes('Export'); });

  // ---- TEXT COLOUR ----
  await t('Text tool opens', async()=>{ tap('Text'); await wait(400); return txt().includes('Add text'); });
  await t('text sheet opens', async()=>{ tap('Add text'); await wait(450); return txt().includes('Colour') && txt().includes('Auto'); });
  await t('type text', async()=>{ const i=w.document.querySelector('input[type="text"],input:not([type])'); if(!i) return false; type(i,'HELLO'); await wait(250); return txt().includes('HELLO'); });
  await t('pick yellow swatch', async()=>{
    const sw=all().filter(x=>{const st=x.getAttribute('style')||''; return x.tagName==='BUTTON'&&st.includes('rgb(255, 210, 63)')&&!st.includes('conic-gradient');});
    if(!sw.length) return false; sw[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(250);
    return html().includes('rgb(255, 210, 63)');
  });
  await t('add to video -> preview uses colour', async()=>{ tap('Add to video'); await wait(500);
    return html().includes('color: rgb(255, 210, 63)'); });
  await t('export burns chosen colour', async()=>{
    tap('Export'); await wait(600);
    if(!tapHas('Export 1080p')) tapHas('Export ');
    await wait(1000);
    return captured && captured.text && captured.text.color === '#FFD23F';
  });
  await t('export payload carries the text value', ()=> captured && captured.text && captured.text.value === 'HELLO');
  await t('export payload keeps other settings', ()=> captured && captured.aspect === '16:9' && captured.mode === 'blur');
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
  if(captured&&captured.text) console.log('  export text payload:', JSON.stringify({value:captured.text.color, color:captured.text.color}));
})();
