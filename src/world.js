import * as THREE from 'three';

const PALETTE={ink:0x14292d,brass:0xb99a58,wood:0x50392c,wall:0xc6c5a8,green:0x356961,red:0xb45143,cream:0xe6dfbd};
const UNIT_BOX=new THREE.BoxGeometry(1,1,1);
const UNIT_SPHERE=new THREE.IcosahedronGeometry(1,2);
function rng(seed=3812) { return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}; }

function surface(kind,color) {
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,256,256);
 const random=rng(kind.length*913);
 for(let i=0;i<8500;i++){const x=random()*256,y=random()*256;ctx.fillStyle=`rgba(${random()>0.5?'255,255,220':'0,0,0'},${kind==='wood'?0.075:0.12})`;ctx.fillRect(x,y,kind==='wood'?12+random()*70:1,1);}
 if(kind==='carpet') {ctx.strokeStyle='rgba(213,194,146,0.14)';ctx.lineWidth=1;for(let i=0;i<256;i+=32){ctx.strokeRect(i,0,16,256);ctx.strokeRect(0,i,256,16);}}
 if(kind==='tile'){ctx.strokeStyle='rgba(0,0,0,0.24)';ctx.lineWidth=3;ctx.strokeRect(1,1,126,126);ctx.strokeRect(129,129,126,126);}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(kind==='wood'?2:6,kind==='wood'?2:6);tex.anisotropy=4;return tex;
}

export class World {
 constructor(environment) {this.environment=environment;this.scene=null;this.targets=[];this.colliders=[];this.animations=[];this.counter=null;this.room=null;}
 material(color,extras={}){return new THREE.MeshStandardMaterial({color,roughness:0.82,...extras});}
 box(x,y,z,w,h,d,material,parent=this.scene) {const mesh=new THREE.Mesh(UNIT_BOX,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 sphere(x,y,z,r,material,parent=this.scene){const mesh=new THREE.Mesh(UNIT_SPHERE,material);mesh.position.set(x,y,z);mesh.scale.setScalar(r);mesh.castShadow=true;parent.add(mesh);return mesh;}
 cylinder(x,y,z,top,bottom,height,material,parent=this.scene,segments=16){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,segments),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 beam(a,b,r1,r2,material,parent=this.scene){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,delta.length(),10),material);mesh.position.copy(from.add(to).multiplyScalar(0.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());mesh.castShadow=true;parent.add(mesh);return mesh;}
 block(x,z,w,d){this.colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}
 sign(text,x,y,z,w=3,h=0.7,angle=0,foreground='#e6dfbd',background='#18383a',parent=this.scene){
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*h/w);const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=foreground;ctx.globalAlpha=0.35;ctx.lineWidth=3;ctx.strokeRect(12,12,canvas.width-24,canvas.height-24);ctx.globalAlpha=1;ctx.fillStyle=foreground;ctx.textAlign='center';ctx.textBaseline='middle';
   const lines=text.split('\n');let size=Math.min(94,canvas.height/(lines.length+0.9));ctx.font=`500 ${size}px Manrope, Arial`;while(lines.some(line=>ctx.measureText(line).width>canvas.width-75)&&size>18){size-=2;ctx.font=`500 ${size}px Manrope, Arial`;}
   lines.forEach((line,i)=>ctx.fillText(line,canvas.width/2,canvas.height/2+(i-(lines.length-1)/2)*size*1.25));
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=angle;parent.add(mesh);return mesh;
 }
 target(mesh,action,label){mesh.userData.action=action;this.targets.push({mesh,action,label});return mesh;}
 portal(action,label,x,z,angle=0,color=0x94bdb3){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;this.scene.add(group);const dark=this.material(0x071e23,{emissive:0x143c40,emissiveIntensity:0.25});const edge=this.material(PALETTE.brass,{metalness:0.6,roughness:0.38});
   this.box(-1.3,1.7,0,0.16,3.4,0.38,edge,group);this.box(1.3,1.7,0,0.16,3.4,0.38,edge,group);this.box(0,3.38,0,2.76,0.16,0.38,edge,group);
   const panel=this.box(0,1.63,0,2.42,3.18,0.13,dark,group);this.target(panel,action,label);
   const glow=this.material(color,{emissive:color,emissiveIntensity:1.4});this.box(0,0.045,0.14,2.38,0.045,0.05,glow,group);this.box(0,3.23,0.13,2.38,0.035,0.03,glow,group);
   this.sign(label,0,2.62,0.16,2.15,0.46,0,'#eee5c4','#18383a',group);
   this.sign('E  ·  OPEN',0,1.3,0.16,1.35,0.28,0,'#a9cfc4','#0c262b',group);
   this.cylinder(0.96,1.3,0.18,0.09,0.09,0.11,edge,group).rotation.x=Math.PI/2;
   return group;
 }
 lamp(x,z,height=2.8){const metal=this.material(PALETTE.brass,{metalness:0.5,roughness:0.34}),shade=this.material(0xefe3bc,{emissive:0xffd8a0,emissiveIntensity:0.75});this.cylinder(x,0.06,z,0.29,0.34,0.12,metal);this.cylinder(x,height/2,z,0.024,0.025,height,metal);this.cylinder(x,height,z,0.22,0.48,0.45,shade);const light=new THREE.PointLight(0xffdbac,9,7,1.8);light.position.set(x,height-0.05,z);this.scene.add(light);}
 desk(x,z,angle=0,screenText='ALMOST'){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;this.scene.add(group);const wood=this.material(0xffffff,{map:surface('wood','#77503a')}),metal=this.material(0x354349,{metalness:0.4});
   this.box(0,0.88,0,2.5,0.14,1.35,wood,group);[-1,1].forEach(s=>{this.box(s*1.04,0.43,0,0.13,0.86,1,metal,group);this.box(s*0.84,0.45,0.2,0.34,0.7,0.8,wood,group);});
   this.box(0,1.32,-0.35,1,0.7,0.11,metal,group);this.box(0,1.02,-0.35,0.11,0.24,0.1,metal,group);this.box(0,0.98,-0.31,0.43,0.045,0.25,metal,group);const screen=this.sign(screenText,0,1.32,-0.283,0.83,0.52,0,'#afd29d','#0a2423',group);
   this.box(0,0.98,0.23,0.8,0.035,0.28,this.material(0xc2bfac),group);for(let row=0;row<3;row++)for(let col=0;col<10;col++)this.box(-0.33+col*0.07,1.002,0.14+row*0.06,0.047,0.009,0.035,metal,group);
   this.cylinder(0.9,1.09,0.3,0.10,0.09,0.25,this.material(0xb0c9be),group);this.box(-0.75,0.98,0.17,0.34,0.013,0.42,this.material(PALETTE.cream),group);
   const chair=new THREE.Group();chair.position.set(0,0,1.35);group.add(chair);this.cylinder(0,0.35,0,0.07,0.07,0.7,metal,chair);this.box(0,0.68,0,0.75,0.14,0.7,this.material(0x735d36),chair);this.box(0,1.07,0.28,0.75,0.65,0.15,this.material(0x735d36),chair);this.box(0,0.07,0,0.9,0.07,0.08,metal,chair);this.box(0,0.07,0,0.08,0.07,0.9,metal,chair);
   this.block(x,z,2.7,1.5);return {group,screen};
 }
 plant(x,z,scale=1){const pot=this.material(0x985e41);this.cylinder(x,0.25*scale,z,0.28*scale,0.20*scale,0.5*scale,pot);const leaves=this.material(0x326451);for(let i=0;i<8;i++){const angle=i*2.4;const leaf=this.sphere(x+Math.sin(angle)*0.20*scale,(0.65+i*0.06)*scale,z+Math.cos(angle)*0.2*scale,0.28*scale,leaves);leaf.scale.set(0.11*scale,0.38*scale,0.18*scale);leaf.rotation.z=Math.sin(angle)*0.45;}this.block(x,z,0.55*scale,0.55*scale);}

