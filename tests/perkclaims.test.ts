// v5 Entry / Launch: GO → CLAIM → CLAIMED once per game day (06:00 local)
declare const process: { exit(code: number): never };
import { fmtLeft, perkClaim, perkConfirmed, perkDay, perkGo, perkNextReset, perkStatus, perkWaiting } from '../src/meta/PerkClaims.ts';
let fails = 0;
const check = (ok: boolean, msg: string) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) fails++;
};
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).getTime();
check(perkDay(at(26, 5, 59)) === '2026-10-25' && perkDay(at(26, 6, 0)) === '2026-10-26', 'the game day starts at 06:00 local');
check(perkNextReset(at(26, 5, 0)) === 3600e3 && perkNextReset(at(26, 7, 0)) === 23 * 3600e3, 'time to the next 06:00');
let r = perkGo(undefined, at(26, 10));
check(perkStatus(r, at(26, 10)) === 'go' && perkWaiting(r, at(27, 9)), 'GO tapped: still GO, waiting survives a re-open the next day');
r = perkConfirmed(r, 1000, at(26, 10, 5));
check(perkStatus(r, at(26, 10, 5)) === 'claim' && !r.go, 'TikTok confirmed → CLAIM');
check(perkConfirmed(r, 1000, at(26, 10, 6)).pend === 1000, 'a second confirmation never stacks');
const c = perkClaim(r, at(26, 10, 7));
check(c.coins === 1000 && perkStatus(c.rec, at(26, 23)) === 'claimed', 'CLAIM pays 1000 once → CLAIMED for the rest of the day');
check(perkClaim(c.rec, at(26, 23)).coins === 0, 'a second CLAIM the same day pays nothing');
check(perkStatus(c.rec, at(27, 5, 59)) === 'claimed' && perkStatus(c.rec, at(27, 6, 0)) === 'go', 'next game day (06:00) → GO again');
check(!perkConfirmed(c.rec, 1000, at(27, 2)).pend, 'a confirmation before 06:00 (same game day, already claimed) waits for nothing');
check(fmtLeft(3600e3 + 61e3) === '01:01:01', 'countdown text');
if (fails) {
  console.log(`${fails} FAILED`);
  process.exit(1);
}
console.log('perk claims: all passed');
