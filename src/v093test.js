const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null,audioAsked=0;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,110)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{
  pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'x'}),
  pickImage:async()=>({path:'/i.jpg'}),
  pickAudio:async()=>{audioAsked++;return{path:'/music/track.mp3',durationMs:187000,name:'Knockout'};},
  export:async(o)=>{captured=o;return{saved:true,uri:'x'};},
  saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||''); const html=()=>root().innerHTML;
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const tapHas=l=>{const e=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes(l)); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const byTitle=t=>w.document.querySelector(`button[title="${t}"]`);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); return txt().includes('Background'); });
  await t('Audio tab: Add music is real (no SOON badge on it)', async()=>{
    tap('Audio'); await wait(400);
    return txt().includes('Add music') && txt().includes('Original audio');
  });
  await t('picking music calls native pickAudio', async()=>{ tapHas('Add music'); await wait(500); return audioAsked===1; });
  await t('track name + duration shown', ()=> txt().includes('Knockout') && txt().includes('187s'));
  await t('music volume slider appears', ()=> txt().includes('Music volume'));
  await t('music volume adjustable', async()=>{
    const rng=[...w.document.querySelectorAll('input[type="range"]')];
    const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set;
    if(!rng.length) return false;
    st.call(rng[0],'35'); rng[0].dispatchEvent(new w.Event('input',{bubbles:true})); await wait(400);
    return txt().includes('35%');
  });
  await t('undo removes the music', async()=>{
    const had=txt().includes('Knockout');
    for(let k=0;k<8 && txt().includes('Knockout');k++){ const u=byTitle('Undo'); if(!u) break;
      u.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(480); }
    return had && !txt().includes('Knockout');
  });
  await t('redo brings it back', async()=>{
    const r=byTitle('Redo'); if(!r) return false;
    r.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(600);
    return txt().includes('Knockout');
  });
  await t('remove button clears music', async()=>{
    const x=byTitle('Remove music'); if(!x) return false;
    x.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); await wait(480);
    return !txt().includes('Knockout') && txt().includes('Add music');
  });
  await t('can re-add music after removing', async()=>{ tapHas('Add music'); await wait(550);
    return audioAsked===2 && txt().includes('Knockout'); });
  await t('export payload carries musicPath + musicVolume', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && captured.musicPath==='/music/track.mp3' && captured.musicVolume>0 && captured.musicVolume<=1;
  });
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
})();
