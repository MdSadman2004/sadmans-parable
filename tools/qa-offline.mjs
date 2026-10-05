import {attachOwned,delay} from './cdp.mjs';
import fs from 'node:fs/promises';
const {tab}=await attachOwned();let original=null;
try {
 await tab.send('Network.enable');await tab.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await tab.navigate("file:///E:/SadmansParable/Sadman's%20Parable.html");await tab.wait('!!window.__GAME__');
 original=await tab.eval("({save:localStorage.getItem('sadmans-parable:v1'),settings:localStorage.getItem('sadmans-parable:settings')})");
 await tab.viewport();await tab.shot('qa/title.png');const before=await tab.eval('window.__GAME__.snapshot()');
 await tab.eval("document.getElementById('begin').click();window.__GAME__.audio.voice=false;true");await delay(250);const start=await tab.eval('window.__GAME__.snapshot()');await delay(700);const idle=await tab.eval('window.__GAME__.snapshot()');
 await tab.key('KeyW');await delay(600);await tab.key('KeyW',false);const walked=await tab.eval('window.__GAME__.snapshot()');
 await tab.eval('window.__GAME__.pause();true');await tab.eval("document.getElementById('pause-settings').click();true");
 await tab.eval("document.getElementById('motion').checked=true;document.getElementById('motion').dispatchEvent(new Event('change',{bubbles:true}));true");
 const persisted=await tab.eval("JSON.parse(localStorage.getItem('sadmans-parable:settings'))?.motion===true");
 const commands=await tab.eval("Array.from(document.querySelectorAll('#settings dt')).map(x=>x.textContent)");await tab.shot('qa/settings.png');
 await tab.eval("document.getElementById('settings-close').click();true");await tab.eval("document.getElementById('main-menu').click();true");
 const external=tab.events.filter(e=>e.method==='Network.requestWillBeSent').map(e=>e.params.request.url).filter(u=>/^https?:/.test(u));
 const report={offline:before.state==='menu'&&start.state==='playing',external_requests:external.length,external_request_urls:external,manual_default:Math.abs(start.position[0]-idle.position[0])<0.0001&&Math.abs(start.position[2]-idle.position[2])<0.0001,qa_disabled:before.qaMode===false&&(await tab.eval('!window.__GAME__.qa')),normal_offline_W:walked.position[2]<idle.position[2]-0.4,settings_persisted:persisted,controls_present:commands,installed_local_English_voices:await tab.eval("window.__GAME__.audio.voices.filter(v=>v.localService&&v.lang.startsWith('en')).map(v=>v.name)"),errors:await tab.eval('window.__GAME__.metrics.errors'),start,idle,walked,scope:'Built standalone file, network emulation offline, normal start/W input, actual settings save/readback. QA progress restored after the test.'};
 await fs.writeFile('qa/offline-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{
 if(original)await tab.eval(`(()=>{const original=${JSON.stringify(original)};for(const [key,value] of [['sadmans-parable:v1',original.save],['sadmans-parable:settings',original.settings]]){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}return true;})()`);
 await tab.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await tab.send('Page.reload',{ignoreCache:true});await tab.wait('!!window.__GAME__');await delay(150);await tab.shot('qa/title.png');await tab.close();
}
