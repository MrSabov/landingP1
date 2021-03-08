const OFFLINE_CACHE = 'offline-cache-v10';
const DYNAMIC_CACHE = 'dynamic-cache-v0';

const staticAssets = [
    './',
    './index.html',
    './icons/icon-128x128.png',
    './icons/icon-192x192.png',
    './css/style.css',
    './index.js',
]

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', async event => {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.addAll(staticAssets);
    console.log('Installed!');
});

self.addEventListener('activate', async event => {
    const cachesKeys = await caches.keys();
    const checkKeys = cachesKeys.map(async key => {
        if (OFFLINE_CACHE !== key) {
            await caches.delete(key);
        }
    });
    await Promise.all(checkKeys);
    console.log('Activated!');
});

self.addEventListener('fetch', event => {
    event.respondWith(checkCache(event.request));
});

async function checkCache(req) {
    const cachedResp = await caches.match(req);
    return cachedResp || checkOnline(req);
}

async function checkOnline(req) {
    const cache = await caches.open(DYNAMIC_CACHE);
    try {
        const res = await fetch(req);
        await cache.put(req, res.clone());
        return res;
    } catch (error) {
        return await cache.match(req);
    }
}

// function fromCache(request) {
//     return caches.open(CACHE).then((cache) =>
//         cache.match(request).then((matching) =>
//             matching || Promise.reject('no-match')
//         ));
// }
