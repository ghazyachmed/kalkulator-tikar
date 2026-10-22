import { assets } from './assets.js';
import { QuoteService, catalog } from '../domain/pricing.js';
import { AssistantService } from '../services/assistant.js';
import { securityHeaders, TokenBucket, readBody } from '../services/security.js';
import { EventService } from '../services/events.js';
const localLimit=new TokenBucket();
const engine=new QuoteService();
const bot=new AssistantService(engine);
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{...securityHeaders,'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
export default {
  async fetch(request,env={},ctx={}){
    const start=Date.now();const url=new URL(request.url);const id=crypto.randomUUID();
    try{
      if(url.pathname.startsWith('/api/')){
        if(request.method==='GET'&&url.pathname==='/api/health')return json({status:'ok',version:catalog.version,assistant:env.geminiApiKey&&env.chatLimit?'geminiReady':'rules',database:false,objectStorage:Boolean(env.BUCKET),queue:Boolean(env.EVENTS)});
        if(request.method!=='POST')return json({error:'Metode tidak didukung.'},405,{'allow':'POST'});
        if(request.headers.get('origin')!==url.origin)return json({error:'Origin tidak diizinkan.'},403);
        let data;try{data=await readBody(request);}catch{return json({error:'Input tidak valid atau terlalu besar.'},400);}
        if(url.pathname==='/api/chat'&&(typeof data.message!=='string'||data.message.length<1||data.message.length>800))return json({error:'Pesan harus 1–800 karakter.'},400);
        const key=request.headers.get('cf-connecting-ip')||'anonymous';
        if(!localLimit.allow(key))return json({error:'Terlalu banyak permintaan. Coba sebentar lagi.'},429,{'retry-after':'15'});
        if(url.pathname==='/api/chat'){
          let context;try{context=engine.calculate(data.context||{}).order;}catch{return json({error:'Ukuran tidak valid.'},400);}
          // Batas Provider: Gemini hanya aktif dengan limiter terdistribusi.
          let providerEnv={};if(env.geminiApiKey&&env.chatLimit){const allowed=await env.chatLimit.limit({key});if(allowed.success)providerEnv={geminiApiKey:env.geminiApiKey,geminiModel:env.geminiModel};}
          const reply=await bot.reply(data.message,context,providerEnv);return json(reply);
        }
        if(url.pathname==='/api/quotes'){
          if(!env.BUCKET)return json({error:'Penyimpanan online tidak aktif. Gunakan tautan berbagi atau unduh rincian.'},503);
          let quote;try{quote=engine.calculate(data.order||{});}catch{return json({error:'Ukuran tidak valid.'},400);}
          const event={type:'quoteCreated',id,createdAt:new Date().toISOString(),quote};
          if(env.EVENTS){await env.EVENTS.send(event);return json({id,status:'queued'},202);}
          await new EventService(env.BUCKET).store(event);return json({id,status:'stored'},201);
        }
        return json({error:'Tidak ditemukan.'},404);
      }
      if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'Metode tidak didukung.'},405);
      if(url.pathname==='/robots.txt')return new Response('User-agent: *\nAllow: /\nDisallow: /api/\n',{headers:{...securityHeaders,'content-type':'text/plain','cache-control':'public,max-age=3600'}});
      const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
      if(!asset)return new Response('Halaman tidak ditemukan.',{status:404,headers:securityHeaders});
      const headers={...securityHeaders,'content-type':asset.type,'cache-control':'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400','etag':asset.etag};
      if(request.headers.get('if-none-match')===asset.etag)return new Response(null,{status:304,headers});
      return new Response(request.method==='HEAD'?null:asset.base64?Uint8Array.from(atob(asset.body),character=>character.charCodeAt(0)):asset.body,{headers});
    }catch{return json({error:'Layanan sedang sibuk. Kalkulator tetap bisa digunakan.',requestId:id},503);}
    finally{if(url.pathname.startsWith('/api/'))console.log(JSON.stringify({event:'request',requestId:id,path:url.pathname,durationMs:Date.now()-start}));}
  },
  async queue(batch,env){await new EventService(env.BUCKET).consume(batch);}
};
