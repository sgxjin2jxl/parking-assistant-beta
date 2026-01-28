// ======================================================
// Service Worker - 离线支持
// ======================================================
// 这个文件让你的APP可以：
// 1. 离线使用（没有网络也能打开）
// 2. 加载更快（文件缓存在本地）
// 3. 像原生APP一样工作
// ======================================================

const CACHE_NAME = 'parking-assistant-v1';

// 需要缓存的文件列表
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/parkingLots.js',
  '/js/app.js',
  '/js/notifications.js',
  '/manifest.json'
];

// ==================== 安装事件 ====================
// 当Service Worker首次安装时触发
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存文件...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成！');
        return self.skipWaiting();  // 立即激活新的Service Worker
      })
  );
});

// ==================== 激活事件 ====================
// 当Service Worker激活时触发（清理旧缓存）
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] 激活完成！');
        return self.clients.claim();  // 立即控制所有页面
      })
  );
});

// ==================== 请求拦截 ====================
// 当网页请求文件时，优先使用缓存
self.addEventListener('fetch', (event) => {
  // 只处理同源请求（避免缓存外部资源）
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // 如果缓存中有，直接返回缓存
          if (response) {
            console.log('[Service Worker] 从缓存返回:', event.request.url);
            return response;
          }
          
          // 如果缓存中没有，从网络获取
          console.log('[Service Worker] 从网络获取:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // 如果是有效响应，缓存它
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            });
        })
        .catch((error) => {
          console.error('[Service Worker] 请求失败:', error);
          // 可以在这里返回一个离线页面
        })
    );
  }
});