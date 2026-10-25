// v5 layout sweep (web DOM UI): opens every screen / overlay at a phone size and reports
//  - text that overlaps another element inside the same row / button (icon over label, label over label)
//  - text cut off (wider than its box) and panels taller than the screen (AGENTS rule 6: 375 × 640, no scroll)
//
//   node scripts/qa/layout.mjs <dist> <outDir> [--w=375 --h=640]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openGame } from './h5.mjs';

const [dist, out] = process.argv.slice(2);
const arg = (k, d) => Number((process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d}`).split('=')[1]);
const W = arg('w', 375),
  H = arg('h', 640);
mkdirSync(out, { recursive: true });
const g = await openGame(dist, { w: W, h: H, dpr: 1 });
const { page } = g;
const ev = (fn, a) => page.evaluate(fn, a);
const report = [];

/** the visible screens' layout problems */
const audit = (name) =>
  ev((name) => {
    const bad = [];
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return e.offsetParent !== null && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05;
    };
    const label = (e) => (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : e.tagName.toLowerCase()) + (e.dataset?.a ? `[${e.dataset.a}]` : '') + (e.dataset?.k ? `{${e.dataset.k}}` : '');
    const screens = [...document.querySelectorAll('#ui .screen.show')];
    for (const sc of screens) {
      // rows / buttons / tiles: children must not overlap each other
      for (const row of sc.querySelectorAll('button, .srow, .stile, .ccard, .lbrow, .rchip, .xbtn, .navrow, .row, .cst, .bn-rules > span')) {
        if (!vis(row)) continue;
        const kids = [...row.children].filter((c) => vis(c) && getComputedStyle(c).position !== 'absolute' && getComputedStyle(c).position !== 'fixed');
        for (let i = 0; i < kids.length; i++)
          for (let j = i + 1; j < kids.length; j++) {
            const a = kids[i].getBoundingClientRect(),
              b = kids[j].getBoundingClientRect();
            const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (ox > 2 && oy > 2 && (kids[i].textContent.trim() || kids[j].textContent.trim()))
              bad.push({ kind: 'overlap', where: `${sc.id} ${label(row)}`, a: `${label(kids[i])} "${kids[i].textContent.trim().slice(0, 18)}"`, b: `${label(kids[j])} "${kids[j].textContent.trim().slice(0, 18)}"`, px: Math.round(ox) });
          }
      }
      // text wider than its box (cut off / spilling) — leaf text elements only
      for (const el of sc.querySelectorAll('b, span, small, em, strong, h2, h3, p, div, button')) {
        if (!vis(el) || el.children.length > 0 || !el.textContent.trim()) continue;
        const cs = getComputedStyle(el);
        if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') continue;
        if (el.scrollWidth > el.clientWidth + 2 && cs.textOverflow !== 'ellipsis') bad.push({ kind: 'cut', where: `${sc.id} ${label(el)}`, text: el.textContent.trim().slice(0, 30), over: el.scrollWidth - el.clientWidth });
      }
      // anything outside the screen horizontally
      for (const el of sc.querySelectorAll('button, .panel, .srow, .stile')) {
        if (!vis(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right > innerWidth + 1 || r.left < -1) bad.push({ kind: 'offscreen-x', where: `${sc.id} ${label(el)}`, left: Math.round(r.left), right: Math.round(r.right) });
      }
      // panels taller than the screen
      for (const p of sc.querySelectorAll(':scope > .panel, :scope > .panel.modal')) {
        if (!vis(p)) continue;
        const r = p.getBoundingClientRect();
        if (r.height > innerHeight + 1) bad.push({ kind: 'too-tall', where: `${sc.id} ${label(p)}`, h: Math.round(r.height) });
      }
    }
    return { name, shown: screens.map((s) => s.id), bad };
  }, name);

const steps = [
  ['home', () => ev(() => window.__xwave.goHome())],
  ['settings', () => ev(() => window.__xwave.ui.h.settings())],
  ['garage', () => ev(() => window.__xwave.ui.h.garage())],
  ['shop', () => ev(() => window.__xwave.ui.h.shop())],
  ['bag', () => ev(() => window.__xwave.ui.h.bag())],
  ['missions', () => ev(() => window.__xwave.ui.h.missions())],
  ['ranks', () => ev(() => window.__xwave.ui.h.ranks())],
  ['daily', () => ev(() => window.__xwave.ui.h.daily())],
  ['bonus', () => ev(() => window.__xwave.ui.h.events())],
  ['profile', () => ev(() => window.__xwave.ui.h.profile())],
  ['tracks', () => ev(() => window.__xwave.ui.h.play())],
  ['help', () => ev(() => window.__xwave.ui.h.help())],
  ['entry', () => ev(() => window.__xwave.ui.h.perk('entry'))],
  ['launch', () => ev(() => window.__xwave.ui.h.perk('launch'))],
  ['share', () => ev(() => window.__xwave.ui.h.perk('share'))],
];
for (const [name, open] of steps) {
  try {
    await ev(() => {
      const G = window.__xwave;
      for (const s of document.querySelectorAll('#ui .screen.overlay.show')) s.classList.remove('show');
      G.goHome();
    });
    await page.waitForTimeout(300);
    await open();
    await page.waitForTimeout(700);
    const r = await audit(name);
    report.push(r);
    await page.screenshot({ path: join(out, `${name}.png`) });
    console.log(`${r.bad.length ? '✗' : '✓'} ${name} [${r.shown.join(', ')}] ${r.bad.length} problem(s)`);
    for (const b of r.bad.slice(0, 12)) console.log('    ', JSON.stringify(b));
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    report.push({ name, error: e.message });
  }
}
writeFileSync(join(out, 'layout.json'), JSON.stringify({ W, H, report, errors: g.errors }, null, 1));
console.log(`errors: ${JSON.stringify(g.errors.slice(0, 5))}`);
await g.close();
