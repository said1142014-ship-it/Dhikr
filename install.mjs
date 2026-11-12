const button=document.getElementById('install-app');
const help=document.getElementById('install-help');
const status=document.getElementById('offline-status');
const panel=document.getElementById('install-panel');
let pending=null;
const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function refreshInstall(){button.hidden=installed();panel.querySelector('h2').textContent=installed()?'التطبيق على جهازك':'استخدمه كتطبيق';}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;button.textContent='تثبيت التطبيق';refreshInstall();});
window.addEventListener('appinstalled',()=>{pending=null;help.hidden=true;refreshInstall();});
button.addEventListener('click',async()=>{
 if(pending){const prompt=pending;pending=null;await prompt.prompt();await prompt.userChoice;refreshInstall();}
 else{help.hidden=!help.hidden;button.setAttribute('aria-expanded',String(!help.hidden));}
});
async function checkOffline(){
 if(!navigator.serviceWorker?.controller)return;
 const channel=new MessageChannel();
 channel.port1.onmessage=event=>{if(event.data.ready){status.textContent=navigator.onLine?'جاهز للعمل دون إنترنت':'أنت الآن دون إنترنت — العدّ محفوظ على جهازك';status.dataset.ready='true';}channel.port1.close();};
 navigator.serviceWorker.controller.postMessage({type:'OFFLINE_STATUS'},[channel.port2]);
}
window.addEventListener('online',checkOffline);window.addEventListener('offline',checkOffline);
refreshInstall();
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',checkOffline);
 try{
  const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  registration.installing?.addEventListener('statechange',()=>{if(registration.installing?.state==='redundant'&&!registration.active)status.textContent='تعذّر تجهيز العمل دون إنترنت. أعد فتح الصفحة مع اتصال بالإنترنت.';});
  await navigator.serviceWorker.ready;await checkOffline();
 }catch{status.textContent='تعذّر تجهيز العمل دون إنترنت. أعد فتح الصفحة مع اتصال بالإنترنت.';}
}else status.textContent='افتح التطبيق في Chrome لتثبيته والعمل دون إنترنت.';
