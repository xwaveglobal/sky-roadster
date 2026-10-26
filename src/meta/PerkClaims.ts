/**
 * v5 (owner 2026-10-26) TikTok Entry / Launch rewards: GO → CLAIM → ✓ CLAIMED (once per game day).
 *
 * The HS kit pays a TikTok mission the moment TikTok confirms it (straight into the wallet). The owner
 * wants a visible CLAIM step, so the native layer moves that payment into `pend` (src/native/main.ts)
 * and the player collects it with CLAIM. A game day starts at 06:00 local time (PERK_DAY.resetHour).
 * Pure logic — no SDK, no DOM — so tests can run it in Node.
 */
export const PERK_DAY = { resetHour: 6, /** a GO tap still counts for a cold re-open this long */ goValidMs: 48 * 3600 * 1000 };

export interface PerkRec {
  /** time of the last GO tap (ms) — survives a cold re-open from the profile / the home-screen icon */
  go?: number;
  /** coins waiting for CLAIM */
  pend?: number;
  /** game day of the last CLAIM */
  claimed?: string;
}
export type PerkStatus = 'go' | 'claim' | 'claimed';

const p2 = (n: number) => (n < 10 ? '0' : '') + n;
/** the game day (YYYY-MM-DD) a moment belongs to: days start at resetHour:00 local time */
export function perkDay(now: number, hour = PERK_DAY.resetHour): string {
  const d = new Date(now - hour * 3600 * 1000);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}
/** ms until the next game day starts */
export function perkNextReset(now: number, hour = PERK_DAY.resetHour): number {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0, 0).getTime();
  return (next > now ? next : new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, hour, 0, 0, 0).getTime()) - now;
}
export function perkStatus(r: PerkRec | undefined, now: number): PerkStatus {
  if (r?.claimed === perkDay(now)) return 'claimed';
  if ((r?.pend ?? 0) > 0) return 'claim';
  return 'go';
}
/** GO tapped */
export function perkGo(r: PerkRec | undefined, now: number): PerkRec {
  return { ...(r ?? {}), go: now };
}
/** a GO that may still be confirmed by TikTok (also after a cold re-open) */
export function perkWaiting(r: PerkRec | undefined, now: number): boolean {
  return !!r?.go && now - r.go < PERK_DAY.goValidMs && perkStatus(r, now) === 'go';
}
/**
 * TikTok confirmed the mission (via the kit's payment or our own check): `coins` wait for CLAIM.
 * Already claimed this game day → nothing waits (one reward per day); never stacks.
 */
export function perkConfirmed(r: PerkRec | undefined, coins: number, now: number): PerkRec {
  const rec = { ...(r ?? {}) };
  delete rec.go;
  if (rec.claimed === perkDay(now) || coins <= 0) return rec;
  rec.pend = Math.max(rec.pend ?? 0, Math.round(coins));
  return rec;
}
/** CLAIM tapped: the coins to add (0 = nothing waiting / already claimed today) */
export function perkClaim(r: PerkRec | undefined, now: number): { rec: PerkRec; coins: number } {
  const rec = { ...(r ?? {}) };
  if (perkStatus(rec, now) !== 'claim') return { rec, coins: 0 };
  const coins = rec.pend ?? 0;
  rec.pend = 0;
  rec.claimed = perkDay(now);
  delete rec.go;
  return { rec, coins };
}
/** "14:22:05" */
export function fmtLeft(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${p2(Math.floor(s / 3600))}:${p2(Math.floor((s % 3600) / 60))}:${p2(s % 60)}`;
}
