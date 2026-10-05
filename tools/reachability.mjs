import {attachOwned,delay} from './cdp.mjs';
import fs from 'node:fs/promises';
const {tab}=await attachOwned();
const rooms=['office','hub','approval','button','loop','archive','gallery','observatory','garden','quiet','records','mirror','stairwell','workshop','flood','rooftop'];
const report=[];
try {
 for(const room of rooms){
  await tab.eval(`window.__GAME__.qa.enter('${room}');true`);
  const result=await tab.eval(`(()=>{const g=window.__GAME__,out=[];for(const t of g.world.targets){const p=t.mesh.position.clone();t.mesh.getWorldPosition(p);let found=null;for(const radius of [1.8,2.5,3.1]){for(let i=0;i<16;i++){const a=i*Math.PI/8,x=p.x+Math.sin(a)*radius,z=p.z+Math.cos(a)*radius,b=g.world.bounds;if(x<b.minX+.3||x>b.maxX-.3||z<b.minZ+.3||z>b.maxZ-.3)continue;if(g.world.colliders.some(c=>x>c.minX-.28&&x<c.maxX+.28&&z>c.minZ-.28&&z<c.maxZ+.28))continue;g.camera.position.set(x,1.7,z);g.yaw=Math.atan2(-(p.x-x),-(p.z-z));g.pitch=Math.atan2(p.y-1.7,Math.hypot(p.x-x,p.z-z));g.camera.rotation.set(g.pitch,g.yaw,0);g.findTarget();if(g.target?.action===t.action){found={x,z,yaw:g.yaw,pitch:g.pitch};break;}}if(found)break;}out.push({room:g.run.room,action:t.action,label:t.label,reachable:!!found,vantage:found,targetPosition:p.toArray()});}return out;})()`);
  report.push(...result);
 }
 const byRoom={};for(const item of report)byRoom[item.room]=(byRoom[item.room]||0)+1;
 await fs.writeFile('qa/reachability.json',JSON.stringify({checks:report,passed:report.filter(x=>x.reachable).length,failed:report.filter(x=>!x.reachable).length,rooms:rooms.length,byRoom},null,2));
 console.log(JSON.stringify({rooms:rooms.length,targets:report.length,passed:report.filter(x=>x.reachable).length,unreachable:report.filter(x=>!x.reachable)},null,2));
} finally {await tab.close();}
