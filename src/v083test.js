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
const swatch=(rgb,last)=>{const b=all().filter(x=>x.tagName==='BUTTON'&&(x.getAttribute('style')||'').includes(rgb)); if(!b.length)return false;
  (last?b[b.length-1]:b[0]).dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const type=(el,v)=>{const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set; st.call(el,v); el.dispatchEvent(new w.Event('input',{bubbles:true}));};
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });
  await t('Text panel: no colour row before text', async()=>{ tap('Text'); await wait(400); return !txt().includes('Text colour'); });
  await t('add text via sheet', async()=>{ tap('Add text'); await wait(450);
    const i=w.document.querySelector('input'); if(!i) return false; type(i,'LIVE'); await wait(250);
    tap('Add to video'); await wait(500); return txt().includes('LIVE'); });
  await t('Text panel now shows live colour row', ()=> txt().includes('Text colour') && txt().includes('updates live'));
  await t('panel swatch recolours WITHOUT any modal', async()=>{
    swatch('rgb(255, 210, 63)');           // yellow, panel row
    await wait(300);
    const noModal = !txt().includes('Set colour') && !txt().includes('Add to video');
    return noModal && html().includes('color: rgb(255, 210, 63)');
  });
  await t('preview text uses the live colour', ()=> html().includes('color: rgb(255, 210, 63)'));
  await t('custom swatch opens picker with see-through backdrop', async()=>{
    swatch('conic-gradient', true); await wait(450);
    return txt().includes('Text colour') && html().includes('rgba(5, 5, 12, 0.32)');
  });
  await t('Cancel reverts to previous colour', async()=>{ tap('Cancel'); await wait(400);
    return html().includes('color: rgb(255, 210, 63)'); });
  await t('Auto restores template colour', async()=>{ tap('Auto'); await wait(300);
    return !html().includes('color: rgb(255, 210, 63)'); });
  await t('live colour still exports', async()=>{
    swatch('rgb(61, 220, 151)'); await wait(300);   // green
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && captured.text && captured.text.color==='#3DDC97';
  });
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
  if(captured&&captured.text) console.log('  exported text.color =', captured.text.color);
})();
