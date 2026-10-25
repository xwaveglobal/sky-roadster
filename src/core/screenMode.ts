// v5 web screen setup for phones (iPhone Safari / Home Screen, Android Chrome) and the clean recording mode.
//
// What a web page CAN do: fill the visible area edge to edge (viewport-fit=cover + 100dvh + safe areas),
// run without Safari's address / tool bars when launched from the Home Screen (standalone, from the
// manifest + apple-mobile-web-app-capable), and enter real fullscreen where the browser supports the
// Fullscreen API (Android Chrome, desktop, iPad). What it CANNOT do: hide iOS's status bar, Dynamic Island
// or Home Indicator — iOS keeps those, so the UI keeps clear of them with the safe-area insets.
import { REC_MODE } from './demoFlag.ts';

const doc = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
const d = document as Document & { webkitFullscreenElement?: Element | null; webkitFullscreenEnabled?: boolean };

export const isIOS = /iPhone|iPod/.test(navigator.userAgent) || (/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const isIPhone = /iPhone|iPod/.test(navigator.userAgent);
export function isStandalone() {
  try {
    return (
      matchMedia('(display-mode: fullscreen)').matches ||
      matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}
const fullscreenNow = () => !!(document.fullscreenElement || d.webkitFullscreenElement);
/** the Fullscreen API on the page element — iPhone Safari has none (only video), iPad / Android / desktop do */
const canFullscreen = () => !isIPhone && !!(doc.requestFullscreen || doc.webkitRequestFullscreen) && (document.fullscreenEnabled || d.webkitFullscreenEnabled) !== false;

function requestFullscreen() {
  if (fullscreenNow() || !canFullscreen()) return;
  try {
    const r = doc.requestFullscreen ? doc.requestFullscreen({ navigationUI: 'hide' }) : doc.webkitRequestFullscreen?.();
    void Promise.resolve(r).catch(() => {});
  } catch {
    /* refused: stay in the page */
  }
}

/** keep a pixel height for browsers without dvh (iOS < 15.4) — CSS uses var(--app-h, 100dvh) */
function trackHeight() {
  const set = () => doc.style.setProperty('--app-h', `${Math.round(window.visualViewport?.height ?? window.innerHeight)}px`);
  set();
  window.addEventListener('resize', set);
  window.visualViewport?.addEventListener('resize', set);
  window.addEventListener('orientationchange', () => setTimeout(set, 250));
}

function homeScreenHint() {
  try {
    if (localStorage.getItem('sr-a2hs-hint') === '1') return;
  } catch {
    /* private mode: show it */
  }
  const el = document.createElement('div');
  el.id = 'a2hs';
  el.innerHTML =
    '<b>Full screen on iPhone</b><span>Tap <i>Share</i> → <i>Add to Home Screen</i>, then open Sky Roadster from the Home Screen — no Safari bars. (iOS keeps its status bar and Home Indicator.)</span><button aria-label="Close">✕</button>';
  el.querySelector('button')!.addEventListener('click', (e) => {
    e.stopPropagation();
    el.remove();
    try {
      localStorage.setItem('sr-a2hs-hint', '1');
    } catch {
      /* ignore */
    }
  });
  document.body.appendChild(el);
  // it never stays over the game: gone after a few seconds (✕ hides it for good)
  setTimeout(() => el.remove(), 9000);
}

export function setupScreen() {
  const standalone = isStandalone();
  doc.classList.toggle('standalone', standalone);
  doc.classList.toggle('ios', isIOS);
  doc.classList.toggle('rec', REC_MODE);
  trackHeight();
  if (!REC_MODE || standalone) return;
  // recording mode in a browser tab: the fullest screen this platform allows
  if (canFullscreen()) {
    // a user gesture is required: the first tap (also re-entered after the player leaves fullscreen)
    window.addEventListener('pointerup', () => requestFullscreen(), { capture: true });
  } else if (isIPhone) homeScreenHint();
}
