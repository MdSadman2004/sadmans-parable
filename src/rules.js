export const ROOM_IDS = Object.freeze(['office','hub','approval','button','loop','archive','gallery','observatory','garden','quiet','records','mirror','stairwell','workshop','flood','rooftop']);
export const ENDING_IDS = Object.freeze(['compliance','petty','stillness','wonder','departure','author','desk','predecessor','successor','refusal','merge','homecoming']);
export const TRACE_IDS = Object.freeze(['file','photograph','recording','handprint','name']);
export const SAVE_KEY = 'sadmans-parable:v1';
export const PLAYER_RADIUS = 0.28;
export const WALK_SPEED = 3.5;
export const RUN_SPEED = 5.4;
export const QUIET_SECONDS = 18;
export const WORKSHOP_TRACES = 2;
export const ROOF_TRACES = 3;
export const HOMECOMING_TRACES = 4;

export function initialRun() {
  return { room: 'office', stamps: 0, button: 0, loops: 0, petty: 0, desk: 0, books: 0, tree: false, authorFound: false, sitting: false, quietTime: 0, visits: {}, seen: {}, elapsed: 0, traces: {}, predecessor: false, alignment: null, mercy: 0, files: 0, shelf: 0, listens: 0 };
}

export function traceCount(run) {
  if (!run || typeof run.traces !== 'object' || !run.traces) return 0;
  return TRACE_IDS.filter(id => run.traces[id] === true).length;
}

export function safeSave(raw) {
  if (!raw || typeof raw !== 'object') return { endings: [], runs: 0, last: null, checkpoint: null };
  const endings = Array.isArray(raw.endings) ? [...new Set(raw.endings.filter(id => ENDING_IDS.includes(id)))] : [];
  const runs = Number.isFinite(raw.runs) ? Math.max(0, Math.floor(raw.runs)) : 0;
  const checkpoint = raw.checkpoint && ROOM_IDS.includes(raw.checkpoint.room) ? raw.checkpoint : null;
  return { endings, runs, last: ENDING_IDS.includes(raw.last) ? raw.last : null, checkpoint };
}

export function moveCircle(position, delta, bounds, colliders, radius = PLAYER_RADIUS) {
  // Resolve the two axes independently: it slides against furniture rather than sticking.
  const result = { x: position.x, z: position.z };
  const allowed = (x, z) => {
    if (x < bounds.minX + radius || x > bounds.maxX - radius || z < bounds.minZ + radius || z > bounds.maxZ - radius) return false;
    return !colliders.some(box => x > box.minX - radius && x < box.maxX + radius && z > box.minZ - radius && z < box.maxZ + radius);
  };
  const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / (radius * 0.65)));
  for (let i=0; i<steps; i++) {
    const x = result.x + delta.x / steps;
    const z = result.z + delta.z / steps;
    if (allowed(x, result.z)) result.x = x;
    if (allowed(result.x, z)) result.z = z;
  }
  return result;
}

export function actionsForKeys(keys) {
  return { forward: Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')), right: Number(keys.has('KeyD')) - Number(keys.has('KeyA')), turn: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')), run: keys.has('ShiftLeft') || keys.has('ShiftRight') };
}

