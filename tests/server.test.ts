/** v2.3 server rules: EXP constants match the game, runs are verified, saves can't raise EXP. */
declare const process: { exit(code: number): never };
import { EXP, RANKING } from '../src/config.ts';
import { pushRun as cPush, rankScore as cScore } from '../src/meta/RankScore.ts';
import { VARIANTS } from '../src/gameplay/Difficulty.ts';
// @ts-expect-error plain JS module (no types)
import { EXP_RATE, RATE_MUL, RANKS, RANK_RUNS, pushRun, rankScore, verifyRun, clampSave, rankOf } from '../server/core.mjs';

let fails = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) {
    fails++;
    console.error('  ✗ ' + msg);
  } else console.log('  ✓ ' + msg);
};
check(JSON.stringify(EXP_RATE) === JSON.stringify(EXP.rate), `server EXP rates = config (${JSON.stringify(EXP.rate)})`);
check(RATE_MUL.endless === VARIANTS.endless.rateMul && RATE_MUL.track2 === VARIANTS.track2.rateMul, 'server road multipliers = Difficulty VARIANTS');
check(JSON.stringify(RANKS) === JSON.stringify(EXP.rank), 'server rank thresholds = config');
const ok = verifyRun({ variant: 'endless', level: 'hard', distance: 10000, seconds: 240, exp: 3180 });
check(ok.ok && ok.exp === 3180, 'a normal run is accepted at its EXP');
const inflated = verifyRun({ variant: 'endless', level: 'hard', distance: 10000, seconds: 240, exp: 99999 });
check(inflated.ok && inflated.exp <= Math.floor(10000 * EXP.rate.hard * 1.35), 'inflated EXP is capped at distance × rate (+ Double EXP slack)');
check(!verifyRun({ variant: 'endless', level: 'hard', distance: 100000, seconds: 60, exp: 1 }).ok, 'impossible speed is rejected');
check(!verifyRun({ variant: 'x', level: 'hard', distance: 1, seconds: 1, exp: 1 }).ok, 'unknown road is rejected');
const s = clampSave({ expBest: 50000, exp2Best: 9, wallet: 7 }, { expBest: 3000, exp2Best: 0, expWeek: 0 });
check(s.expBest === 3000 && s.exp2Best === 0 && s.wallet === 7, 'a save never raises EXP above the verified best');
check(rankOf(40000) === 'AAA' && rankOf(40000, 65000) === 'S' && rankOf(2999) === 'D', 'rank from verified EXP');
// v5 weekly rank score = average EXP of the last 5 races (client and server: same rule)
check(RANK_RUNS === RANKING.lastRuns, `server rank window = config (${RANKING.lastRuns} races)`);
{
  let sr: number[] = [];
  let cr: number[] = [];
  const races = [3000, 1000, 2000, 4000, 5000, 600];
  const seen: number[] = [];
  for (const e of races) {
    sr = pushRun(sr, e);
    cr = cPush(cr, e);
    seen.push(rankScore(sr));
  }
  check(JSON.stringify(sr) === JSON.stringify(cr) && rankScore(sr) === cScore(cr), 'client and server keep the same last-5 list and score');
  check(sr.length === 5 && rankScore(sr) === Math.round((1000 + 2000 + 4000 + 5000 + 600) / 5), 'only the last 5 races count (average)');
  check(seen[0] === 3000 && seen[1] === 2000 && seen[5] < seen[4], 'every race moves the score — up or down (3000 → 2000 … then a weak race drops it)');
  check(rankScore([]) === 0, 'no race this week → 0');
}
{
  const v = { expBest: 5000, exp2Best: 0, expWeek: 1800, weekRuns: [1000, 2600] };
  const c = clampSave({ expBest: 9000, expWeek: 4000 }, v);
  check(c.expWeek === 1800 && c.weekRuns.join() === '1000,2600', 'a save never raises the weekly score above the verified average');
}
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
if (fails) process.exit(1);
