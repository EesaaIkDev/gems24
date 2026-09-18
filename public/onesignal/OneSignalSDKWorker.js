/* OneSignal Web SDK push worker.
   Kept under /onesignal/ so it never collides with the app's own /sw.js,
   which owns the root scope for offline caching. */
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
