import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const context=browser.contexts()[0];const page=await context.newPage();
try {
 await page.goto('chrome://version');const profile=await page.locator('#profile_path').textContent();if(!profile.replaceAll('\\','/').startsWith('D:/MCP/chrome-real-profile/'))throw new Error('Unauthorized profile: '+profile);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:5238/?qa=1');await page.waitForFunction(()=>window.__GAME__||!document.getElementById('error').hidden);
 const state=await page.evaluate(()=>window.__GAME__?.snapshot()||{error:document.getElementById('error-text').textContent});
 await page.screenshot({path:'qa/title-first.png'});
 await fs.writeFile('qa/browser-target.json',JSON.stringify({url:page.url(),profile},null,2));
 console.log(JSON.stringify({profile,state,errors},null,2));
} finally {await page.close();await browser.close();}
