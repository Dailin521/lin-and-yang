import {createServer} from 'node:http';import {readFileSync,statSync} from 'node:fs';import {resolve,extname,sep} from 'node:path';
import {root,normalizeBase} from './site-lib.mjs';
const directory=resolve(root,'dist'),base=normalizeBase(JSON.parse(readFileSync(resolve(directory,'site-manifest.json'),'utf8')).base),port=Number(process.env.PORT||4180);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
createServer((req,res)=>{
 let path;try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(path==='/'&&base!=='/'){res.writeHead(302,{Location:base}).end();return;}
 if(path===base.slice(0,-1)){res.writeHead(302,{Location:base}).end();return;}
 if(!path.startsWith(base)){res.writeHead(404).end('Not found');return;}
 let target=resolve(directory,path.slice(base.length));
 if(target!==directory&&!target.startsWith(directory+sep)){res.writeHead(403).end();return;}
 try{
  if(statSync(target).isDirectory()){
   if(!path.endsWith('/')){res.writeHead(302,{Location:path+'/'}).end();return;}
   target=resolve(target,'index.html');
  }
  const body=readFileSync(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}${base}`));
