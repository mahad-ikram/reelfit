// render the Success screen with a fake result to confirm the card actually shows
const {JSDOM,VirtualConsole}=require('jsdom'), fs=require('fs');
process.on('unhandledRejection',()=>{});
const vc=new VirtualConsole();
const dom=new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc});
const w=dom.window; let captured=null;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve(); w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){},fillText(){},measureText:()=>({width:10}),clearRect(){}});
w.HTMLCanvasElement.prototype.toDataURL=()=>'x';
w.Capacitor={isNativePlatform:()=>true,convertFileSrc:p=>p,Plugins:{App:{addListener:()=>Promise.resolve({remove(){}}),exitApp(){}},SplashScreen:{hide:()=>Promise.resolve()},ReelfitExport:{
  pick:async()=>({path:'/c.mp4',width:1080,height:1920,durationMs:15000,thumb:'x'}),
  pickAudio:async()=>({path:'/m/track.mp3',durationMs:187000,name:'Knockout'}),
  export:async(o)=>{captured=o;return{saved:true,uri:'x',mixMode:'composition',musicGiven:true,musicOnDisk:true,musicBytes:4283904,musicVolume:0.6,clipMs:12600,outDurationMs:12600,channelCount:2,sampleRate:44100,audioBitrate:128000,audioProcess:'TRANSMUXED(copied)'};},
  saveToMovies:async()=>({uri:'y'}),shareVideo:async()=>({}),openVideo:async()=>({}),addListener:async()=>({remove(){}})}}};
w.localStorage.setItem('rf_ob','1');
try{ w.eval(fs.readFileSync('app.new.js','utf8')); }catch(e){ console.log('THROW',e.message); }
const all=()=>[...w.document.querySelectorAll('button,div,span')];
const tap=l=>{const e=all().filter(x=>(x.textContent||'').trim()===l); if(!e.length)return false; e[e.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true})); return true;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await wait(2400); tap('YouTube'); await wait(900); tap('YouTube'); await wait(1300);
  tap('Audio'); await wait(400);
  const b0=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Add music'));
  if(b0.length) b0[b0.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  await wait(600);
  tap('Export'); await wait(600);
  const b=all().filter(x=>x.tagName==='BUTTON'&&(x.textContent||'').includes('Export 1080p'));
  if(b.length) b[b.length-1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  await wait(2200);
  const txt=(w.document.getElementById('root').textContent||'');
  console.log('reached success screen :', txt.includes('Ready to post'));
  console.log('diagnostic card shown  :', txt.includes('MUSIC DIAGNOSTIC'));
  console.log('');
  const card=all().find(x=>(x.textContent||'').startsWith('MUSIC DIAGNOSTIC'));
  if(card) console.log('---- card as the user sees it ----\n'+card.textContent);
})();
