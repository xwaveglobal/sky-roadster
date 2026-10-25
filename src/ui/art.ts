/**
 * Illustrated SVG art for the reward popups (Entry / Launch / Share / Add to screen / Revisit gift /
 * Invite / Rate / No connection / Daily). Everything is inline SVG — no image files, no CDNs.
 * Gradient ids are made unique per call so several pieces can live on one screen.
 */
let uid = 0;
const id = (p: string) => `${p}${++uid}`;

/** one gold coin seen face-on, with the XWAVE bolt */
export function coinFace(size = 28) {
  // v5: the energy crystal (option A)
  const g = id('cf');
  return `<svg class="art-coin" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9fbff"/><stop offset=".5" stop-color="#4fd6ff"/><stop offset="1" stop-color="#1a5fd8"/></linearGradient></defs>
    <path d="M20 2 33 14 20 38 7 14z" fill="url(#${g})" stroke="#0e3c9a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M7 14h26M20 2l-5 12 5 24 5-24z" fill="none" stroke="#e8fdff" stroke-width="1.1" opacity=".75"/><path d="M12 9 20 3 17 13z" fill="#fff" opacity=".7"/></svg>`;
}

/** a pile of energy crystals (v5, option A): a cluster of gems + loose ones + sparkles */
export function coinPile(w = 220, h = 120) {
  const g1 = id('ct');
  const glow = id('cg');
  // one crystal: centre x, bottom y, height h (width = 0.54 h), tilt in degrees
  const gem = (x: number, y: number, hh: number, rot = 0) => {
    const ww = hh * 0.54,
      top = y - hh,
      mid = y - hh * 0.7;
    return `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x} ${top} L${x + ww / 2} ${mid} L${x} ${y} L${x - ww / 2} ${mid}z" fill="url(#${g1})" stroke="#0e3c9a" stroke-width="1.3" stroke-linejoin="round"/>` +
      `<path d="M${x - ww / 2} ${mid}H${x + ww / 2}M${x} ${top}L${x - ww * 0.2} ${mid}L${x} ${y}L${x + ww * 0.2} ${mid}z" fill="none" stroke="#e8fdff" stroke-width="1" opacity=".7"/>` +
      `<path d="M${x - ww * 0.3} ${mid - hh * 0.1}L${x} ${top + 2}L${x - ww * 0.08} ${mid}z" fill="#fff" opacity=".6"/></g>`;
  };
  const spark = (x: number, y: number, s: number) => `<path d="M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28}L${x + s} ${y}L${x + s * 0.28} ${y + s * 0.28}L${x} ${y + s}L${x - s * 0.28} ${y + s * 0.28}L${x - s} ${y}L${x - s * 0.28} ${y - s * 0.28}z" fill="#e8fdff"/>`;
  return `<svg class="art-pile" width="${w}" height="${h}" viewBox="0 0 220 120" aria-hidden="true">
    <defs>
      <linearGradient id="${g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9fbff"/><stop offset=".5" stop-color="#4fd6ff"/><stop offset="1" stop-color="#1a5fd8"/></linearGradient>
      <radialGradient id="${glow}" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#4fd6ff" stop-opacity=".5"/><stop offset="1" stop-color="#4fd6ff" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="110" cy="102" rx="100" ry="20" fill="url(#${glow})"/>
    ${gem(70, 104, 62, -14)}${gem(150, 104, 58, 14)}${gem(110, 108, 92, 0)}
    ${gem(38, 110, 34, -26)}${gem(184, 110, 32, 24)}${gem(88, 60, 22, -30)}${gem(140, 54, 20, 28)}
    ${spark(26, 36, 7)}${spark(200, 64, 6)}${spark(130, 14, 5)}
  </svg>`;
}

/** big gold "x300" style amount (HTML; styled by .art-amt) */
export const amount = (txt: string, cls = '') => `<b class="art-amt ${cls}">${txt}</b>`;

export function giftBox(size = 64) {
  const a = id('gb');
  const b = id('gl');
  return `<svg class="art-gift" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7ad9"/><stop offset="1" stop-color="#c21f9b"/></linearGradient>
    <linearGradient id="${b}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f0a000"/></linearGradient></defs>
    <rect x="9" y="28" width="46" height="30" rx="5" fill="url(#${a})"/><rect x="6" y="20" width="52" height="12" rx="4" fill="#ff8fe0"/>
    <rect x="27" y="20" width="10" height="38" fill="url(#${b})"/>
    <path d="M32 21c-6-12-19-12-18-4 1 6 12 5 18 4zM32 21c6-12 19-12 18-4-1 6-12 5-18 4z" fill="url(#${b})" stroke="#d78a00" stroke-width="1.2"/>
    <circle cx="32" cy="21" r="4" fill="#ffd23d" stroke="#d78a00" stroke-width="1.2"/>
    <path d="M12 30h40" stroke="#fff" stroke-opacity=".35" stroke-width="2"/></svg>`;
}

