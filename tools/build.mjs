import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
await fs.mkdir(path.join(root,'dist'),{recursive:true});
const result=await build({entryPoints:[path.join(root,'src/main.js')],bundle:true,minify:true,format:'iife',target:['chrome100','firefox100','safari15'],write:false,legalComments:'inline'});
const fonts=await fs.readdir(path.join(root,'public/fonts'));
let css=await fs.readFile(path.join(root,'src/style.css'),'utf8');
for(const f of fonts.filter(f=>f.endsWith('.ttf'))) {
 const data=await fs.readFile(path.join(root,'public/fonts',f));
 const family=f.startsWith('caslon')?'Libre Caslon Display':'Manrope';
 const weight=f.includes('600')?'600':'400';
 css=`@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/ttf;base64,${data.toString('base64')}) format('truetype');}`+css;
}
const template=await fs.readFile(path.join(root,'index.html'),'utf8');
const html=template.replace('<!-- STYLES -->',`<style>${css}</style>`).replace('<!-- GAME -->',`<script>${result.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);
await fs.writeFile(path.join(root,'dist/index.html'),html);
await fs.writeFile(path.join(root,"Sadman's Parable.html"),html);
const rules=await fs.readFile(path.join(root,'src/rules.js'),'utf8');
const story=JSON.parse(await fs.readFile(path.join(root,'src/story.json'),'utf8'));
const frozen=name=>{const m=rules.match(new RegExp(name+'\\s*=\\s*Object\\.freeze\\(\\[([^\\]]*)\\]'));return m?m[1].split(',').length:0;};
await fs.writeFile(path.join(root,'dist/build.json'),JSON.stringify({name:"Sadman's Parable",version:'1.0.0',bytes:Buffer.byteLength(html),builtAt:new Date().toISOString(),rooms:frozen('ROOM_IDS'),endings:frozen('ENDING_IDS'),lines:Object.keys(story.lines).length},null,2));
console.log(`Built offline game: ${Buffer.byteLength(html)} bytes. dist/index.html and Sadman's Parable.html`);
