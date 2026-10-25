/**
 * v5 weekly rank score = average EXP of the last RANKING.lastRuns EXP races (pure — tested in Node,
 * mirrored by server/core.mjs). Fewer races this week → the average of those played.
 */
import { RANKING } from '../config.ts';

/** the list after one more race (only the last RANKING.lastRuns are kept) */
export function pushRun(runs: readonly number[], exp: number, n = RANKING.lastRuns): number[] {
  return [...runs, Math.max(0, Math.floor(exp))].slice(-n);
}
/** rank score of a list of recent EXP races (0 when none) */
export function rankScore(runs: readonly number[], n = RANKING.lastRuns): number {
  const last = runs.slice(-n);
  if (!last.length) return 0;
  return Math.round(last.reduce((a, b) => a + b, 0) / last.length);
}
