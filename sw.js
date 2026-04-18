// Service Worker - 캐시 버전 올릴 때마다 이전 캐시 자동 삭제
const CACHE = 'hanja-v3';  // ← 버전 올림
const ASSETS = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();  // 즉시 활성화
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();  // 열려있는 탭에도 즉시 적용
});

self.addEventListener('fetch', e => {
  // index.html은 항상 네트워크 우선 (캐시보다 최신 버전 사용)
  if(e.request.url.endsWith('index.html') || e.request.url.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
