import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialRun, interact, moveCircle, actionsForKeys, safeSave, traceCount, ROOM_IDS, ENDING_IDS, TRACE_IDS, WORKSHOP_TRACES, ROOF_TRACES, HOMECOMING_TRACES } from '../src/rules.js';

const story = JSON.parse(readFileSync(new URL('../src/story.json', import.meta.url), 'utf8'));
const apply = actions => { let run = initialRun(), last; for (const action of actions) { last = interact(run, action); run = last.run; } return last; };
const play = actions => { let run = initialRun(), last; for (const action of actions) { last = interact(run, action); run = last.run; if (last.ending) break; } return last; };

// room -> the actions physically present there, mirroring src/world.js target() calls
const ROOM_ACTIONS = {
  office: ['office_desk','office_plant','office_clock','office_page','to_hub'],
  hub: ['hub_notice','to_office','to_approval','to_loop','to_button','to_stairwell'],
  approval: ['stamp','approve','shred','to_hub'],
  button: ['button','button_leave','loophole'],
  loop: ['loop','reject','to_hub'],
  archive: ['book','archive_note','to_records','to_observatory','to_quiet','to_gallery','to_hub'],
  gallery: ['gallery_case','petty','to_archive','to_hub'],
  records: ['records_file','records_shelf','records_confront','to_mirror','to_archive'],
  mirror: ['mirror_look','mirror_self','mirror_story','mirror_none','to_flood','to_records'],
  stairwell: ['stair_up','stair_down','to_workshop','to_hub'],
  workshop: ['workshop_repair','workshop_truth','workshop_stay','to_stairwell','to_flood'],
  flood: ['flood_reach','flood_listen','to_mirror','to_workshop'],
  observatory: ['orrery','observatory_note','author','to_garden','to_archive','to_rooftop'],
  garden: ['tree','garden_bench','depart','free_predecessor','to_observatory'],
  quiet: ['sit','to_archive'],
  rooftop: ['roof_look','roof_name','roof_accept','free_predecessor','to_observatory'],
};

test('a new run is manual, clue-free and has no silently acquired ending', () => {
  const run = initialRun();
  assert.equal(run.room, 'office');
  assert.equal(run.sitting, false);
  assert.equal(traceCount(run), 0);
  assert.equal(run.predecessor, false);
  assert.deepEqual(safeSave(null).endings, []);
});

test('standing at a desk is a choice, not an enforced time gate', () => {
  assert.equal(apply(['office_desk','office_desk']).ending, null);
  assert.equal(apply(['office_desk','office_desk','office_desk']).ending, 'desk');
});

test('approval rejects insufficient stamps and keeps the shred escape available', () => {
  assert.equal(apply(['stamp','stamp','stamp','approve']).ending, null);
  assert.equal(apply(['stamp','stamp','stamp','stamp','approve']).ending, 'compliance');
  assert.equal(apply(['shred']).room, 'archive');
});

test('the annoying button has a finite eight-press conclusion', () => {
  assert.equal(apply(Array(7).fill('button')).ending, null);
  assert.equal(apply(Array(8).fill('button')).ending, 'petty');
  assert.equal(apply(Array(12).fill('button')).run.button, 8);
});

test('the button room offers two honest escapes at every count', () => {
  for (let i = 0; i < 8; i++) {
    assert.equal(apply([...Array(i).fill('button'),'button_leave']).room, 'gallery');
    assert.equal(apply([...Array(i).fill('button'),'loophole']).room, 'garden');
  }
});

test('repeated corridor resolves after three traversals', () => {
  assert.equal(apply(['loop','loop']).room, 'loop');
  assert.equal(apply(['loop','loop','loop']).room, 'archive');
});

test('rejecting the corridor is available before any repetition', () => {
  assert.equal(apply(['reject']).room, 'archive');
});

test('the museum refuses to become an endless click trap', () => {
  assert.equal(apply(Array(4).fill('petty')).ending, 'petty');
});

test('all seven original endings are still reachable', () => {
  assert.equal(play(['office_desk','office_desk','office_desk']).ending, 'desk');
  assert.equal(play(['stamp','stamp','stamp','stamp','approve']).ending, 'compliance');
  assert.equal(play(Array(8).fill('button')).ending, 'petty');
  assert.equal(play(['garden_bench']).ending, 'wonder');
  assert.equal(play(['depart']).ending, 'departure');
  assert.equal(play(['author']).ending, 'author');
});

test('sitting is reversible and resets the calm timer', () => {
  let r = interact(initialRun(), 'sit').run;
  assert.equal(r.sitting, true);
  r.quietTime = 8;
  assert.equal(interact(r, 'sit').run.sitting, false);
  assert.equal(interact(r, 'sit').run.quietTime, 0);
});

