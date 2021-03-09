const OFFLINE_CACHE = 'offline-cache-v16';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

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

// self.addEventListener('fetch', event => {
//     event.respondWith(checkCache(event.request))
// });
//
// async function checkCache(req) {
//     const cachedResp = await caches.match(req);
//     return cachedResp || checkOnline(req);
// }
//
// async function checkOnline(req) {
//     const cache = await caches.open(DYNAMIC_CACHE);
//
//     try {
//         const res = await fetch(req);
//         await cache.put(req, res.clone());
//         return res;
//     } catch (error) {
//         return await cache.match(req);
//     }
// }


// const CACHE = 'offline-fallback-v1';
//
// // При установке воркера мы должны закешировать часть данных (статику).
// self.addEventListener('install', (event) => {
//     event.waitUntil(
//         caches
//             .open(CACHE)
//             .then((cache) => cache.addAll(['/img/background']))
//             // `skipWaiting()` необходим, потому что мы хотим активировать SW
//             // и контролировать его сразу, а не после перезагрузки.
//             .then(() => self.skipWaiting())
//     );
// });
//
// self.addEventListener('activate', (event) => {
//     // `self.clients.claim()` позволяет SW начать перехватывать запросы с самого начала,
//     // это работает вместе с `skipWaiting()`, позволяя использовать `fallback` с самых первых запросов.
//     event.waitUntil(self.clients.claim());
// });

self.addEventListener('fetch', function(event) {
    // Можете использовать любую стратегию описанную выше.
    // Если она не отработает корректно, то используейте `Embedded fallback`.
    event.respondWith(networkOrCache(event.request)
        .catch(() => useFallback()));
});

function networkOrCache(request) {
    return fetch(request)
        .then((response) => response.ok ? response : fromCache(request))
        .catch(() => fromCache(request));
}

// Наш Fallback вместе с нашим собсвенным Динозавриком.
const FALLBACK =
    '<div>\n' +
    '    <div>Test fallback</div>\n' +
    '    <div>You are offline =(</div>\n' +
    '    <img src="/svg/or/base64/of/your/dinosaur" alt="dinosaur"/>\n' +
    '</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
    return Promise.resolve(new Response(FALLBACK, { headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }}));
}

function fromCache(request) {
    return caches.open(DYNAMIC_CACHE).then((cache) =>
        cache.match(request).then((matching) =>
            matching || Promise.reject('no-match')
        ));
}
