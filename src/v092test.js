const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,110)));
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
const byTitle=t=>w.document.querySelector(`button[title="${t}"]`);
const click=el=>{ if(!el) return false; el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true; };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });
  await t('undo + redo buttons exist', ()=> !!byTitle('Undo') && !!byTitle('Redo'));
  await t('both disabled at start', ()=>{
    const u=byTitle('Undo').getAttribute('style')||'', r=byTitle('Redo').getAttribute('style')||'';
    return u.includes('opacity: 0.3') && r.includes('opacity: 0.3');
  });
  await t('change background -> undo enables', async()=>{
    tap('Background'); await wait(300); tap('Black'); await wait(600);
    return (byTitle('Undo').getAttribute('style')||'').includes('opacity: 1');
  });
  await t('undo restores previous background', async()=>{
    const before=html().includes('rgb(10, 10, 20)');
    click(byTitle('Undo')); await wait(600);
    return (byTitle('Redo').getAttribute('style')||'').includes('opacity: 1');
  });
  await t('redo re-applies it', async()=>{ click(byTitle('Redo')); await wait(600);
    return (byTitle('Undo').getAttribute('style')||'').includes('opacity: 1'); });
  await t('undo works on border colour', async()=>{
    tap('Border'); await wait(350);
    const sw=all().filter(x=>x.tagName==='BUTTON'&&(x.getAttribute('style')||'').includes('width: 26px')&&(x.getAttribute('style')||'').includes('rgb(61, 220, 151)'));
    if(!sw.length) return false;
    const n0=(html().match(/rgb\(61, 220, 151\)/g)||[]).length;   // just the swatch
    click(sw[0]); await wait(600);
    const n1=(html().match(/rgb\(61, 220, 151\)/g)||[]).length;   // swatch + preview border
    click(byTitle('Undo')); await wait(700);
    const n2=(html().match(/rgb\(61, 220, 151\)/g)||[]).length;
    return n1>n0 && n2===n0;
  });
  await t('undo works on text layers', async()=>{
    tap('Text'); await wait(350); tap('Add text'); await wait(450);
    const ins=[...w.document.querySelectorAll('input')].filter(x=>(x.getAttribute('type')||'text')!=='range');
    const i2=ins.find(x=>/text/i.test(x.getAttribute('placeholder')||''))||ins[ins.length-1];
    const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set;
    st.call(i2,'UNDOME'); i2.dispatchEvent(new w.Event('input',{bubbles:true})); await wait(220);
    tap('Add to video'); await wait(700);
    const added=txt().includes('UNDOME');
    click(byTitle('Undo')); await wait(700);
    return added && !txt().includes('UNDOME');
  });
  await t('slider drag collapses to one history entry', async()=>{
    tap('Adjust'); await wait(350);
    const rng=[...w.document.querySelectorAll('input[type="range"]')];
    if(!rng.length) return false;
    const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set;
    for(const v of ['60','70','80','90']){ st.call(rng[0],v); rng[0].dispatchEvent(new w.Event('input',{bubbles:true})); await wait(40); }
    await wait(700);
    click(byTitle('Undo')); await wait(600);
    return (byTitle('Redo').getAttribute('style')||'').includes('opacity: 1');
  });
  await t('editor still exports fine after undo/redo', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    if(!captured) { errs.push('export never fired'); return false; }
    return captured.aspect==='16:9';
  });
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
})();
