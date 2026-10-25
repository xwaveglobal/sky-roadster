// v5 Autoplay (video scenes): is the Settings → Autoplay menu shown?
//  - web: only with `?demo` in the address (hidden menu)
//  - the video-recording builds (build-esbuild --demo, build-tiktok --demo): always
export const DEMO_BUILD = typeof __DEMO_BUILD__ !== 'undefined' && __DEMO_BUILD__ === true;
export const IS_NATIVE = typeof __NATIVE__ !== 'undefined' && __NATIVE__ === true;
export const DEMO_MENU = DEMO_BUILD || (typeof location !== 'undefined' && typeof location.search === 'string' && /[?&]demo\b/.test(location.search));
/**
 * v5 clean RECORDING mode (the video builds, or `?rec` on the web): no debug / perf / collision overlays,
 * the graphics never step down by themselves, and on a phone the page asks for the fullest screen the
 * platform allows (fullscreen where supported; on iPhone Safari a hint to launch from the Home Screen).
 */
export const REC_MODE = DEMO_BUILD || (typeof location !== 'undefined' && typeof location.search === 'string' && /[?&]rec\b/.test(location.search));
