import { securityHeaders } from '../services/security.js';
import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);const read=path=>readFile(new URL(path,root),'utf8');
const assetMap={};const files={'/index.html':['web/index.html','text/html; charset=utf-8'],'/style.css':['web/style.css','text/css; charset=utf-8'],'/app.js':['web/app.js','text/javascript; charset=utf-8'],'/domain.js':['domain/pricing.js','text/javascript; charset=utf-8'],'/shipping.js':['domain/shipping.js','text/javascript; charset=utf-8'],'/assistant.js':['services/assistant.js','text/javascript; charset=utf-8']};
const buildId=createHash('sha256').update((await Promise.all(Object.values(files).map(([file])=>read(file)))).join('')).digest('hex').slice(0,12);
await rm(new URL('dist',root),{recursive:true,force:true});await mkdir(new URL('dist/server',root),{recursive:true});await mkdir(new URL('dist/.openai',root),{recursive:true});await mkdir(new URL('public',root),{recursive:true});
for(const [path,[file,type]] of Object.entries(files)){let body=await read(file);if(path==='/assistant.js')body=body.replace('../domain/pricing.js','/domain.js').replace('../domain/shipping.js','/shipping.js');body=body.replace(/\/(app|style|domain|shipping|assistant)\.(js|css)(?![a-z?])/g,match=>match+'?v='+buildId);assetMap[path]={body,type,etag:'"'+createHash('sha256').update(body).digest('hex').slice(0,16)+'"'};await writeFile(new URL('public'+path,root),body);}
const icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#164f42"/><text x="8" y="34" fill="#f8f3df" font-family="Georgia" font-style="italic" font-size="32">ts</text></svg>';
assetMap['/icon.svg']={body:icon,type:'image/svg+xml',etag:'"icon1"'};await writeFile(new URL('public/icon.svg',root),icon);
await mkdir(new URL('public/images',root),{recursive:true});
for(const name of ['tikar-hijau.jpg','tikar-marun.jpg']){const bytes=await readFile(new URL('web/images/'+name,root));assetMap['/images/'+name]={body:bytes.toString('base64'),base64:true,type:'image/jpeg',etag:'"'+createHash('sha256').update(bytes).digest('hex').slice(0,16)+'"'};await writeFile(new URL('public/images/'+name,root),bytes);}
let server='const assets = '+JSON.stringify(assetMap)+';\n';
for(const path of ['domain/pricing.js','domain/shipping.js','services/security.js','services/events.js','services/assistant.js','worker/index.js'])server+=(await read(path)).replace(/^import .*?;\s*$/gm,'').replace(/\bexport (?=(?:class|function|const|async function)\b)/g,'')+'\n';
await writeFile(new URL('dist/server/index.js',root),server);await copyFile(new URL('.openai/hosting.json',root),new URL('dist/.openai/hosting.json',root));
console.log('Built Worker and static public assets.');

await writeFile(new URL('public/_headers',root),'/*\n'+Object.entries(securityHeaders).map(([key,value])=>'  '+key+': '+value).join('\n')+'\n');