export function interact(run, action) {
  const next = { ...run, traces: { ...(run.traces || {}) } };
  const outcome = { run: next, line: null, room: null, ending: null, sound: 'click' };
  const line = id => { outcome.line = id; };
  const room = id => { outcome.room = id; };
  const ending = id => { outcome.ending = id; };
  const trace = id => { if (!next.traces[id]) next.traces = { ...next.traces, [id]: true }; };
  switch (action) {
    case 'office_desk': next.desk++; line('office_desk'); if(next.desk >= 3) ending('desk'); break;
    case 'office_plant': line('office_plant'); break;
    case 'office_clock': line('office_clock'); break;
    case 'office_page': trace('file'); line('office_page'); break;
    case 'to_hub': room('hub'); break;
    case 'to_office': line('hub_back'); room('office'); break;

    case 'hub_notice': line('hub_notice'); break;
    case 'to_stairwell': room('stairwell'); break;
    case 'to_approval': room('approval'); break;
    case 'to_loop': room('loop'); break;
    case 'to_button': room('button'); break;

    case 'stamp': next.stamps = Math.min(4, next.stamps + 1); line('approval_stamp'+next.stamps); break;
    case 'approve': if(next.stamps >= 4) { line('approval_exit'); ending('compliance'); } else line('locked'); break;
    case 'shred': line('approval_shred'); room('archive'); break;

    case 'button': next.button = Math.min(8, next.button + 1); line('button'+next.button); if(next.button >= 8) ending('petty'); break;
    case 'button_leave': line('button_leave'); room('gallery'); break;
    case 'loophole': line('button_loophole'); room('garden'); break;

    case 'loop': next.loops++; line('loop'+Math.min(3,next.loops)); room(next.loops >= 3 ? 'archive' : 'loop'); break;
    case 'reject': line('loop_reject'); room('archive'); break;

    case 'to_archive': room('archive'); break;
    case 'book': next.books++; line('archive_book'+(1+(next.books-1)%4)); break;
    case 'archive_note': line('archive_note'); break;
    case 'to_records': room('records'); break;
    case 'to_observatory': room('observatory'); break;
    case 'to_quiet': room('quiet'); break;
    case 'to_gallery': room('gallery'); break;

    case 'gallery_case': line('gallery_case'); break;
    case 'petty': next.petty++; line('gallery_button'+Math.min(4,next.petty)); if(next.petty>=4) ending('petty'); break;

    case 'records_file': next.files++; trace('file'); line('records_file'+Math.min(3,next.files)); if(next.files >= 2) next.predecessor = true; break;
    case 'records_shelf': next.shelf++; line('records_shelf'+(1+(next.shelf-1)%3)); break;
    case 'records_confront': if(next.predecessor) { line('records_confront'); ending('predecessor'); } else line('records_early'); break;
    case 'to_mirror': room('mirror'); break;

    case 'mirror_look': trace('photograph'); line('mirror_look'); break;
    case 'mirror_self': trace('photograph'); next.alignment = 'self'; line('mirror_self'); break;
    case 'mirror_story': trace('photograph'); next.alignment = 'story'; line('mirror_story'); break;
    case 'mirror_none': trace('photograph'); next.alignment = 'none'; line('mirror_none'); break;
    case 'to_flood': room('flood'); break;

    case 'stair_up': line('stair_up'); break;
    case 'stair_down': line('stair_down'); ending('refusal'); break;
    case 'to_workshop': if(traceCount(next) >= WORKSHOP_TRACES) room('workshop'); else line('workshop_locked'); break;

    case 'workshop_repair': next.mercy++; line('workshop_repair'); break;
    case 'workshop_truth': trace('handprint'); line('workshop_truth'); break;
    case 'workshop_stay': if(next.mercy >= 1) { line('workshop_stay'); ending('merge'); } else line('workshop_stay_early'); break;

    case 'flood_reach': trace('recording'); line('flood_reach'); break;
    case 'flood_listen': next.listens++; line('flood_listen'+Math.min(3,next.listens)); break;

    case 'roof_look': line('roof_look'); break;
    case 'roof_name': trace('name'); line('roof_name'); break;
    case 'roof_accept': line('roof_accept'); ending('successor'); break;
    case 'to_rooftop': if(traceCount(next) >= ROOF_TRACES) room('rooftop'); else line('roof_locked'); break;

    case 'orrery': line('observatory_orrery'); break;
    case 'observatory_note': line('observatory_note'); break;
    case 'author': next.authorFound=true; trace('name'); line('name_change'); ending('author'); break;
    case 'to_garden': room('garden'); break;

    case 'tree': next.tree=true; line('garden_tree'); break;
    case 'garden_bench': line('garden_bench'); ending('wonder'); break;
    case 'depart': line('garden_leave'); ending('departure'); break;
    case 'free_predecessor': if(next.predecessor && traceCount(next) >= HOMECOMING_TRACES) { line('free_predecessor'); ending('homecoming'); } else line('homecoming_locked'); break;

    case 'sit': next.sitting=!next.sitting; next.quietTime=0; line(next.sitting?'quiet_sit':'quiet_early'); break;

    default: line('wrong_way');
  }
  return outcome;
}
