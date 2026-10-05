import {ownedTab} from './cdp.mjs';
import fs from 'node:fs/promises';
const {tab,target}=await ownedTab('chrome://version');
try {
 await tab.wait("document.querySelector('#profile_path')?.textContent");const profile=await tab.eval("document.querySelector('#profile_path').textContent");if(!profile.replaceAll('\\','/').startsWith('D:/MCP/chrome-real-profile/'))throw new Error('Unauthorized profile '+profile);
 await tab.viewport();await tab.navigate('http://127.0.0.1:5238/?qa=1');await tab.wait("!!window.__GAME__ || (!document.getElementById('error').hidden && document.getElementById('error-text').textContent)");
 const state=await tab.eval("window.__GAME__?.snapshot() || {error:document.getElementById('error-text').textContent}");
 await tab.shot('qa/title-first.png');await fs.writeFile('qa/target.json',JSON.stringify({...target,profile},null,2));console.log(JSON.stringify({profile,state},null,2));
} finally {await tab.close();}
