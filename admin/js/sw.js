/**
 * Created by Denis on 04.08.2017.
 */
self.addEventListener('install', () => {
    console.info('ServiceWorker is installed', self.clients);
});
self.addEventListener('fetch', e => {
    e.respondWith(fetch(e.request).then((r) => {
        return r;
    }).catch(e => {
        self.postMessage({id: 'sw', type: 'newtwork error'});
        throw e;
    }));
});