 indoor(width,depth,height=4.5,theme='office'){
  const floor=this.material(0xffffff,{map:surface(theme==='button'?'tile':'carpet',theme==='button'?'#7d9d91':'#727553')});const wall=this.material(theme==='button'?0x7b9d91:PALETTE.wall),trim=this.material(PALETTE.wood);
  this.box(0,-0.09,0,width,0.18,depth,floor);this.box(0,height+0.06,0,width,0.15,depth,this.material(0x999f8d));
  this.box(-width/2,height/2,0,0.22,height,depth,wall);this.box(width/2,height/2,0,0.22,height,depth,wall);this.box(0,height/2,-depth/2,width,height,0.22,wall);this.box(0,height/2,depth/2,width,height,0.22,wall);
  for(const y of [0.14,1.05]){this.box(-width/2+0.14,y,0,0.07,0.12,depth,trim);this.box(width/2-0.14,y,0,0.07,0.12,depth,trim);this.box(0,y,-depth/2+0.14,width,0.12,0.07,trim);this.box(0,y,depth/2-0.14,width,0.12,0.07,trim);}
  const lampMat=this.material(0xe9ebcf,{emissive:0xe9ebcf,emissiveIntensity:1});
  for(let z=-depth/2+3;z<depth/2;z+=5){this.box(0,height-0.07,z,2,0.08,0.45,lampMat);}
  this.bounds={minX:-width/2+0.16,maxX:width/2-0.16,minZ:-depth/2+0.16,maxZ:depth/2-0.16};
  this.scene.background=new THREE.Color(theme==='button'?0x34564e:0x283c3c);this.scene.fog=new THREE.Fog(this.scene.background,18,70);
 }
 clock(x,y,z,scale=1,action=null){const metal=this.material(PALETTE.brass,{metalness:0.4});const face=this.cylinder(x,y,z,scale,scale,0.09,metal);face.rotation.x=Math.PI/2;const disk=this.cylinder(x,y,z+0.052,scale*0.91,scale*0.91,0.01,this.material(0xdcd5b6));disk.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=this.box(x+Math.sin(a)*scale*0.77,y+Math.cos(a)*scale*0.77,z+0.07,0.034*scale,0.12*scale,0.015,this.material(PALETTE.ink));tick.rotation.z=-a;}
  const minute=this.box(x,y+scale*0.26,z+0.085,0.032,scale*0.55,0.018,this.material(PALETTE.ink));minute.geometry=UNIT_BOX;minute.rotation.z=-Math.PI*0.17;const hour=this.box(x-scale*0.19,y,z+0.09,scale*0.4,0.055,0.025,this.material(PALETTE.ink));this.sphere(x,y,z+0.095,0.07,metal);if(action)this.target(disk,action,'Ask the clock what it means');return {minute,hour};
 }

 stars(seed=52){const random=rng(seed),points=[];for(let i=0;i<2100;i++){const a=random()*Math.PI*2,v=random()*2-1,r=100+random()*120;const s=Math.sqrt(1-v*v);points.push(Math.cos(a)*s*r,v*r+10,Math.sin(a)*s*r);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const stars=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xc5ded9,size:0.17,sizeAttenuation:true,transparent:true,opacity:0.85,fog:false}));this.scene.add(stars);}
 voidFloor(width=24,depth=30,color=0x224145){this.scene.background=new THREE.Color(0x08171f);this.scene.fog=new THREE.FogExp2(0x08171f,0.006);this.stars();this.box(0,-0.14,0,width,0.28,depth,this.material(color,{roughness:0.55}));this.bounds={minX:-width/2+0.4,maxX:width/2-0.4,minZ:-depth/2+0.4,maxZ:depth/2-0.4};const brass=this.material(PALETTE.brass,{metalness:0.45});
  for(const x of [-width/2,width/2]) {this.box(x,0.92,0,0.07,0.07,depth,brass);for(let z=-depth/2;z<=depth/2;z+=2.5)this.box(x,0.46,z,0.055,0.92,0.055,brass);}
  for(let i=-width/2;i<width/2;i+=1)this.box(i,-0.003,0,0.014,0.01,depth,this.material(0x78988c));
 }
 orrery(x,y,z,scale=1){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);this.scene.add(group);const brass=this.material(0xcfaf64,{metalness:0.65,roughness:0.3}),glow=this.material(0x9ed2c5,{emissive:0x397e73,emissiveIntensity:1.7});
  const core=this.sphere(0,0,0,1.55,brass,group);const wire=new THREE.Mesh(new THREE.SphereGeometry(1.59,24,12),new THREE.MeshBasicMaterial({color:0x2c5d58,wireframe:true,transparent:true,opacity:0.34}));group.add(wire);
  for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6+i*0.85,0.035+i*0.003,8,112),i%2?brass:glow);ring.rotation.set(Math.PI/2+i*0.32,i*0.49,i*0.22);group.add(ring);this.animations.push(time=>{ring.rotation.z=i*0.22+time*(i%2?-1:1)*0.035;});const planet=this.sphere(2.6+i*0.85,0,0,0.14+i*0.055,i%2?glow:brass,ring);planet.position.z=0;}
  this.animations.push(time=>{core.rotation.y=time*0.045;group.position.y=y+Math.sin(time*0.18)*0.13;});return group;
 }

 build(room,run) {
  this.dispose();this.room=room;this.scene=new THREE.Scene();this.scene.environment=this.environment;this.scene.environmentIntensity=0.32;this.targets=[];this.colliders=[];this.animations=[];this.counter=null;
  const hemi=new THREE.HemisphereLight(0xe6f3e0,0x222e28,1.65);this.scene.add(hemi);const sun=new THREE.DirectionalLight(0xffe4b6,2.4);sun.position.set(-7,14,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.normalBias=0.035;this.scene.add(sun);
  this.spawn={x:0,z:4.5,yaw:0};
  this['build_'+room](run);
  this.scene.updateMatrixWorld(true);return this;
 }

 build_office(run){this.indoor(14,14);this.spawn={x:0,z:4.6,yaw:0.1};
  const desk=this.desk(-3,-2,0,'SADMAN\nYOUR STORY IS READY');this.target(desk.screen,'office_desk','Read your finished story');
  this.sign('DEPARTMENT OF ALMOST',0,3.8,-6.82,5.5,0.58);this.portal('to_hub','BEGIN AGAIN',2.8,-6.65);
  this.plant(5,-4.5,1.55);const pot=this.scene.children.at(-1);this.target(pot,'office_plant','Check whether the plant is real');
  const c=this.clock(-3,3,-6.79,0.65,'office_clock');this.animations.push(time=>{c.minute.rotation.z=-time*0.02;});
  const cabinet=this.material(0x687367,{metalness:0.15});for(let i=0;i<3;i++){this.box(-6,1.1,-2+i*1.3,1.3,2.2,1.1,cabinet);this.block(-6,-2+i*1.3,1.4,1.2);for(let y=0.4;y<2.2;y+=0.5)this.box(-5.31,y,-2+i*1.3,0.045,0.08,0.4,this.material(PALETTE.brass));}
  this.sign('TODAY\nYou have already been here.',-6.82,2.7,3,3.5,1.5,Math.PI/2);this.lamp(4.5,3.8);this.box(5.6,2.2,1.2,0.12,2.1,4.2,this.material(0x214e58,{emissive:0x32666d,emissiveIntensity:0.35}));for(let i=0;i<4;i++)this.box(5.5,2.2,-0.5+i*1.1,0.14,2.2,0.06,this.material(PALETTE.wood));
  this.sign(run.desk?'THE PAGE REMEMBERS':'The pen belongs to you.',-3,1.01,-1.75,0.65,0.18,0,'#243832','#d5ceb1');
  const page=this.sign('SADMAN — APPROVED\n(a single page)',-2.1,1.0,-1.85,0.62,0.4);page.rotation.x=-Math.PI/2.4;this.target(page,'office_page','Read the page that predates you');
 }

 build_hub(){this.indoor(20,24,5.5);this.spawn={x:0,z:8,yaw:0};
  this.sign('YOUR ARRIVAL HAS BEEN PRE-APPROVED',0,4.3,-11.8,9,0.8);this.portal('to_approval','ON TIME',-5,-11.65);this.portal('to_loop','TOO LATE',5,-11.65,0,0xd0a789);this.portal('to_office','MY ROOM',0,11.65,Math.PI);this.portal('to_button','CUSTOMER SATISFACTION',9.65,0,-Math.PI/2,0xd4c98b);this.portal('to_stairwell','THE STAIRS',-9.65,0,Math.PI/2,0xc9c39a);
  this.sign('Do not let the corridor decide\nhow long your life should be.',-9.82,2.5,5,5,1.6,Math.PI/2);
  const notice=this.sign('HAVE YOU SEEN THIS PERSON?\n\n[ photograph removed ]',-9.82,2.2,-5,3.4,1.9,Math.PI/2);this.target(notice,'hub_notice','Read the notice board');
  const dark=this.material(0x374c43),brass=this.material(PALETTE.brass);for(const x of [-7.7,7.7]){for(const z of [-6,5]){this.box(x,0.54,z,1.45,0.15,3.5,dark);this.box(x+(x<0?-0.55:0.55),1.04,z,0.16,0.95,3.5,dark);this.block(x,z,1.6,3.6);for(const dz of [-1.25,1.25])this.box(x,0.25,z+dz,1,0.5,0.07,brass);}this.plant(x,9,1.3);this.lamp(x,-9,3.4);}
  for(let z=-9;z<10;z+=3){this.box(0,0.009,z,0.055,0.013,1.5,brass);}
  this.clock(0,3.1,-11.77,0.57);
 }

 build_approval(run){this.indoor(16,28,5);this.spawn={x:0,z:10,yaw:0};this.portal('approve','APPROVED EXIT',0,-13.65,0,0xd8c68a);this.portal('shred','SHRED THE FORM',-7.65,-4,Math.PI/2,0x7dd2c1);this.portal('to_hub','WITHDRAW REQUEST',0,13.65,Math.PI);
  for(let i=0;i<4;i++){this.desk(-4.7,7-i*4,0,'PLEASE WAIT');this.desk(4.7,7-i*4,0,'PLEASE WAIT');}
  const metal=this.material(PALETTE.brass,{metalness:0.5});this.box(0,0.65,-8.5,3.6,1.3,1.5,this.material(PALETTE.wood));this.block(0,-8.5,3.7,1.6);this.cylinder(0,1.42,-8,0.3,0.35,0.22,metal);const stamp=this.cylinder(0,1.7,-8,0.16,0.18,0.42,this.material(PALETTE.red));this.target(stamp,'stamp','Stamp your request');
  this.counter=this.sign(this.counterText(run),0,3.1,-10.5,6.5,1.35);this.sign('THE EXIT IS YOUR RIGHT.\nAfter the required paperwork.',0,4.3,0,7,0.8);this.lamp(-6,-11);
 }

 build_button(run){this.indoor(14,18,5,'button');this.spawn={x:0,z:5.8,yaw:0};const metal=this.material(0xb8945d,{metalness:0.4});this.cylinder(0,0.55,-2,0.65,0.85,1.1,metal);this.block(0,-2,1.6,1.6);const button=this.cylinder(0,1.18,-2,0.47,0.5,0.22,this.material(PALETTE.red,{emissive:0x6e1f14,emissiveIntensity:0.4}));this.target(button,'button','Improve the experience');
  this.counter=this.sign(this.counterText(run),0,3.3,-8.78,8,1.2);this.sign('A SMALL FAVOR\nSurely you can manage a small favor.',0,2.5,8.8,5.7,1.1,Math.PI);
  this.portal('button_leave','I AM DONE',4.3,-8.65);this.portal('loophole','MAINTENANCE',-4.3,8.65,Math.PI,0x71b7a5);this.lamp(-5,-5);this.lamp(5,4);this.clock(-4,2.7,-8.78,0.7);
 }

 build_loop(run){const depth=40+run.loops*10;this.indoor(6,depth,4.6);this.spawn={x:0,z:depth/2-3,yaw:0};this.portal('loop',run.loops>=2?'FINALLY, THE END':'THE END',0,-depth/2+0.35,0,0xd79f87);this.portal('reject','DISAPPOINT ME',-2.66,-depth/2+8,Math.PI/2,0x94d5c7);this.portal('to_hub','RECONSIDER',0,depth/2-0.35,Math.PI);
  const brass=this.material(PALETTE.brass);for(let z=-depth/2+6;z<depth/2-2;z+=6){for(const x of [-2.78,2.78]){this.sign(run.loops?`YOU ARE ${3-run.loops} STEPS FROM FINISHING`:'THE END IS CLOSER THAN IT LOOKS',x,2.5,z,3.8,0.7,x<0?Math.PI/2:-Math.PI/2);this.box(x,0.9,z,0.06,0.08,4,brass);}}
 }

 build_archive(){this.voidFloor(26,32);this.spawn={x:0,z:11,yaw:0};this.portal('to_observatory','THE UNWRITTEN SKY',6,-15.5);this.portal('to_quiet','A ROOM WITHOUT A TASK',-6,-15.5,0,0xbacbb3);this.portal('to_gallery','THE MUSEUM OF YOU',12.55,6,-Math.PI/2);this.portal('to_records','RECORDS OF NEARLY',-12.55,6,Math.PI/2,0xbcd0c4);this.portal('to_hub','BACK TO ALMOST',0,15.5,Math.PI);
  this.sign('ARCHIVE OF LIVES NOT LIVED',0,8,-15.5,15,1.2);const wood=this.material(PALETTE.wood),brass=this.material(PALETTE.brass);
  const books=new THREE.InstancedMesh(UNIT_BOX,this.material(0xffffff),1536);const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),color=new THREE.Color();let n=0;const random=rng(875);
  for(const side of [-1,1])for(let z=-11;z<=9;z+=5){this.box(side*9.8,4,z,2.2,8,0.16,wood);this.block(side*9.8,z,2.2,2.7);for(let y=0.15;y<8;y+=1.05){this.box(side*9.8,y,z+0.62,2.8,0.12,1.45,wood);for(let i=0;i<16;i++){const x=side*9.8-1.2+i*0.15,height=0.45+random()*0.42;matrix.compose(new THREE.Vector3(x,y+height/2+0.065,z+0.57),q,new THREE.Vector3(0.09+random()*0.04,height,0.51));books.setMatrixAt(n,matrix);color.setHSL(0.1+random()*0.35,0.25+random()*0.25,0.22+random()*0.23);books.setColorAt(n++,color);}}}
  books.count=n;books.instanceMatrix.needsUpdate=true;books.instanceColor.needsUpdate=true;this.scene.add(books);
  for(const x of [-5.5,5.5]){for(let z=-9;z<12;z+=7){this.lamp(x,z,3.1);this.cylinder(x,6,z,0.09,0.1,12,brass);}}
  const display=this.box(0,1,-1.5,2.1,0.22,1.25,wood);this.box(0,0.5,-1.5,0.15,1,0.15,brass);this.block(0,-1.5,2.25,1.4);const openBook=this.sign('A LIFE SADMAN DID NOT LIVE\nRead to borrow a memory.',0,1.14,-1.35,1.65,0.65);openBook.rotation.x=-Math.PI/3;this.target(openBook,'book','Borrow an unlived memory');
  const note=this.sign('DO NOT RETURN WHAT YOU HAVE BECOME',3,1.2,8.3,2.4,0.7);this.target(note,'archive_note','Read the return policy');const clock=this.clock(0,11,-12,3);this.animations.push(time=>{clock.minute.rotation.z=time*0.06;});this.orrery(0,7,1,0.6);
 }

 build_gallery(){this.indoor(20,24,6);this.spawn={x:0,z:8,yaw:0};this.sign('THE MUSEUM OF YOU',0,4.8,-11.8,8,1);this.portal('to_archive','THINGS NOT YET DECIDED',6,-11.65);this.portal('to_hub','THE LOBBY',0,11.65,Math.PI);
  const gold=this.material(PALETTE.brass,{metalness:0.6,roughness:0.3}),stone=this.material(0x7f9187);for(const [i,x] of [-5,0,5].entries()){this.box(x,0.55,-2,2,1.1,2,stone);this.block(x,-2,2.1,2.1);this.cylinder(x,1.3,-2,0.14,0.34,0.38,gold);if(i!==1){const cup=this.cylinder(x,1.73,-2,0.37,0.12,0.55,gold);for(const side of [-1,1]){const h=new THREE.Mesh(new THREE.TorusGeometry(0.23,0.04,6,16),gold);h.position.set(x+side*0.35,1.73,-2);this.scene.add(h);}}else{const empty=this.box(x,1.63,-2,1.6,0.7,1.6,new THREE.MeshStandardMaterial({color:0xa9d6cd,transparent:true,opacity:0.13,roughness:0.1,depthWrite:false}));this.target(empty,'gallery_case','Inspect the space reserved for you');}this.sign(['BEST UNASKED QUESTION','AN UNDECIDED PERSON','MOST PROMISING DELAY'][i],x,0.9,-0.94,1.8,0.45);}
  this.box(-6,0.65,-8,1,1.3,1,stone);this.block(-6,-8,1.1,1.1);const button=this.cylinder(-6,1.36,-8,0.25,0.3,0.12,this.material(PALETTE.red));this.target(button,'petty','Press the button you have been told not to press');this.sign('PLEASE DO NOT MAKE THIS ABOUT THE BUTTON',-6,2.7,-8.2,4.5,0.8);this.lamp(-8,5);this.lamp(8,5);
  this.sign('YOU, BEFORE THE EXPLANATION',-9.8,2.7,2,5,1.7,Math.PI/2);this.sign('YOU, AFTER THE EXPLANATION',9.8,2.7,2,5,1.7,-Math.PI/2);
 }

 build_observatory(){this.voidFloor(22,42,0x254249);this.spawn={x:0,z:17,yaw:0};this.portal('to_garden','SOMETHING UNMEASURED',0,-20.3);this.portal('to_archive','THE ARCHIVE',0,20.3,Math.PI);this.portal('to_rooftop','ABOVE THE BUILDING',10.5,0,-Math.PI/2,0x9fb0c2);this.orrery(0,8,-5,1.6);
  const gold=this.material(PALETTE.brass,{metalness:0.65,roughness:0.35});for(const x of [-9,9])for(const z of [-17,-7,3,13]){this.cylinder(x,3,z,0.18,0.23,6,gold);this.sphere(x,6,z,0.30,this.material(0x9ad5c8,{emissive:0x7dbdae,emissiveIntensity:1.5}));}
  this.sign('NO ONE HAS WRITTEN TOMORROW',0,3,-19.7,12,0.9);const console=this.box(0,0.75,3,3.5,1.5,1.2,this.material(PALETTE.wood));this.block(0,3,3.6,1.3);const screen=this.sign('ESTIMATED SIZE OF YOUR LIFE\nCALCULATION INCOMPLETE',0,1.45,3.63,3,0.7);this.target(screen,'orrery','Ask the machine to measure you');
  const note=this.sign('A story cannot look back at you.\nAnd yet.',-6,1.45,10,3,0.8);this.target(note,'observatory_note','Read the astronomer’s note');
  const secret=this.sign('SADMAN\nAUTHOR',-9.8,1.1,-14,1.4,0.65,Math.PI/2,'#bfc9ad','#173238');this.target(secret,'author','Claim the name beneath the mechanism');
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),this.material(0x072332,{metalness:0.15,roughness:0.3}));sea.rotation.x=-Math.PI/2;sea.position.y=-9;this.scene.add(sea);
 }

 build_garden(){this.voidFloor(32,42,0x364e43);this.spawn={x:0,z:17,yaw:0};this.scene.background=new THREE.Color(0x294c59);this.scene.fog=new THREE.FogExp2(0x294c59,0.007);const sun=this.sphere(-40,26,-105,12,new THREE.MeshBasicMaterial({color:0xf3c797,fog:false}));
  const sea=this.box(0,-4,0,1200,0.08,1200,this.material(0x316d74,{metalness:0.22,roughness:0.4}));
  for(let i=0;i<12;i++){const torus=new THREE.Mesh(new THREE.TorusGeometry(23+i*12,0.035,6,160),new THREE.MeshBasicMaterial({color:0x80afa8,transparent:true,opacity:0.14}));torus.rotation.x=Math.PI/2;torus.position.y=-3.94;this.scene.add(torus);}
  this.portal('depart','LEAVE THE STORY',0,-20.3,0,0xf2dbac);this.portal('to_observatory','TAKE ANOTHER LOOK',0,20.3,Math.PI);
  const backdown=this.sign('A DOOR YOU HAVE NOT EARNED YET',-11,1.3,-14,3.2,0.8,Math.PI/2);this.target(backdown,'free_predecessor','Go back down for him');
  const bark=this.material(0xc6b99a),tree=new THREE.Group();tree.position.set(0,0,-3);this.scene.add(tree);this.block(0,-3,3,3);const random=rng(8275);
  const leafPositions=[];
  const branch=(from,length,angle,depth,radius)=>{const to=[from[0]+Math.sin(angle)*length,from[1]+Math.cos(angle)*length,from[2]+(random()-0.5)*length*0.55];this.beam(from,to,radius,radius*0.62,bark,tree);if(depth>0){branch(to,length*0.73,angle-0.49-random()*0.2,depth-1,radius*0.58);branch(to,length*0.74,angle+0.42+random()*0.2,depth-1,radius*0.58);if(depth===3)branch(to,length*0.62,angle+0.1,depth-1,radius*0.55);}else{for(let j=0;j<32;j++)leafPositions.push([to[0]+(random()-0.5)*4,to[1]+(random()-0.5)*2.2,to[2]+(random()-0.5)*3]);}};
  branch([0,0,0],6,0,4,0.95);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;this.beam([0,0.6,0],[Math.sin(a)*4,0.02,Math.cos(a)*4],0.7,0.09,bark,tree);}
  const leaves=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),this.material(0xffffff,{roughness:0.8}),leafPositions.length),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),color=new THREE.Color();leafPositions.forEach((p,i)=>{q.setFromEuler(new THREE.Euler(random()*3,random()*3,random()*3));matrix.compose(new THREE.Vector3(...p),q,new THREE.Vector3(0.5+random()*0.4,0.11,0.3+random()*0.4));leaves.setMatrixAt(i,matrix);color.setHSL(0.075+random()*0.11,0.35+random()*0.4,0.40+random()*0.25);leaves.setColorAt(i,color);});tree.add(leaves);this.animations.push(time=>{tree.rotation.z=Math.sin(time*0.22)*0.006;});
  const trunk=tree.children[0];this.target(trunk,'tree','Ask the tree why it is here');
  const bench=this.box(7,0.62,1,2.8,0.18,0.8,this.material(PALETTE.wood));this.box(7,1,1.35,2.8,0.75,0.1,this.material(PALETTE.wood));for(const x of [5.9,8.1])this.box(x,0.3,1,0.10,0.6,0.6,bark);this.block(7,1,3,0.95);this.target(bench,'garden_bench','Let this be enough');
  const dust=new THREE.BufferGeometry();const points=[];for(let i=0;i<210;i++)points.push((random()-0.5)*30,0.6+random()*15,(random()-0.5)*38);dust.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const lights=new THREE.Points(dust,new THREE.PointsMaterial({color:0xf0d497,size:0.065,transparent:true,opacity:0.72}));this.scene.add(lights);this.animations.push(time=>{lights.rotation.y=time*0.012;});
  this.sign('You do not have to turn this into a lesson.',0,1.1,-7,5.5,0.6,'0','#e6dcbb','#325346');
  for(let i=0;i<14;i++){const angle=i*2.4,r=52+i*3;this.cylinder(Math.sin(angle)*r,-5+random()*6,Math.cos(angle)*r,1.2,1.8,14+random()*10,this.material(0x71958a));}
 }

 build_quiet(){this.indoor(12,16,6);this.spawn={x:0,z:5.6,yaw:0};this.portal('to_archive','NOT YET',0,7.65,Math.PI);
  const seat=this.box(0,0.57,-3,2.3,0.18,0.9,this.material(PALETTE.wood));this.box(0,0.27,-3,1.7,0.55,0.15,this.material(PALETTE.brass));this.block(0,-3,2.45,1);this.target(seat,'sit','Sit without earning anything');
  this.box(0,2.7,-7.78,8,3.5,0.08,this.material(0x719a9a,{emissive:0x86b3ad,emissiveIntensity:0.6}));for(let x=-3;x<=3;x+=3)this.box(x,2.7,-7.65,0.065,3.6,0.04,this.material(PALETTE.brass));this.sign('NOTHING IS REQUIRED OF YOU HERE',0,4.95,-7.70,7.8,0.55);this.lamp(-4,-4,2.6);this.plant(4,-5,1.8);
 }

