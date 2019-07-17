// All the files to be cached
var filesToCache = [
    '/',
    '/offline-app.js',
    '/offline.html',
    '/css/all.min.css',
    '/css/bootstrap.min.css',
    '/js/angular-route.js',
    '/js/angular.min.js',
    '/js/angularfire.js',
    '/js/bootstrap.min.js',
    '/js/firebase.js',
    '/js/jquery.js',
    '/js/popper.js',
    '/js/pwa-compat.js',
    '/templates/home.html',
    '/templates/plan.html',
    '/templates/route.html',
    '/templates/routes.html',
    '/webfonts/fa-solid-900.eot',
    '/webfonts/fa-solid-900.svg',
    '/webfonts/fa-solid-900.ttf',
    '/webfonts/fa-solid-900.woff',
    '/webfonts/fa-solid-900.woff2',
];
var cacheName = 'tag-offline';

//Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(cacheName).then(function(cache) {
        console.log('[TAG ServiceWorker] Caching app assets.');

        return cache.addAll(filesToCache);
    }));
});

self.addEventListener('activate', function (e) {
    console.log('[TAG ServiceWorker] Activate');
    
    e.waitUntil(caches.keys().then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
            if (key !== cacheName) {
                console.log('[TAG ServiceWorker] Removing old cache', key);
                return caches.delete(key);
            }
        }));
    }));

    return self.clients.claim();
});

//If any fetch fails, it will show the offline page.
self.addEventListener('fetch', function (event) {
    event.respondWith(fetch(event.request).catch(function() {
        return caches.match('/offline.html');
    }));
});

//This is a event that can be fired from your page to tell the SW to update the offline page
self.addEventListener('refreshOffline', function (response) {
    return caches.open(cacheName).then(function(cache) {
        console.log('[TAG ServiceWorker] Offline page updated from refreshOffline event: ' + response.url);

        return cache.addAll(filesToCache);
    });
});