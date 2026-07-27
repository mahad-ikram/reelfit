const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,100)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'x'}),pickImage:async()=>({path:'/i.jpg'}),export:async(o)=>{captured=o;return{saved:true,uri:'x'}},saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||''); const html=()=>root().innerHTML;
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const btnStyle=f=>all().filter(x=>x.tagName==='BUTTON'&&f(x.getAttribute('style')||''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });
  await t('open Border tool', async()=>{ tap('Border'); await wait(400); return txt().includes('Border width'); });
  await t('palette expanded to 12 swatches', ()=>{
    const sw=btnStyle(s=>s.includes('border-radius: 999px')&&s.includes('width: 26px'));
    return sw.length>=12;
  });
  await t('custom swatch present in border row', ()=> btnStyle(s=>s.includes('conic-gradient')&&s.includes('width: 26px')).length===1);
  await t('palette colour applies to border', async()=>{
    const sw=btnStyle(s=>s.includes('width: 26px')&&s.includes('rgb(61, 220, 151)'));  // #3DDC97
    if(!sw.length) return false; sw[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(300);
    return html().includes('rgb(61, 220, 151)');
  });
  await t('custom opens "Border colour" with see-through backdrop', async()=>{
    const c=btnStyle(s=>s.includes('conic-gradient')&&s.includes('width: 26px'));
    c[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(450);
    return txt().includes('Border colour') && html().includes('rgba(5, 5, 12, 0.32)');
  });
  await t('Set colour applies to border only', async()=>{ tap('Set colour'); await wait(400);
    return !txt().includes('Border colour'); });
  await t('Cancel reverts border colour', async()=>{
    const c=btnStyle(s=>s.includes('conic-gradient')&&s.includes('width: 26px'));
    c[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(420);
    tap('Cancel'); await wait(400);
    return !txt().includes('Border colour');
  });
  await t('border colour reaches export payload', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && /^#[0-9A-Fa-f]{6}$/.test(captured.borderColor||'');
  });
  await t('background colour untouched by border picking', ()=> captured && captured.bgColor==='#6C3AFF');
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
  if(captured) console.log(`  payload: borderColor=${captured.borderColor} borderWidth=${captured.borderFrac!==undefined?'set':'-'} bgColor=${captured.bgColor}`);
})();
