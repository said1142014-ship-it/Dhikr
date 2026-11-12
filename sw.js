const CACHE='dhikr-counter-Dhikr-v2';
const LEGACY_CACHE='dhikr-0670e3dba2';
const SCOPE=new URL(self.registration.scope);
const FILES=['./','index.html','install.mjs','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png'].map(path=>new URL(path,SCOPE).href);
const FONT_HOSTS=new Set(['fonts.googleapis.com','fonts.gstatic.com']);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const files=await Promise.all(FILES.map(async url=>{const response=await fetch(new Request(url,{cache:'reload'}));if(!response.ok||response.redirected)throw Error('Offline file unavailable');return [url,response];}));
 await Promise.all(files.map(([url,response])=>cache.put(url,response)));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key===LEGACY_CACHE||key.startsWith('dhikr-counter-Dhikr-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET')return;
 const own=url.origin===SCOPE.origin&&url.pathname.startsWith(SCOPE.pathname);
 const font=FONT_HOSTS.has(url.hostname);
 if(!own&&!font)return;
 const navigation=request.mode==='navigate';
 const localAsset=FILES.includes(url.origin+url.pathname);
 if(!navigation&&!localAsset&&!font)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=navigation?new URL('index.html',SCOPE).href:font?request:url.origin+url.pathname;
  if(font){const hit=await cache.match(key);if(hit)return hit;}
  try{
   const response=await fetch(request);
   if(response.status>=500)throw Error('Server unavailable');
   if(response.ok||font&&response.type==='opaque'){try{await cache.put(key,response.clone());}catch{}}
   return response;
  }catch{
   const hit=await cache.match(key);if(hit)return hit;
   return new Response(navigation?'افتح التطبيق مرة واحدة مع اتصال بالإنترنت لتجهيزه.':'',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  }
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='OFFLINE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const responses=await Promise.all(FILES.map(url=>cache.match(url)));event.ports[0]?.postMessage({ready:responses.every(Boolean)});})());
});