export function megaphone(size = 64) {
  const a = id('mg');
  return `<svg class="art-mega" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="${a}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a5b"/><stop offset="1" stop-color="#e0262f"/></linearGradient></defs>
    <path d="M8 26h10l26-14v40L18 38H8z" fill="url(#${a})" stroke="#9c1018" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="44" cy="32" rx="6" ry="20" fill="#ffd8c8" stroke="#9c1018" stroke-width="1.5"/>
    <path d="M14 38l4 14h7l-3-12z" fill="#c21f2b"/>
    <path d="M54 18l6-5M56 32h7M54 46l6 5" stroke="#ffd23d" stroke-width="3.5" stroke-linecap="round"/></svg>`;
}

export function shareNodes(size = 64) {
  return `<svg class="art-share" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M20 32 44 18M20 32l24 14" stroke="#7fd0ff" stroke-width="5" stroke-linecap="round"/>
    <circle cx="18" cy="32" r="9" fill="#4fc3ff" stroke="#fff" stroke-width="2"/><circle cx="46" cy="16" r="9" fill="#a77bff" stroke="#fff" stroke-width="2"/><circle cx="46" cy="48" r="9" fill="#4f7bff" stroke="#fff" stroke-width="2"/></svg>`;
}

export function phonePlus(size = 64) {
  return `<svg class="art-phone" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <rect x="16" y="4" width="32" height="56" rx="7" fill="#1d6dff" stroke="#9fd6ff" stroke-width="2.5"/><rect x="20" y="10" width="24" height="42" rx="3" fill="#0b1a4a"/>
    <circle cx="48" cy="46" r="11" fill="#4fc3ff" stroke="#fff" stroke-width="2.5"/><path d="M48 40v12M42 46h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`;
}

export function friends(size = 64, color = '#a77bff') {
  return `<svg class="art-friends" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="22" cy="22" r="10" fill="${color}" opacity=".75"/><path d="M4 56c1-13 8-20 18-20s17 7 18 20z" fill="${color}" opacity=".75"/>
    <circle cx="40" cy="20" r="11" fill="${color}"/><path d="M20 58c1-14 9-22 20-22s19 8 20 22z" fill="${color}"/></svg>`;
}

export function starBig(size = 40) {
  const a = id('st');
  return `<svg class="art-star" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a0"/><stop offset="1" stop-color="#ffb300"/></linearGradient></defs>
    <path d="M20 2.5l5.2 10.8 11.8 1.6-8.6 8.2 2.1 11.7L20 29.2 9.5 34.8l2.1-11.7L3 14.9l11.8-1.6z" fill="url(#${a})" stroke="#d98a00" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}

/** "no connection" robot with a red wifi sign */
export function wifiRobot(w = 180, h = 120) {
  const body = id('rb');
  return `<svg class="art-robot" width="${w}" height="${h}" viewBox="0 0 180 120" aria-hidden="true">
    <defs><linearGradient id="${body}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d6ff"/><stop offset="1" stop-color="#5a6aa8"/></linearGradient></defs>
    <g fill="none" stroke="#ff4d5e" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M22 40a40 40 0 0 1 52 0"/><path d="M32 52a24 24 0 0 1 32 0"/></g><circle cx="48" cy="64" r="5" fill="#ff4d5e"/>
    <ellipse cx="104" cy="108" rx="62" ry="8" fill="#000" opacity=".35"/>
    <path d="M60 104c4-30 22-48 50-48s46 18 50 48z" fill="url(#${body})" stroke="#2c3768" stroke-width="2"/>
    <ellipse cx="110" cy="70" rx="38" ry="26" fill="url(#${body})" stroke="#2c3768" stroke-width="2"/>
    <ellipse cx="110" cy="72" rx="28" ry="16" fill="#0b1030"/><circle cx="99" cy="72" r="5" fill="#ff3344"/><circle cx="121" cy="72" r="5" fill="#ff3344"/>
    <path d="M160 92l16 6-16 4z" fill="#3a4a8a"/>
    <circle cx="128" cy="30" r="15" fill="#e0262f" stroke="#fff" stroke-width="2.5"/><path d="M128 21v11" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="128" cy="38" r="2.4" fill="#fff"/></svg>`;
}

/** calendar with a gift (daily reward header) */
export function calendarGift(size = 56) {
  return `<svg class="art-cal" width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden="true">
    <rect x="6" y="10" width="44" height="40" rx="8" fill="#1d6dff" stroke="#9fd6ff" stroke-width="2"/><rect x="6" y="10" width="44" height="12" rx="6" fill="#4fc3ff"/>
    <rect x="15" y="5" width="5" height="11" rx="2.5" fill="#fff"/><rect x="36" y="5" width="5" height="11" rx="2.5" fill="#fff"/>
    <rect x="18" y="28" width="20" height="15" rx="2.5" fill="#fff"/><rect x="26" y="28" width="4" height="15" fill="#ff7ad9"/><path d="M28 28c-3-6-9-5-8-2s6 2 8 2zm0 0c3-6 9-5 8-2s-6 2-8 2z" fill="#ff7ad9"/></svg>`;
}

/** three short yellow "tap here" strokes */
export const tapMarks = (cls = '') => `<svg class="art-tap ${cls}" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M13 3v6M21 7l-4 4M24 15h-6" stroke="#ffd23d" stroke-width="3.5" stroke-linecap="round"/></svg>`;
