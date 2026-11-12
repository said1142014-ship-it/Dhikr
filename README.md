# Dhikr — عدّاد الذكر

Installable Arabic dhikr counter. Counts and custom entries remain stored on the same device under the existing `dhikr-counter-v1` key.

## Android installation

Open https://said1142014-ship-it.github.io/Dhikr/ in Chrome. Tap **تثبيت التطبيق** (Install app). If Chrome has not yet offered its installation prompt, use **⋮ → Install app / Add to Home screen**.

Wait until **جاهز للعمل دون إنترنت** appears before disconnecting. The counter and custom dhikr work offline after this first successful visit.

## Offline implementation

The service worker and manifest use paths relative to the `/Dhikr/` project directory. HTML, the installation module and icons are precached together. Online visits refresh cached app files. Activation removes only this app's own old caches, preserving other projects hosted on the same GitHub Pages origin. Fonts are cached when fetched, with system font fallbacks when unavailable.

`node --test tests/pwa.test.mjs` checks scoped caching, offline requests and isolation from other GitHub Pages projects.
