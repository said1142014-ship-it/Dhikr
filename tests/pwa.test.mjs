import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const ORIGIN='https://said1142014-ship-it.github.io';
async function harness(){
 const source=await readFile(new URL('../sw.js',import.meta.url),'utf8'),events={},stores=new Map([['unrelated-project',new Map()],['dhikr-0670e3dba2',new Map()]]);
 let offline=false;
 class SiteRequest extends Request{constructor(url,options){super(new URL(url,ORIGIN+'/Dhikr/'),options);}}
 const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {async match(k){return map.get(k.url||k)?.clone();},async put(k,r){map.set(k.url||k,r.clone());}};},async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);}};
 const context={self:{registration:{scope:ORIGIN+'/Dhikr/'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener(k,v){events[k]=v;}},URL,Request:SiteRequest,Response,caches,fetch:async request=>{
  if(offline)throw Error('offline');const url=new URL(request.url),name=url.pathname.replace('/Dhikr/','')||'index.html';
  return new Response(await readFile(new URL('../'+name,import.meta.url)));
 }};
 vm.runInNewContext(source,context);
 async function lifecycle(name){const pending=[];events[name]({waitUntil:p=>pending.push(p)});await Promise.all(pending);}
 async function request(path,mode='cors'){let result;events.fetch({request:{method:'GET',url:ORIGIN+path,mode},respondWith:p=>result=p});return result?await result:undefined;}
 return {install:()=>lifecycle('install'),activate:()=>lifecycle('activate'),request,stores,setOffline(){offline=true;}};
}
test('app and installation module are available offline under GitHub project path',async()=>{
 const app=await harness();await app.install();await app.activate();app.setOffline();
 const html=await app.request('/Dhikr/?installed=1','navigate');assert.equal(html.status,200);assert.ok((await html.text()).includes('id="install-app"'));
 const script=await app.request('/Dhikr/install.mjs');assert.equal(script.status,200);assert.ok((await script.text()).includes('beforeinstallprompt'));
});
test('activation preserves caches belonging to other projects on the same host',async()=>{
 const app=await harness();await app.install();await app.activate();assert.ok(app.stores.has('unrelated-project'));assert.ok(!app.stores.has('dhikr-0670e3dba2'));
});
test('requests outside the app scope and unknown assets are not replaced with HTML',async()=>{
 const app=await harness();await app.install();app.setOffline();
 assert.equal(await app.request('/AnotherProject/','navigate'),undefined);
 assert.equal(await app.request('/Dhikr/missing.png'),undefined);
});
test('manifest installation URL and scope resolve to the Dhikr project',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
 const base=ORIGIN+'/Dhikr/manifest.webmanifest';
 for(const key of ['id','start_url','scope'])assert.equal(new URL(manifest[key],base).href,ORIGIN+'/Dhikr/');
 assert.equal(manifest.display,'standalone');
});
