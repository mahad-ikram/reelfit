const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,100)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'file://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'data:image/png;base64,x'}),pickImage:async()=>({path:'/i.jpg'}),export:async(o)=>{captured=o;return{saved:true,uri:'x'}},saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||''); const html=()=>root().innerHTML;
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const swatch=(rgb,last)=>{const b=all().filter(x=>{const st=x.getAttribute('style')||'';
  return x.tagName==='BUTTON'&&st.includes(rgb)&&(rgb==='conic-gradient'||!st.includes('conic-gradient'));}); if(!b.length)return false;
  (last?b[b.length-1]:b[0]).dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const type=(el,v)=>{const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set; st.call(el,v); el.dispatchEvent(new w.Event('input',{bubbles:true}));};
// the "+" chip adds a NEW layer; the main button edits the selected one
const tapPlus=()=>{const b=all().filter(x=>x.tagName==='BUTTON'
  && (x.textContent||'').trim()===''
  && (x.getAttribute('style')||'').includes('border-radius: 999px')
  && (x.getAttribute('style')||'').includes('dashed'));
  if(!b.length) return false; b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const addLayer=async(val,first)=>{
  if(first) tap('Add text'); else if(!tapPlus()) return false;
  await wait(450);
  const ins=[...w.document.querySelectorAll('input')].filter(x=>(x.getAttribute('type')||'text')!=='range');
  const i=ins.find(x=>/text/i.test(x.getAttribute('placeholder')||'')) || ins[ins.length-1];
  if(!i) return false; type(i,val); await wait(220);
  tap('Add to video'); await wait(450); return true; };
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });
  await t('open Text tool', async()=>{ tap('Text'); await wait(400); return txt().includes('Add text'); });
  await t('add layer 1', async()=>{ await addLayer('TITLE',true); return txt().includes('TITLE'); });
  await t('add layer 2 (second text!)', async()=>{ await addLayer('@handle'); return txt().includes('TITLE') && txt().includes('@handle'); });
  await t('both layers render on the video', ()=>{
    const h=html(); return h.includes('TITLE') && h.includes('@handle');
  });
  await t('layers have independent colour', async()=>{
    swatch('rgb(255, 210, 63)'); await wait(300);          // recolour selected layer only
    const h=html(); return h.includes('color: rgb(255, 210, 63)');
  });
  await t('add layers 3 and 4', async()=>{ await addLayer('THREE'); await addLayer('FOUR');
    return txt().includes('THREE') && txt().includes('FOUR'); });
  await t('capped at 4 layers', async()=>{
    const plusGone = !tapPlus();      // + chip must disappear at 4 layers
    return plusGone && !txt().includes('FIVE');
  });
  await t('export sends a texts[] array', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && Array.isArray(captured.texts) && captured.texts.length===4;
  });
  await t('each layer carries value/color/sizeFrac/posX/posY', ()=>{
    if(!captured||!captured.texts) return false;
    return captured.texts.every(t=>typeof t.value==='string' && /^#/.test(t.color)
      && typeof t.sizeFrac==='number' && typeof t.posX==='number' && typeof t.posY==='number');
  });
  await t('posY within native range (-1..1)', ()=> captured.texts.every(t=>t.posY>=-1&&t.posY<=1&&t.posX>=0&&t.posX<=1));
  await t('legacy single text kept for old builds', ()=> captured.text && captured.text.value===captured.texts[0].value);
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
  if(captured&&captured.texts) console.log('  texts[] =', JSON.stringify(captured.texts.map(t=>({v:t.value,c:t.color}))));
})();
