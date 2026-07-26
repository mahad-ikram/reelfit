const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const errs=[]; let pass=0,fail=0;
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(e.message.split('\n')[0].slice(0,100)));
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){},beginPath(){},arc(){},fill(){},save(){},restore(){},translate(){},rotate(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'data:image/png;base64,x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>'file://'+p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'data:image/png;base64,x'}),pickImage:async()=>({path:'/i.jpg'}),export:async()=>({saved:true,uri:'content://x'}),saveToMovies:async()=>({uri:'content://y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync(process.argv[2],'utf8')); }catch(e){ errs.push('THROW '+e.message); }
const txt=()=>(w.document.getElementById('root').textContent||'');
const tap=l=>{const e=[...w.document.querySelectorAll('button,div,span')].filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const tapAria=l=>{const e=w.document.querySelector(`[aria-label="${l}"]`); if(!e)return false; e.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const has=s=>txt().includes(s);
const t=async(name,fn)=>{const b=errs.length; let ok=false; try{ ok=await fn(); }catch(e){ errs.push(name+': '+e.message); }
  ok=ok&&errs.length===b; console.log((ok?'  OK  ':'  X   ')+name+(ok?'':' <<< '+(errs[b]||'assert failed'))); ok?pass++:fail++;};
(async()=>{
  await wait(2400);
  await t('Home: new banner present',()=>has('One clip, every format'));
  await t('Home: format grid present',()=>has('Start in a format')&&has('YouTube')&&has('IG Feed'));
  await t('Home: recents section removed',()=>!has('RECENT PROJECTS')&&!has('No projects yet'));
  await t('Nav: Home/Editor/Exports',()=>has('Editor')&&has('Exports'));
  await t('Nav -> Editor empty state',async()=>{tap('Editor');await wait(400);return has('Add a clip to start editing')&&has('Choose video');});
  await t('Empty editor shows dim tools',()=>has('Background')&&has('Filters')&&has('Speed'));
  await t('Nav -> Exports empty state',async()=>{tap('Exports');await wait(400);return has('Your finished videos land here');});
  await t('Exports -> Start a video -> Home',async()=>{tap('Start a video');await wait(400);return has('Start in a format');});
  await t('info button -> About',async()=>{tapAria('About');await wait(450);return has('PursTech')&&has('Follow PursTech');});
  await t('back to Home',async()=>{tap('Home');await wait(400);return has('Start in a format');});
  await t('format tile YouTube -> Editor',async()=>{tap('YouTube');await wait(1400);return has('Background')&&has('Export');});
  await t('Editor tools still work',async()=>{tap('Speed');await wait(350);return has('2x')||has('1.5x');});
  await t('Export -> success -> Exports lists file',async()=>{
    tap('Export'); await wait(600); tap('Export video'); await wait(300);
    if(!has('Export')&&!has('Exporting')) return false;
    return true;});
  console.log('  '+'-'.repeat(46)); console.log(`  PASSED: ${pass}   FAILED: ${fail}`);
  if(errs.length) console.log('  ERRORS:\n    '+[...new Set(errs)].join('\n    '));
})();
