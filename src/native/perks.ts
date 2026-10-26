/**
 * v5 (owner 2026-10-26) native Entry / Launch rewards: GO → CLAIM → ✓ CLAIMED TODAY (game day from 06:00).
 *
 *  - GO: the time is saved (Save.tt) and the HS kit sends the player to TikTok (profile / add to home screen).
 *  - TikTok confirms → the coins WAIT for CLAIM: the kit pays into the wallet, `fromKit` moves them back
 *    out; after a cold re-open (the kit does not count a GO of an earlier session) our own check asks TikTok.
 *  - CLAIM: wallet += coins, a big "REWARD RECEIVED" card; then ✓ CLAIMED TODAY (dimmed) + a countdown.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { perkClaim, perkConfirmed, perkGo, perkNextReset, perkStatus, perkWaiting, type PerkRec, type PerkStatus } from '../meta/PerkClaims.ts';
import { hs } from './hs.ts';

export type TtPerk = 'entry' | 'launch';
const KIND = { entry: 'profile', launch: 'shortcut' } as const;
const KEY = { entry: 'tiktok_profile', launch: 'tiktok_shortcut' } as const;

let game: any = null;
export function bindPerks(g: any) {
  game = g;
}
const recs = (): Partial<Record<TtPerk, PerkRec>> => (game?.save ? (game.save.tt ??= {}) : {});
const save = () => game?.persist?.();
const redraw = () => {
  if (game?.ui) game.ui.dirty = true;
};

export const ttPerks = {
  status(k: TtPerk, now = Date.now()): PerkStatus {
    return perkStatus(recs()[k], now);
  },
  /** coins this reward gives (HS dashboard over the code default) */
  amount(k: TtPerk): number {
    const r = k === 'entry' ? hs.entryReward() : hs.launchReward();
    return Math.round(Number(r?.coins ?? 1000)) || 1000;
  },
  pending(k: TtPerk): number {
    return recs()[k]?.pend ?? 0;
  },
  nextReset: (now = Date.now()) => perkNextReset(now),
  go(k: TtPerk) {
    const r = recs();
    r[k] = perkGo(r[k], Date.now());
    save();
    console.log(`[perk] GO ${k}`);
    if (k === 'entry') hs.entryStart();
    else hs.launchStart();
    redraw();
  },
  /** the kit paid a TikTok mission (it is already in the wallet): hold it for CLAIM */
  fromKit(from: string, coins: number): boolean {
    const k = (Object.keys(KEY) as TtPerk[]).find((x) => KEY[x] === from);
    if (!k || !game?.save) return false;
    game.save.wallet = Math.max(0, game.save.wallet - coins);
    const r = recs();
    r[k] = perkConfirmed(r[k], coins, Date.now());
    console.log(`[perk] kit paid ${from} ${coins} → ${ttPerks.status(k)}`);
    save();
    redraw();
    return true;
  },
  /** after start and on every return to the game: a GO still waiting → ask TikTok (cold re-open) */
  async check() {
    for (const k of ['entry', 'launch'] as TtPerk[]) {
      const now = Date.now();
      if (!perkWaiting(recs()[k], now)) continue;
      const ok = await hs.missionCheck(KIND[k]);
      if (ok !== true || !perkWaiting(recs()[k], Date.now())) continue;
      const r = recs();
      r[k] = perkConfirmed(r[k], ttPerks.amount(k), Date.now());
      save();
      redraw();
      game?.ui?.toast?.(`<b>Mission complete!</b> · tap CLAIM for your coins`, '#3fe07c');
    }
  },
  /** CLAIM: pays the waiting coins; returns what the reward card shows (null = nothing waiting) */
  claim(k: TtPerk): { coins: number; before: number; after: number } | null {
    if (!game?.save) return null;
    const r = recs();
    const c = perkClaim(r[k], Date.now());
    if (!c.coins) return null;
    r[k] = c.rec;
    const before = game.save.wallet;
    game.save.wallet = before + c.coins;
    save();
    game.ui?.refreshProfile?.(game.save);
    console.log(`[perk] CLAIM ${k} +${c.coins}`);
    redraw();
    return { coins: c.coins, before, after: before + c.coins };
  },
};
