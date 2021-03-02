const OFFLINE_CACHE = 'offline-fallback-v0';

const staticAssets = [
    './',
    './index.html',
    './icons/icon-128x128.png',
    './icons/icon-192x192.png',
    './index.js',
]

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', async event => {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.addAll(staticAssets);
    console.log('Installed!');
});

self.addEventListener('activate', async event => {
    console.log('Activated!');
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request)
        .then(cachedResponse => {
            return cachedResponse || fetch(event.request)
        })
        .catch(() => useFallback()));
});
//
// function networkOrCache(request) {
//     return fetch(request)
//         .then((response) => response.ok ? response : fromCache(request))
//         .catch(() => fromCache(request));
// }

// Наш Fallback вместе с нашим собсвенным Динозавриком.
const FALLBACK =
    '<div>\n' +
    '    <div>App Title</div>\n' +
    '    <div>you are offline</div>\n' +
    '    <img src="/svg/or/base64/of/your/dinosaur" alt="dinosaur"/>\n' +
    '</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
    return Promise.resolve(new Response(FALLBACK, { headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }}));
}

// function fromCache(request) {
//     return caches.open(CACHE).then((cache) =>
//         cache.match(request).then((matching) =>
//             matching || Promise.reject('no-match')
//         ));
// }
