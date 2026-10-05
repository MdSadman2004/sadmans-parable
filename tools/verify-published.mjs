import { ownedTab, delay } from './cdp.mjs';
import fs from 'node:fs/promises';
const results = [];
const urls = [
  ['fresh public clone (file://)', "file:///D:/Temp/sp2/Sadman's%20Parable.html"],
  ['GitHub Pages', 'https://mdsadman2004.github.io/sadmans-parable/'],
];
for (const [label, url] of urls) {
  const { tab } = await ownedTab('about:blank');
  try {
    await tab.send('Runtime.enable');
    await tab.send('Network.enable');
    await tab.viewport(1440, 900);
    await tab.navigate(url);
    await tab.wait('!!window.__GAME__ || (!document.getElementById("error").hidden)', 25000);
    await delay(900);
    const r = await tab.eval(`(window.__GAME__ ? (()=>{const g=window.__GAME__;g.qa&&0;return {booted:true,title:document.title,state:g.state,room:g.run.room,draws:g.renderer.info.render.calls,triangles:g.renderer.info.render.triangles,errors:g.metrics.errors.length,caption:document.getElementById('caption').textContent.slice(0,50),begin:document.getElementById('begin').textContent,qaExposed:!!g.qa,hasScreens:!!document.querySelector('h1')};})() : {booted:false,error:document.getElementById('error-text').textContent})`);
    const external = tab.events.filter(e => e.method === 'Network.requestWillBeSent').map(e => e.params.request.url).filter(u => /^https?:/.test(u) && !u.startsWith('https://mdsadman2004.github.io/'));
    results.push({ label, url, ...r, externalRequests: external.length });
  } catch (e) {
    results.push({ label, url, booted: false, failure: String(e.message || e) });
  } finally { await tab.close(); }
}
await fs.writeFile('qa/published-verify.json', JSON.stringify(results, null, 2));
for (const r of results) console.log(JSON.stringify(r));
const ok = results.every(r => r.booted === true && r.errors === 0 && r.draws > 0 && r.qaExposed === false);
if (!ok) process.exitCode = 1;
