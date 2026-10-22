import {test} from 'node:test';import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const request=(path,body,extra={})=>new Request('https://example.com'+path,{method:'POST',headers:{origin:'https://example.com','content-type':'application/json',...extra},body:JSON.stringify(body)});
test('Tolak origin asing',async()=>assert.equal((await worker.fetch(request('/api/chat',{message:'harga'},{origin:'https://evil.test'}),{},{})).status,403));
test('Batasi input chat',async()=>assert.equal((await worker.fetch(request('/api/chat',{message:'x'.repeat(801)}),{},{})).status,400));
test('POST tanpa origin ditolak',async()=>{const r=new Request('https://example.com/api/chat',{method:'POST',body:'{}'});assert.equal((await worker.fetch(r,{},{})).status,403);});
test('Storage tidak tersedia: simpan tidak mengklaim sukses',async()=>assert.equal((await worker.fetch(request('/api/quotes',{}),{},{})).status,503));
test('Header keamanan dan 404',async()=>{const r=await worker.fetch(new Request('https://example.com/unknown'),{},{});assert.equal(r.status,404);assert.equal(r.headers.get('x-content-type-options'),'nosniff');});
