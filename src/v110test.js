const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null,started=0,stopped=0,cancelled=0,denyOnce=false;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,110)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'cap://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{
  pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:20000,thumb:'x'}),
  pickAudio:async()=>({path:'/m/track.mp3',durationMs:187000,name:'Knockout'}),
  startVoice:async()=>{ if(denyOnce){denyOnce=false; throw {message:'Microphone permission is needed to record a voiceover'};} started++; return {recording:true}; },
  stopVoice:async()=>{ stopped++; return {path:'/v/voice.m4a',durationMs:4300}; },
  cancelVoice:async()=>{ cancelled++; return {}; },
  export:async(o)=>{captured=o;return{saved:true,uri:'x'};},
  saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const root=()=>w.document.getElementById('root');
const txt=()=>(root().textContent||'');
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const tapHas=l=>{const e=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes(l)); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const t=async(n,fn)=>{const b=errs.length; let ok=false; try{ok=await fn();}catch(e){errs.push(n+': '+e.message);} ok=ok&&errs.length===b;
  console.log((ok?'  OK  ':'  X   ')+n+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('reach Editor + Audio', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); tap('Audio'); await wait(400); return txt().includes('Voiceover'); });
  await t('Voiceover no longer says SOON', ()=> !txt().includes('SOON') || !/Voiceover[^]{0,12}SOON/.test(txt()));
  await t('denied permission surfaces a message', async()=>{
    denyOnce=true; tapHas('Voiceover'); await wait(500);
    return txt().toLowerCase().includes('microphone');
  });
  await t('tapping Voiceover starts recording', async()=>{ tapHas('Voiceover'); await wait(500); return started===1 && txt().includes('Stop'); });
  await t('elapsed timer counts up', async()=>{ await wait(600); return /\d+\.\d+s/.test(txt()); });
  await t('Stop creates a voiceover track', async()=>{ tapHas('Stop'); await wait(600); return stopped===1 && txt().includes('Voiceover \u00B7 4.3s'); });
  await t('voice track expands with its own volume', async()=>{
    tapHas('Voiceover \u00B7 4.3s'); await wait(350);
    return txt().includes('Volume') && txt().includes('Delete');
  });
  await t('voice volume is independent', async()=>{
    const rng=[...w.document.querySelectorAll('input[type="range"]')];
    const st=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set;
    const target=rng.find(r=>Number(r.max)===100);
    if(!target) return false;
    st.call(target,'70'); target.dispatchEvent(new w.Event('input',{bubbles:true})); await wait(400);
    return txt().includes('70%');
  });
  await t('music + voiceover coexist', async()=>{ tapHas('Add music'); await wait(600);
    return txt().includes('Knockout') && txt().includes('Voiceover'); });
  await t('voiceover plays in the preview (audio element present)', ()=>{
    const auds=[...w.document.querySelectorAll('audio')].map(a=>a.getAttribute('src')||'');
    return auds.some(x=>x.includes('voice.m4a')) && auds.some(x=>x.includes('track.mp3'));
  });
  await t('duck toggle appears once a voiceover exists', async()=>{
    tapHas('Knockout'); await wait(350);
    return txt().includes('Duck under voice') && txt().includes('drops to 30%');
  });
  await t('ducking lowers the exported music level', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && Math.abs(captured.musicVolume-0.6*0.3)<0.01;
  });
  await t('export sends voicePath + voiceVolume', async()=>{
    return captured && captured.voicePath==='/v/voice.m4a' && Math.abs(captured.voiceVolume-0.7)<0.001 && captured.musicPath==='/m/track.mp3';
  });
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
})();
