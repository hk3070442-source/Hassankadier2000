// اسم الـ Cache (الذاكرة المؤقتة) مع رقم إصدار
const CACHE_NAME = 'lecture-table-cache-v1';

// الملفات الأساسية التي نريد تخزينها
const URLS_TO_CACHE = [
  '/', // الصفحة الرئيسية
  'bbb.html', // ملف التطبيق الأساسي
  
  // ملفات Firebase
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  
  // ملف الخطوط
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap'
];

// 1. حدث التثبيت (Install)
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // تفعيل الـ SW الجديد فوراً
  );
});

// 2. حدث التفعيل (Activate)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // إذا كان الـ Cache قديم (اسمه غير موجود في القائمة البيضاء)، احذفه
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // السيطرة على الصفحة الحالية فوراً
  );
});

// 3. حدث جلب البيانات (Fetch)
self.addEventListener('fetch', (event) => {
  // نحن نستخدم استراتيجية "Cache First" (الـ Cache أولاً)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجدنا الطلب في الـ Cache، قم بإرجاعه
        if (response) {
          // console.log('Service Worker: Fetching from Cache', event.request.url);
          return response;
        }

        // إذا لم نجده، اذهب إلى الشبكة (الإنترنت)
        // console.log('Service Worker: Fetching from Network', event.request.url);
        return fetch(event.request);
      })
  );
});