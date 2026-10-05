import { attachOwned, delay } from './cdp.mjs';
import fs from 'node:fs/promises';
const {tab}=await attachOwned();
const checks=[];const check=(name,passed,detail={})=>{checks.push({name,passed:passed===true,detail});console.log((passed===true?'PASS ':'FAIL ')+name+' '+JSON.stringify(detail));};
const rooms=['office','hub','approval','button','loop','archive','gallery','observatory','garden','quiet','records','mirror','stairwell','workshop','flood','rooftop'];
const roomsObserved=[];
try {
 await tab.send('Runtime.enable');await tab.viewport();
 await tab.navigate('http://127.0.0.1:5238/?qa=1&r=expand2');await tab.wait('!!window.__GAME__');
 await tab.eval('window.__GAME__.audio.voice=false;true');
 await tab.eval('window.__GAME__.qa.reset();true');
 const before=await tab.eval('window.__GAME__.snapshot()');
 await tab.key('KeyW');await delay(850);await tab.key('KeyW',false);
 const after=await tab.eval('window.__GAME__.snapshot()');check('normal W input walks forward',after.position[2]<before.position[2]-0.5,{before:before.position,after:after.position});
 await tab.key('KeyD');await delay(500);await tab.key('KeyD',false);const right=await tab.eval('window.__GAME__.snapshot()');check('D strafes right in camera space',right.position[0]>after.position[0]+0.3,{before:after.position,after:right.position});
 await tab.press('Escape');check('Escape pauses honestly',(await tab.eval('window.__GAME__.state'))==='paused');
 const paused=await tab.eval('window.__GAME__.camera.position.toArray()');await tab.key('KeyW');await delay(250);await tab.key('KeyW',false);check('paused movement does not drift',JSON.stringify(await tab.eval('window.__GAME__.camera.position.toArray()'))===JSON.stringify(paused));
 await tab.eval('window.__GAME__.resume(false);true');check('resume has no lingering manual keys',(await tab.eval('window.__GAME__.keys.size'))===0);
 await tab.eval("window.__GAME__.qa.pose(2.8,-4.15,0,0);window.__GAME__.findTarget();true");const t=await tab.eval('window.__GAME__.target?.action');check('actual door raycast resolves the office exit',t==='to_hub',{target:t});
 if(t==='to_hub'){await tab.press('KeyE');await delay(350);check('E on that physical door enters the hub',(await tab.eval('window.__GAME__.run.room'))==='hub');}
 await tab.eval("window.__GAME__.qa.enter('button');window.__GAME__.qa.pose(0,0.5,0,-0.19);window.__GAME__.findTarget();true");const b=await tab.eval('window.__GAME__.target?.action');check('physical button is reachable by the interaction ray',b==='button',{target:b});if(b==='button'){await tab.press('KeyE');check('normal E input changes the button count',(await tab.eval('window.__GAME__.run.button'))===1);}
 await tab.eval("window.__GAME__.qa.enter('records');window.__GAME__.qa.pose(0,-1.0,0,-0.27);window.__GAME__.findTarget();true");const rf=await tab.eval('window.__GAME__.target?.action');check('the new records file is physically reachable by ray',rf==='records_file',{target:rf});
 await tab.eval("window.__GAME__.qa.enter('mirror');window.__GAME__.qa.pose(0,-1.2,0,-0.30);window.__GAME__.findTarget();true");const mg=await tab.eval('window.__GAME__.target?.action');check('a new aerial glass version is physically reachable by ray',!!mg&&mg.startsWith('mirror_'),{target:mg});
 await tab.eval("window.__GAME__.qa.enter('quiet');true");
 const opened=await tab.eval(`(()=>{const g=window.__GAME__,t=g.world.targets.find(x=>x.action==='to_archive');if(!t)return {ok:false,why:'no to_archive target in quiet'};const p=t.mesh.position.clone();t.mesh.getWorldPosition(p);for(const radius of [1.8,2.5,3.1])for(let i=0;i<16;i++){const a=i*Math.PI/8,x=p.x+Math.sin(a)*radius,z=p.z+Math.cos(a)*radius,b=g.world.bounds;if(x<b.minX+.3||x>b.maxX-.3||z<b.minZ+.3||z>b.maxZ-.3)continue;if(g.world.colliders.some(c=>x>c.minX-.28&&x<c.maxX+.28&&z>c.minZ-.28&&z<c.maxZ+.28))continue;g.camera.position.set(x,1.7,z);g.yaw=Math.atan2(-(p.x-x),-(p.z-z));g.pitch=Math.atan2(p.y-1.7,Math.hypot(p.x-x,p.z-z));g.camera.rotation.set(g.pitch,g.yaw,0);g.findTarget();if(g.target?.action==='to_archive')return {ok:true,x,z};}return {ok:false,why:'no vantage'};})()`);
 check('the quiet room exit panel resolves as a real target',opened.ok===true,opened);
 if(opened.ok){
  const armed=await tab.eval("({action:window.__GAME__.target?.action,state:window.__GAME__.state,transitioning:window.__GAME__.transitioning,hidden:document.hidden})");
  check('the quiet exit is still armed on the frame before the key press',armed.action==='to_archive',armed);
  await tab.press('KeyE');await delay(450);
  const after=await tab.eval("({room:window.__GAME__.run.room,state:window.__GAME__.state,caption:document.getElementById('caption').textContent.slice(0,60)})");
  check('E on the previously dead quiet-room exit really enters the archive',after.room==='archive',after);
 }
 for(const room of rooms){
  await tab.eval(`window.__GAME__.qa.enter(${JSON.stringify(room)}); true`);await delay(180);
  const s=await tab.eval('window.__GAME__.snapshot()');const meshes=await tab.eval('window.__GAME__.world.scene.children.length');roomsObserved.push({room,state:s,meshes});check('room builds and renders: '+room,s.room===room&&s.draws>0&&s.triangles>100&&s.metrics.errors.length===0,{draws:s.draws,triangles:s.triangles,meshes,fps:s.fps});
  await tab.shot('qa/'+room+'-first.png');
 }
 const cases=[
  ['desk','office',['office_desk','office_desk','office_desk']],
  ['compliance','approval',['stamp','stamp','stamp','stamp','approve']],
  ['petty','gallery',['petty','petty','petty','petty']],
  ['wonder','garden',['garden_bench']],
  ['departure','garden',['depart']],
  ['author','observatory',['author']],
  ['refusal','stairwell',['stair_down']],
  ['successor','rooftop',['roof_accept']],
  ['predecessor','records',['records_file','records_file','records_confront']],
  ['merge','workshop',['workshop_repair','workshop_stay']],
  ['homecoming','rooftop',['records_file','records_file','records_shelf','mirror_look','flood_reach','roof_name','free_predecessor']],
 ];
 for(const [expected,room,actions] of cases){
  await tab.eval('window.__GAME__.qa.reset();true');
  for(const action of actions)await tab.eval(`window.__GAME__.qa.do(${JSON.stringify(action)});true`);
  const s=await tab.eval('window.__GAME__.snapshot()');
  const title=await tab.eval("document.getElementById('ending-title').textContent");
  check('ending route: '+expected,s.state==='ended'&&s.endings.includes(expected),{state:s.state,title});
 }
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.enter('quiet');window.__GAME__.qa.do('sit');true");await delay(150);await tab.eval('window.__GAME__.qa.advanceQuiet(19);true');let s=await tab.eval('window.__GAME__.snapshot()');check('stillness ending is reachable without moving the player',s.state==='ended'&&s.endings.includes('stillness'),{quietTime:s.run.quietTime});
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.do('loop');window.__GAME__.qa.do('loop');window.__GAME__.qa.do('loop');true");check('three repeated corridor passages reach the archive',(await tab.eval('window.__GAME__.run.room'))==='archive');
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.do('office_page');true");const clue=await tab.eval('window.__GAME__.snapshot()');check('a real clue updates the run and the HUD counter',clue.traces===1&&(await tab.eval("document.getElementById('traces').hidden"))===false,{traces:clue.traces,hud:await tab.eval("document.getElementById('traces').textContent")});
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.do('office_page');window.__GAME__.qa.do('mirror_look');window.__GAME__.qa.do('to_workshop');true");check('the workshop gate opens once the workshop threshold of truth is met',(await tab.eval('window.__GAME__.run.room'))==='workshop');
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.do('to_workshop');true");check('the workshop gate refuses an unearned entry with a real line',(await tab.eval("document.getElementById('caption').textContent")).includes('panels off'));
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.do('office_page');window.__GAME__.qa.do('mirror_look');window.__GAME__.qa.do('to_rooftop');true");check('the roof gate refuses below three traces and names the reason',(await tab.eval("document.getElementById('caption').textContent")).includes('sealed it'));
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.enter('office');window.__GAME__.pause();true");await tab.eval("document.getElementById('dossier-button').click();true");
 const dossier=await tab.eval("({open:!document.getElementById('dossier').hidden,empty:document.getElementById('dossier-list').textContent.length>10})");check('the clue dossier opens from pause and has an honest empty state',dossier.open&&dossier.empty,dossier);
 await tab.eval("document.getElementById('dossier-close').click();true");check('closing the dossier returns to pause, not to gameplay',(await tab.eval("({pause:!document.getElementById('pause').hidden,dossier:!document.getElementById('dossier').hidden})")).pause===true);
 await tab.eval("window.__GAME__.qa.reset();window.__GAME__.qa.enter('quiet');window.__GAME__.qa.do('sit');window.__GAME__.qa.advanceQuiet(4);true");await tab.key('KeyW');await delay(400);await tab.key('KeyW',false);check('walking cancels sitting without a penalty',(await tab.eval('window.__GAME__.run.sitting'))===false);
 await tab.eval("window.__GAME__.qa.enter('office');true");await delay(280);const firstMemory=await tab.eval('window.__GAME__.snapshot()');
 for(let pass=0;pass<2;pass++)for(const room of rooms){await tab.eval(`window.__GAME__.qa.enter(${JSON.stringify(room)});true`);await delay(40);}
 await tab.eval("window.__GAME__.qa.enter('office');true");await delay(280);const memory=await tab.eval('window.__GAME__.snapshot()');check('scene replacement retains bounded GPU resources across sixteen rooms',memory.textures<=firstMemory.textures+3&&memory.geometries<=firstMemory.geometries+3,{before:[firstMemory.textures,firstMemory.geometries],after:[memory.textures,memory.geometries]});
 const external=await tab.eval("performance.getEntriesByType('resource').map(x=>x.name).filter(x=>/^https?:/.test(x)&&!x.startsWith(location.origin))");check('game runtime does not request external resources',external.length===0,{requests:external});
 await tab.viewport(390,844);await tab.eval('window.__GAME__.title();true');await delay(200);await tab.shot('qa/mobile-first.png');const overflow=await tab.eval('document.documentElement.scrollWidth>innerWidth');check('title screen has no horizontal overflow at 390px',!overflow);
 await tab.viewport();await tab.eval('window.__GAME__.title();true');await tab.shot('qa/title.png');
 const endings=await tab.eval('window.__GAME__.saved.endings');const errors=await tab.eval('window.__GAME__.metrics.errors');
 const normalNames=/normal W input|D strafes|Escape pauses|E on that physical|normal E input|records file is physically|glass version is physically/;
 const normalChecks=checks.filter(x=>normalNames.test(x.name));
 const report={checks,passed:checks.filter(x=>x.passed===true).length,failed:checks.filter(x=>x.passed!==true).length,room_count:new Set(roomsObserved.map(x=>x.room)).size,ending_count:new Set(endings).size,errors:errors.length,error_details:errors,normal_input_checked:normalChecks.length===7&&normalChecks.every(x=>x.passed===true),rooms:roomsObserved,endings,scope:'Keyboard/raycast smoke tests plus explicit QA relocation and reducer actions; not a full manual playthrough.'};
 await fs.writeFile('qa/runtime-results.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,rooms:report.room_count,endings:report.ending_count,errors:report.errors,normal_input:report.normal_input_checked},null,2));
} finally {await tab.close();}
