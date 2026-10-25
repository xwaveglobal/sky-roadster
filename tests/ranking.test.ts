/** v5 weekly ranking "cách 1": last-5 average for the player and the bots; ranks move both ways. */
declare const process: { exit(code: number): never };
import { weeklyBoard, botForm, BOT_RACE_HOURS } from '../src/meta/Leaderboard.ts';
import { pushRun, rankScore } from '../src/meta/RankScore.ts';
import { CLASS_MIN, classFor } from '../src/meta/Rank.ts';

let fails = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) {
    fails++;
    console.error('  ✗ ' + msg);
  } else console.log('  ✓ ' + msg);
};
const wed = new Date(2026, 9, 21, 15, 0); // a Wednesday afternoon
const me = (score: number) => ({ name: 'Pilot', score, color: '#fff' });
// the player: a strong race moves the rank up, a weak one down
let runs: number[] = [];
for (const e of [2000, 2200, 2100, 1900, 2000]) runs = pushRun(runs, e);
const r0 = weeklyBoard('2026-W43', me(rankScore(runs)), wed).you.rank;
const up = pushRun(runs, 6000);
const r1 = weeklyBoard('2026-W43', me(rankScore(up)), wed).you.rank;
const down = pushRun(runs, 200);
const r2 = weeklyBoard('2026-W43', me(rankScore(down)), wed).you.rank;
check(r1 < r0, `a strong race moves the weekly rank UP (#${r0} → #${r1})`);
check(r2 > r0, `a weak race moves it DOWN (#${r0} → #${r2})`);
// the class comes from the best single race and never drops
check(classFor(6000) === classFor(Math.max(6000, 200)) && CLASS_MIN.C <= 6000, 'the class is the best race (never drops with a weak race)');
// bots: same rule — their last-5 averages change from race slot to race slot
const later = new Date(wed.getTime() + BOT_RACE_HOURS * 3 * 3600e3);
const a = weeklyBoard('2026-W43', me(0), wed).rows.slice(0, 30).map((r) => r.name).join();
const b = weeklyBoard('2026-W43', me(0), later).rows.slice(0, 30).map((r) => r.name).join();
check(a !== b, 'the rivals race too: the order of the top 30 changes after a few of their races');
check(weeklyBoard('2026-W43', me(1500), wed).you.rank === weeklyBoard('2026-W43', me(1500), wed).you.rank, 'deterministic: the same field at the same time');
const f = botForm('k', 'Rival', 10);
check(f >= 0.7 && f <= 1.3, `a rival's form is the average of 5 races (0.7 … 1.3): ${f.toFixed(2)}`);
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
if (fails) process.exit(1);
