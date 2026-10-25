/**
 * v5 (owner 2026-10-25) — which special a Restart takes, without the pick screen. Pure (tested in Node).
 *  1. the special the player picked last, if the bag still has one;
 *  2. else another special still in the bag (Roadster → HYPER → SOS);
 *  3. empty bag → no special.
 * `last === null` = the player picked "no special" on purpose → none again.
 * `last === undefined` = never picked (an old save) → the equipped one, then the same fallbacks.
 */
export type Special = 'super' | 'hyper' | 'escape';
export const RESTART_ORDER: Special[] = ['super', 'hyper', 'escape'];

export function restartSpecial(items: Record<Special, number>, last: Special | null | undefined, equipped: Special | null | undefined): Special | null {
  if (last === null) return null;
  const want = last ?? equipped ?? null;
  if (want && items[want] > 0) return want;
  return RESTART_ORDER.find((k) => items[k] > 0) ?? null;
}