build_records(){this.indoor(18,26,5.2);this.spawn={x:0,z:9,yaw:0};
  this.sign('RECORDS OF NEARLY',0,4.35,-12.8,11,0.95);
  this.portal('to_archive','BACK TO THE ARCHIVE',-4.6,12.65,Math.PI,0x9fc7bb);this.portal('to_mirror','A ROOM OF YOU',4.6,12.65,Math.PI,0xbcd0c4);
  const cab=this.material(0x6d7a6e,{metalness:0.15});
  for(let i=0;i<6;i++){const x=-6.5+i*2.6;this.box(x,1.1,-8.6,1.2,2.2,1.5,cab);this.block(x,-8.6,1.3,1.6);for(let y=0.5;y<2.2;y+=0.45)this.box(x-0.62,y,-8.6,0.04,0.09,0.55,this.material(0xbfae72));}
  const d=this.desk(0,-2.2,0,'SADMAN\nPREVIOUS ENTRIES: 1');this.target(d.screen,'records_file','Read the file that has your name');
  const shelf=this.box(7,1,2,1.7,2.1,3.4,this.material(PALETTE.wood));this.target(shelf,'records_shelf','Search the shelf of the ones who nearly arrived');this.block(7,2,1.8,3.5);
  this.sign('THE SHELF OF THE ONES\nWHO NEARLY ARRIVED',6.6,2.5,2,3.2,0.9,-Math.PI/2);
  this.box(3.5,0.6,-4.6,0.9,1.2,0.9,this.material(0x6a7a6c));this.block(3.5,-4.6,1,1);const blank=this.sign('YOUR FILE\n(unfinished)',3.5,1.35,-4.6,0.85,0.5);this.target(blank,'records_confront','Ask whether you are a replacement');
  this.sign('EVERY FILE ENDS\nMID-SENTENCE',-8.82,2.4,4,4.2,1.2,Math.PI/2);
  this.lamp(-6,-2.5);this.lamp(6,-2.5);
 }

 build_mirror(){this.voidFloor(22,26,0x223f47);this.spawn={x:0,z:10,yaw:0};
  this.sign('A ROOM OF YOU',0,7,-11.5,10,0.95);
  this.portal('to_records','RECORDS',0,11.65,Math.PI,0xbcd0c4);this.portal('to_flood','THE FLOOR THAT REMEMBERS',9.9,0,-Math.PI/2,0x6f9fb0);
  this.box(0,1.9,-9.6,14,3.8,0.1,new THREE.MeshStandardMaterial({color:0x2b4a4f,metalness:0.85,roughness:0.12}));
  const labels=['THE ONE WHO COMPLIED','THE ONE WHO REFUSED','THE ONE WHO NEVER CAME'],acts=['mirror_story','mirror_none','mirror_self'],spots=[[-5,-3,0x9fc7bb],[0,-4,0xc7b98f],[5,-3,0xa89fb8]];
  labels.forEach((t,i)=>{const s=spots[i],x=s[0],z=s[1];const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.52,0.64,2,18),new THREE.MeshStandardMaterial({color:s[2],transparent:true,opacity:0.16,roughness:0.1,depthWrite:false}));glass.position.set(x,1.05,z);this.scene.add(glass);this.sphere(x,2.32,z,0.28,this.material(0x8fb3ab,{emissive:0x2f6b62,emissiveIntensity:0.6}));this.sign(t,x,0.62,z+0.72,1.9,0.42);this.target(glass,acts[i],'Become '+t.toLowerCase());this.block(x,z,1.1,1.1);});
  const look=this.sign('LOOK',-8.9,1.5,-6,1.4,0.5,Math.PI/2);this.target(look,'mirror_look','Look at the versions of you');
 }

 build_stairwell(){this.indoor(14,20,7);this.spawn={x:0,z:8,yaw:0};
  this.portal('to_hub','BACK TO ALMOST',0,9.65,Math.PI);this.portal('to_workshop','WHERE I AM MENDED',6.9,0,-Math.PI/2,0xc2a86a);
  for(let i=0;i<8;i++){const z=-5.8-i*0.55;this.box(0,0.24+i*0.42,z,4.4,0.42,0.55,this.material(0x8f8f76));this.block(0,z,4.5,0.62);}
  this.box(0,4.5,-9.4,4.4,0.4,1.8,this.material(0x7f8272));
  const up=this.sign('UP',0,1.6,-4.6,2,0.6);this.target(up,'stair_up','Climb toward a floor you did not choose');
  this.sign('DOWN LEADS OUT\nNO ONE HAS TAKEN IT',-6.82,2.6,-2,4.6,1.3,Math.PI/2);
  const down=this.sign('DOWN',-4.2,1.35,5.4,2,0.6);this.target(down,'stair_down','Walk down and out of the story');
  this.lamp(-5.4,4,3);this.lamp(5.4,3,3);
 }

 build_workshop(){this.voidFloor(24,28,0x2a3f3f);this.spawn={x:0,z:11,yaw:0};
  this.sign('WHERE THE BUILDING IS MENDED',0,7,-12.5,12,0.95);
  this.portal('to_stairwell','THE STAIRS',-4.6,12.65,Math.PI,0xc2a86a);this.portal('to_flood','THE WATER',10.9,0,-Math.PI/2,0x6f9fb0);
  const brass=this.material(PALETTE.brass,{metalness:0.6,roughness:0.35});
  for(let i=0;i<5;i++){const x=-8+i*4;this.box(x,2.9,-8.4,2.4,5.6,0.3,this.material(0x3c5450));this.block(x,-8.4,2.5,0.5);for(let y=0.9;y<5.5;y+=0.7)this.box(x,y,-8.2,0.06,0.5,0.06,brass);}
  const bench=this.desk(1.5,-1.4,0,'SYSTEM OK');this.target(bench.screen,'workshop_repair','Mend something, however small');
  const hand=this.sign('A HANDPRINT, MATCHING\nTHE ONE IN RECORDS',-3.4,1.5,-4.6,2.8,0.9);this.target(hand,'workshop_truth','Open the main panel');
  const stay=this.sign('STAY AND KEEP ME RUNNING',1.5,1.7,5.4,3.2,0.85);this.target(stay,'workshop_stay','Offer to stay');
  this.lamp(-6.5,3.5);this.lamp(6.5,-3.5);
 }

 build_flood(){this.indoor(18,24,5);this.spawn={x:0,z:9,yaw:0};
  this.sign('THE FLOOR THAT REMEMBERS',0,4.3,-11.8,11,0.9);
  this.portal('to_mirror','A ROOM OF YOU',4.6,11.65,Math.PI,0xbcd0c4);this.portal('to_workshop','WHERE I AM MENDED',-6.9,0,Math.PI/2,0xc2a86a);
  this.box(0,0.16,0,17.4,0.32,23.4,new THREE.MeshStandardMaterial({color:0x1d3a44,metalness:0.5,roughness:0.15,transparent:true,opacity:0.72}));
  const rel=this.box(-4,0.5,-3,1.2,0.3,0.9,this.material(PALETTE.wood));this.target(rel,'flood_reach','Reach into the water');
  const rec=this.sign('A RECORDING, STILL RUNNING',4,1.55,-4,2.6,0.8);this.target(rec,'flood_listen','Listen again');
  this.sign('NOTHING HERE IS DROWNED\nEVERYTHING HERE IS KEPT',-8.82,2.6,3,4.6,1.2,Math.PI/2);
  this.lamp(-5,-6.5);this.lamp(5,-6.5);
 }

 build_rooftop(){this.voidFloor(30,34,0x1c3138);this.spawn={x:0,z:8,yaw:0};this.scene.background=new THREE.Color(0x0b1a24);this.scene.fog=new THREE.FogExp2(0x0b1a24,0.0055);
  this.sign('ABOVE THE BUILDING',0,8,-15.5,13,1);
  this.portal('to_observatory','THE UNWRITTEN SKY',0,14.6,Math.PI,0x9fc7bb);
  const stone=this.material(0x5c6a68);
  for(const wall of [[0,-16.4,30,0.4],[-14.8,0,0.4,33],[14.8,0,0.4,33]])this.box(wall[0],0.6,wall[1],wall[2],1.2,wall[3],stone);
  this.box(0,0.5,3.5,3,1,3,this.material(0x3d4a4a));this.block(0,3.5,3.2,3.2);
  const look=this.sign('LOOK',-9.4,1.6,-3,1.6,0.5,Math.PI/2);this.target(look,'roof_look','Look at how small it is');
  const names=this.sign('TWO NAMES ARE CARVED HERE\nS A D M A N\nS A D M A -',8.4,1.7,-5,3.6,1.5,-Math.PI/2);this.target(names,'roof_name','Read the names carved into the roof');
  const accept=this.sign('TAKE THE NEXT SHIFT',0,1.7,-8,3.4,0.9);this.target(accept,'roof_accept','Agree to wait for whoever comes after');
  const home=this.sign('GO BACK DOWN FOR HIM',-9.4,1.6,-9,3,0.9,Math.PI/2);this.target(home,'free_predecessor','Go back for the first Sadman');
  for(let i=0;i<40;i++){const a=i*2.1,r=30+(i%7)*6;this.cylinder(Math.sin(a)*r,-4+((i*13)%9),Math.cos(a)*r,0.4,0.7,22+((i*7)%14),this.material(0x22333c));}
 }

 counterText(run){if(this.room==='approval')return run.stamps>=4?'APPROVAL COMPLETE\nThe exit is now available.':`REQUIRED STAMPS: ${run.stamps>=3?'4':run.stamps===0?'1':'3'}\nRECEIVED: ${run.stamps}`;if(this.room==='button')return `A VERY SMALL FAVOR\n${run.button} / ${run.button>=5?8:5}`;return '';}
 refresh(run){if(!this.counter)return;const old=this.counter;const p=old.position.clone();this.scene.remove(old);old.geometry.dispose();old.material.map.dispose();old.material.dispose();this.counter=this.sign(this.counterText(run),p.x,p.y,p.z,this.room==='approval'?6.5:8,this.room==='approval'?1.35:1.2);}
 update(time){this.animations.forEach(fn=>fn(time));}
 dispose(){if(!this.scene)return;const geometries=new Set(),materials=new Set(),textures=new Set();this.scene.traverse(obj=>{if(obj.geometry&&!([UNIT_BOX,UNIT_SPHERE].includes(obj.geometry)))geometries.add(obj.geometry);if(obj.isInstancedMesh)obj.dispose();if(obj.material){const list=Array.isArray(obj.material)?obj.material:[obj.material];list.forEach(mat=>{materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture&&value!==this.environment)textures.add(value);});}if(obj.isLight&&obj.shadow)obj.shadow.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());this.scene.clear();}
}
