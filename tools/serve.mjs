import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const port=5238;
const server=http.createServer((req,res)=>{
 let pathname;
 try { pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname); } catch {res.writeHead(400);res.end('Bad path');return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep) && file!==path.join(root,'index.html')) {res.writeHead(403);res.end('Forbidden');return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'application/json','Cache-Control':'no-store'});res.end(data);});
});
server.on('error',error=>{console.error('Cannot bind the dedicated SadmansParable port 5238:',error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log("Sadman's Parable — http://127.0.0.1:5238 (loopback only)"));
