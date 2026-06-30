const CACHE='persontrades-v2';
const F=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const isDoc=e.request.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('index.html');
  if(isDoc){
    // rede primeiro para o HTML: apanha sempre a versão nova quando há net
    e.respondWith(
      fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return r})
      .catch(()=>caches.match('./index.html').then(r=>r||caches.match('./')))
    );
  } else {
    // resto: cache primeiro (rápido), atualiza em fundo
    e.respondWith(
      caches.match(e.request,{ignoreSearch:true}).then(cached=>{
        const net=fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>cached);
        return cached||net;
      })
    );
  }
});
