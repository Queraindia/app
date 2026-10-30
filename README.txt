QUERA MOBILE PWA DEPLOYMENT

Domain: https://app.queramusic.in

Upload the contents of this folder to the ROOT of the app.queramusic.in hosting directory,
so these paths work:

  https://app.queramusic.in/
  https://app.queramusic.in/manifest.json
  https://app.queramusic.in/sw.js
  https://app.queramusic.in/icons/quera-192.png
  https://app.queramusic.in/icons/quera-512.png

Files:
- index.html: original Quera HTML with only a mobile-device access gate and PWA metadata/registration added.
- manifest.json: installable PWA configuration.
- sw.js: service worker for app-shell caching.
- icons/: PWA icons.

IMPORTANT:
- Enable HTTPS for app.queramusic.in.
- The app is configured for the domain root (/). If deploying inside a subfolder,
  manifest and service-worker paths must be adjusted.
- The PC block is a browser-side device check, not a security boundary. Desktop browser
  device emulation may identify itself as a mobile device.
- Existing audio/player logic and the original HTML content are retained.
