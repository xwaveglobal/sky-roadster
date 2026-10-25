/** v5 Restart special: last pick → another one in the bag → none. Pure (Node). */
declare const process: { exit(code: number): never };
import { restartSpecial } from '../src/meta/Restart.ts';

let fails = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) {
    fails++;
    console.error('  ✗ ' + msg);
  } else console.log('  ✓ ' + msg);
};
const bag = (s: number, h: number, e: number) => ({ super: s, hyper: h, escape: e });
check(restartSpecial(bag(1, 2, 3), 'hyper', 'super') === 'hyper', 'the last pick is used while the bag has it');
check(restartSpecial(bag(1, 0, 3), 'hyper', 'hyper') === 'super', 'last pick used up → another special from the bag (Roadster first)');
check(restartSpecial(bag(0, 0, 2), 'super', 'super') === 'escape', '… or whatever is left (SOS)');
check(restartSpecial(bag(0, 0, 0), 'super', 'super') === null, 'empty bag → the race starts without a special');
check(restartSpecial(bag(3, 3, 3), null, 'super') === null, '"no special" picked on purpose → none again');
check(restartSpecial(bag(0, 2, 0), undefined, 'hyper') === 'hyper', 'old save (never picked): the equipped special');
check(restartSpecial(bag(0, 0, 1), undefined, null) === 'escape', 'old save, nothing equipped: any special in the bag');
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
if (fails) process.exit(1);
