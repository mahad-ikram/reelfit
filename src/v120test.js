const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0,captured=null,dl=[],manifestMode='ok';
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,110)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'x';
w.fetch=(u)=>manifestMode==='fail'?Promise.reject(new Error('offline')):Promise.resolve({json:()=>Promise.resolve({version:1,tracks:[
  {id:'calm-sunrise',title:'Calm Sunrise',artist:'K MacLeod',mood:'Calm',durationMs:143000,licence:'CC0',url:'https://cdn/x/calm.mp3'},
  {id:'street-pulse',title:'Street Pulse',mood:'Upbeat',durationMs:98000,licence:'CC0',url:'https://cdn/x/street.mp3'}]})});
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'cap://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{
  pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:20000,thumb:'x'}),
  pickAudio:async()=>({path:'/m/own.mp3',durationMs:120000,name:'My track'}),
  downloadAudio:async(o)=>{dl.push(o); return {path:'/cache/reelfit_lib_'+o.id+'.mp3',durationMs:143000,bytes:3200000,cached:dl.length>1};},
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
  await t('reach Editor + Audio', async()=>{ tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300); tap('Audio'); await wait(400); return txt().includes('Library'); });
  await t('both sources offered: Library + My files', ()=> txt().includes('Library') && txt().includes('My files'));
  await t('Library lists tracks from the manifest', async()=>{ tapHas('Library'); await wait(600);
    return txt().includes('Music library') && txt().includes('Calm Sunrise') && txt().includes('Street Pulse'); });
  await t('licence shown per track', ()=> txt().includes('CC0'));
  await t('nothing downloads until tapped', ()=> dl.length===0);
  await t('tapping a track downloads it', async()=>{ tapHas('Calm Sunrise'); await wait(700);
    return dl.length===1 && dl[0].id==='calm-sunrise' && dl[0].url==='https://cdn/x/calm.mp3'; });
  await t('downloaded track becomes the music track', ()=> txt().includes('Calm Sunrise') && txt().includes('Duck under voice')===false);
  await t('library track exports like any other', async()=>{
    tap('Export'); await wait(600);
    const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
    if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    await wait(1000);
    return captured && captured.musicPath==='/cache/reelfit_lib_calm-sunrise.mp3';
  });
  console.log('  '+'-'.repeat(48)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
})();
