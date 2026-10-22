export const securityHeaders={
  'x-content-type-options':'nosniff',
  'referrer-policy':'strict-origin-when-cross-origin',
  'permissions-policy':'camera=(), microphone=(), geolocation=()',
  'strict-transport-security':'max-age=31536000; includeSubDomains',
  'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com"
};
export class TokenBucket {
  constructor(capacity=8,perMinute=8,maxKeys=1024){this.capacity=capacity;this.perMinute=perMinute;this.maxKeys=maxKeys;this.buckets=new Map();}
  allow(key,now=Date.now()){
    const previous=this.buckets.get(key)||{tokens:this.capacity,at:now};
    const tokens=Math.min(this.capacity,previous.tokens+(now-previous.at)*this.perMinute/60000);
    this.buckets.delete(key);if(this.buckets.size>=this.maxKeys)this.buckets.delete(this.buckets.keys().next().value);
    this.buckets.set(key,{tokens:tokens>=1?tokens-1:tokens,at:now});return tokens>=1;
  }
}
export async function readBody(request,maxBytes=4096){
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('Gunakan JSON.');
  if(Number(request.headers.get('content-length'))>maxBytes)throw new Error('Input terlalu besar.');
  const reader=request.body?.getReader();if(!reader)throw new Error('Input kosong.');
  const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error('Input terlalu besar.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const parsed=JSON.parse(new TextDecoder().decode(bytes));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Input tidak valid.');return parsed;
}
