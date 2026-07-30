const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0, captured=null;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,100)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'file://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'data:image/png;base64,x'}),pickImage:async()=>({path:'/i.jpg'}),export:async(o)=>{captured=o;return{saved:true,uri:'content://x'}},saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||''); const html=()=>root().innerHTML;
const all=()=>[...w.document.querySelectorAll('button,div,span,img')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const type=(el,v)=>{const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set; st.call(el,v); el.dispatchEvent(new w.Event('input',{bubbles:true}));};
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  // ---------- SPLASH proportions ----------
  await wait(300);
  const imgs=()=>[...w.document.querySelectorAll('img')].map(i=>i.getAttribute('style')||'');
  await t('splash: PursTech enlarged to 40%', ()=> imgs().some(s=>s.includes('width: 40%')));
  await t('splash: icon 25% / wordmark 46%', ()=> imgs().some(s=>s.includes('width: 25%')) && imgs().some(s=>s.includes('width: 46%')));
  await t('splash: caption smaller than logo', ()=>{
    const cap=all().filter(x=>x.tagName==='SPAN'&&(x.textContent||'').trim()==='Powered By').pop();
    return cap && (cap.getAttribute('style')||'').includes('font-size: 10.5px');
  });
  await wait(2200);

  // ---------- reach the editor ----------
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });

  // ---------- background picker unchanged ----------
  await t('bg picker still says "Background colour"', async()=>{
    tap('Background'); await wait(350); tap('Color'); await wait(350);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.getAttribute('style')||'').includes('conic-gradient'));
    if(!b.length) return false; b[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(400);
    const ok=txt().includes('Background colour'); tap('Cancel'); await wait(300); return ok;
  });

  // ---------- text colour via the square picker ----------
  await t('open text sheet', async()=>{ tap('Text'); await wait(350); tap('Add text'); await wait(450);
    const i=[...w.document.querySelectorAll('input')].find(e=>e.type!=='range'); if(!i) return false; type(i,'COLOUR'); await wait(250);
    return txt().includes('Colour') && txt().includes('Auto'); });
  await t('custom swatch opens "Text colour" picker', async()=>{
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.getAttribute('style')||'').includes('conic-gradient'));
    if(!b.length) return false; b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(450);
    return txt().includes('Text colour');
  });
  await t('Set colour returns to text sheet', async()=>{ tap('Set colour'); await wait(450);
    return txt().includes('Add text') && txt().includes('Auto'); });
  await t('picked colour reaches export (not bg)', async()=>{
    tap('Add to video'); await wait(500);
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(1000);
    if(!captured||!captured.text) return false;
    return captured.text.color==='#FFFFFF' && captured.bgColor==='#6C3AFF';
  });
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
  if(captured) console.log(`  payload: text.color=${captured.text&&captured.text.color}  bgColor=${captured.bgColor}`);
})();
