import fs from 'node:fs/promises';
export const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export class Tab {
 constructor(ws){this.ws=ws;this.serial=0;this.pending=new Map();this.events=[];ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}}else{this.events.push(m);if(this.events.length>4000)this.events.shift();}});}
 static async connect(url){const ws=new WebSocket(url);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Target WebSocket connection timeout')),15000);ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});ws.addEventListener('error',e=>{clearTimeout(timer);reject(new Error('WebSocket refused: '+e.message));},{once:true});});return new Tab(ws);}
 send(method,params={}){const id=++this.serial;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(method+' timeout'));},30000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
 async eval(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;}
 async wait(expression,timeout=15000){const start=Date.now();let value;while(Date.now()-start<timeout){value=await this.eval(expression);if(value)return value;await delay(100);}throw new Error('Timeout waiting for '+expression);}
 async navigate(url){await this.send('Page.enable');await this.send('Page.navigate',{url});await this.wait("document.readyState==='complete'");}
 async viewport(width=1440,height=900){await this.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});}
 async shot(path){const r=await this.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path,Buffer.from(r.data,'base64'));}
 async key(code,down=true){const vk={KeyW:87,KeyA:65,KeyS:83,KeyD:68,KeyE:69,KeyH:72,KeyM:77,KeyV:86,Escape:27,ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39,ShiftLeft:16}[code];await this.send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});}
 async press(code){await this.key(code,true);await delay(40);await this.key(code,false);}
 async close(){this.ws.close();}
}
export async function ownedTab(url='about:blank'){
 const r=await fetch('http://127.0.0.1:9222/json/new?'+encodeURIComponent(url),{method:'PUT'});if(!r.ok)throw new Error('Owned target creation refused '+r.status);const target=await r.json();const tab=await Tab.connect(target.webSocketDebuggerUrl);await tab.send('Page.enable');await tab.send('Runtime.enable');return {tab,target};
}
export async function attachOwned(){const saved=JSON.parse(await fs.readFile('qa/target.json','utf8'));const list=await fetch('http://127.0.0.1:9222/json/list').then(r=>r.json());const target=list.find(t=>t.id===saved.id);if(!target)throw new Error('Owned QA tab no longer exists');if(!target.url.startsWith('http://127.0.0.1:5238/')&&!target.url.startsWith('file:///E:/SadmansParable/'))throw new Error('QA target is outside scope');return {tab:await Tab.connect(target.webSocketDebuggerUrl),target};}
