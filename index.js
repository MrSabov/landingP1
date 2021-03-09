// Перевірка того, що браузер користувача підтримує Service Worker API.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker
            .register('/sw.js')
            .then(res => console.log('service worker registered', res))
            .catch(err => console.log('service worker not registered', err))
    });
}
