const OFFLINE_CACHE = 'offline-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const staticAssets = [
    './',
    './index.html',
    './icons/icon-128x128.png',
    './icons/icon-192x192.png',
    './css/style.css',
    './index.js',
]

self.addEventListener('install', async event => {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.addAll(staticAssets);
    console.log('Installed!');
});

self.addEventListener('activate', async event => {
    const cacheNames = await caches.keys();

    await Promise.all(
        cacheNames
            .filter(name => name !== OFFLINE_CACHE)
            .filter(name => name !== DYNAMIC_CACHE)
            .map(name => caches.delete(name))
    )
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(event.request));
    } else {
        event.respondWith(networkFirst(event.request));
    }

});


async function cacheFirst(request) {
    const cached = await caches.match(request);

    return cached ?? await fetch(request)
}

async function networkFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE);

    try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        return cached ?? await caches.match('/offline.html');
    }
}