test('borrowing a memory cycles the four authored passages', () => {
  assert.equal(apply(Array(5).fill('book')).line, 'archive_book1');
});

test('diagonal input and independent arrow aliases do not cancel on release', () => {
  assert.deepEqual(actionsForKeys(new Set(['KeyW','KeyD'])), { forward:1, right:1, turn:0, run:false });
  assert.equal(actionsForKeys(new Set(['ArrowUp'])).forward, 1);
  assert.equal(actionsForKeys(new Set(['ArrowRight'])).turn, 1);
});

test('collision forbids tunneling through a desk under a long step', () => {
  const r = moveCircle({x:0,z:5},{x:0,z:-20},{minX:-10,maxX:10,minZ:-10,maxZ:10},[{minX:-1,maxX:1,minZ:0,maxZ:2}]);
  assert.ok(r.z >= 2.28);
});

test('collision permits tangential sliding rather than sticking to a wall', () => {
  const r = moveCircle({x:0.7,z:3},{x:2,z:-3},{minX:-10,maxX:10,minZ:-10,maxZ:10},[{minX:-1,maxX:1,minZ:0,maxZ:2}]);
  assert.ok(r.x > 2);
});

test('all room edges contain the player radius', () => {
  const b = {minX:-2,maxX:2,minZ:-2,maxZ:2};
  for (const [x,z] of [[100,0],[-100,0],[0,100],[0,-100]]) {
    const r = moveCircle({x:0,z:0},{x,z},b,[]);
    assert.ok(r.x >= -1.72 && r.x <= 1.72 && r.z >= -1.72 && r.z <= 1.72);
  }
});

test('corrupt saves do not invent endings, rooms or clues', () => {
  const s = safeSave({endings:['petty','unknown','petty'],runs:-30,checkpoint:{room:'neverland'},last:'unknown'});
  assert.deepEqual(s, {endings:['petty'],runs:0,last:null,checkpoint:null});
});

test('the expanded route vocabulary has sixteen rooms, twelve endings and five traces', () => {
  assert.equal(ROOM_IDS.length, 16);
  assert.equal(ENDING_IDS.length, 12);
  assert.equal(TRACE_IDS.length, 5);
});

test('reducer returns new state without modifying the prior run', () => {
  const r = initialRun();
  const o = interact(r, 'stamp');
  assert.equal(r.stamps, 0);
  assert.equal(o.run.stamps, 1);
  assert.notEqual(o.run, r);
});

test('recording a clue never mutates the previous run object', () => {
  const r = initialRun();
  const o = interact(r, 'office_page');
  assert.equal(traceCount(r), 0);
  assert.equal(traceCount(o.run), 1);
});

// ---- connected-world integrity ----

test('every room is reachable from the office through the authored target graph', () => {
  const seen = new Set(['office']);
  const queue = ['office'];
  while (queue.length) {
    const room = queue.shift();
    for (const action of ROOM_ACTIONS[room]) {
      const out = interact({...initialRun(), room, traces:{file:true,photograph:true,recording:true,handprint:true,name:true}}, action);
      if (out.room && !seen.has(out.room)) { seen.add(out.room); queue.push(out.room); }
    }
  }
  assert.deepEqual([...seen].sort(), [...ROOM_IDS].sort());
});

test('every declared room has an authored entry line and every ending has authored text', () => {
  const missingRooms = ROOM_IDS.filter(r => !story.lines[r + '_intro']);
  assert.deepEqual(missingRooms, []);
  const missingEndings = ENDING_IDS.filter(id => !story.endings[id] || !story.endings[id].title || !story.endings[id].text || !story.endings[id].after);
  assert.deepEqual(missingEndings, []);
});

test('every dialogue line the reducer can emit exists in the authored story', () => {
  const emitted = new Set();
  const actions = new Set(Object.values(ROOM_ACTIONS).flat().concat(['wrong_way','to_rooftop','to_workshop','free_predecessor','records_confront','workshop_stay']));
  for (const action of actions) {
    for (const traces of [{}, {file:true}, {file:true,photograph:true}, {file:true,photograph:true,recording:true,handprint:true,name:true}]) {
      for (const mercy of [0,1]) for (const predecessor of [false,true]) for (const count of [0,4,8]) {
        const run = {...initialRun(), room:'office', traces:{...traces}, mercy, predecessor, button:Math.min(count,8), petty:Math.min(count,4), desk:Math.min(count,3), stamps:Math.min(count,4), loops:count, books:count, files:count, shelf:count, listens:count};
        const out = interact(run, action);
        if (out.line) emitted.add(out.line);
      }
    }
  }
  const unknown = [...emitted].filter(id => !story.lines[id]);
  assert.deepEqual(unknown, []);
  assert.ok(emitted.size >= 40, 'expected a substantial emitted-line surface, saw ' + emitted.size);
});

test('the workshop stays sealed until enough truth is found', () => {
  assert.equal(interact({...initialRun(), traces:{file:true}}, 'to_workshop').room, null);
  assert.equal(interact({...initialRun(), traces:{file:true}}, 'to_workshop').line, 'workshop_locked');
  assert.equal(interact({...initialRun(), traces:{file:true,photograph:true}}, 'to_workshop').room, 'workshop');
  assert.equal(WORKSHOP_TRACES, 2);
});

test('the roof stays sealed until enough truth is found', () => {
  const two = {file:true,photograph:true};
  assert.equal(interact({...initialRun(), traces:two}, 'to_rooftop').line, 'roof_locked');
  assert.equal(interact({...initialRun(), traces:{...two,recording:true}}, 'to_rooftop').room, 'rooftop');
  assert.equal(ROOF_TRACES, 3);
});

test('refusal is an honest exit available immediately, with no locked door', () => {
  assert.equal(play(['stair_down']).ending, 'refusal');
});

test('merging with the building requires an act of care, not just arrival', () => {
  assert.equal(play(['workshop_stay']).ending, null);
  assert.equal(play(['workshop_stay']).line, 'workshop_stay_early');
  assert.equal(play(['workshop_repair','workshop_stay']).ending, 'merge');
});

test('taking the next shift is a deliberate, always-available ending', () => {
  assert.equal(play(['roof_accept']).ending, 'successor');
});

test('the predecessor is revealed only after reading the file to its end', () => {
  assert.equal(play(['records_confront']).ending, null);
  assert.equal(play(['records_confront']).line, 'records_early');
  const twice = apply(['records_file','records_file']);
  assert.equal(twice.run.predecessor, true);
  assert.equal(interact(twice.run, 'records_confront').ending, 'predecessor');
});

test('freeing the first Sadman requires both the successor knowledge and four traces', () => {
  assert.equal(play(['free_predecessor']).ending, null);
  assert.equal(HOMECOMING_TRACES, 4);
  const staged = apply(['records_file','records_file','records_shelf','mirror_look','flood_reach']);
  assert.equal(staged.run.predecessor, true);
  assert.equal(traceCount(staged.run), 3);
  assert.equal(interact(staged.run, 'free_predecessor').ending, null);
  const ready = interact(staged.run, 'roof_name').run;
  assert.equal(traceCount(ready), 4);
  assert.equal(interact(ready, 'free_predecessor').ending, 'homecoming');
});

test('clues are only ever recorded from their authored source action', () => {
  assert.equal(traceCount(apply(['flood_listen']).run), 0);
  assert.equal(traceCount(apply(['workshop_truth']).run), 1);
  assert.equal(traceCount(apply(['roof_name']).run), 1);
  assert.equal(traceCount(apply(['office_page']).run), 1);
});

test('the self/story/none alignment is exclusive and recorded', () => {
  assert.equal(apply(['mirror_self']).run.alignment, 'self');
  assert.equal(apply(['mirror_none']).run.alignment, 'none');
  assert.equal(apply(['mirror_story','mirror_none']).run.alignment, 'none');
  assert.equal(traceCount(apply(['mirror_look']).run), 1);
});

test('no door or interactable in the world falls through to the generic refusal', () => {
  const world = readFileSync(new URL('../src/world.js', import.meta.url), 'utf8');
  // a real door either changes room, ends the run, or refuses in words it was written for;
  // falling through to 'wrong_way' means the reducer has no case for a door the world builds.
  const resolved = action => {
    const o = interact(initialRun(), action);
    if (o.room || o.ending) return true;
    return Boolean(o.line) && o.line !== 'wrong_way' && Boolean(story.lines[o.line]);
  };
  const doors = [...new Set([...world.matchAll(/this\.portal\('([a-z_]+)'/g)].map(m => m[1]))];
  assert.ok(doors.length >= 20, 'expected a large authored door surface, saw ' + doors.length);
  assert.deepEqual(doors.filter(a => !resolved(a)), []);

  const targets = [...new Set([
    ...[...world.matchAll(/this\.target\([^)]*,'([a-z_]+)'/g)].map(m => m[1]),
    ...[...world.matchAll(/this\.clock\([^)]*,'([a-z_]+)'\)/g)].map(m => m[1]),
  ])];
  assert.ok(targets.length >= 25, 'expected many authored interactables, saw ' + targets.length);
  assert.deepEqual(targets.filter(a => !resolved(a)), []);
});

test('the two authored lines that used to be unreachable are now emitted on their beat', () => {
  assert.equal(play(['stamp','stamp','stamp','stamp','approve']).line, 'approval_exit');
  const staged = apply(['records_file','records_file']);
  assert.equal(interact(staged.run, 'records_confront').line, 'records_confront');
});
