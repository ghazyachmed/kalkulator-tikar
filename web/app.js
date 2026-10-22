import { ShippingService } from '/shipping.js';
import { QuoteService, defaultOrder, catalog, rupiah } from '/domain.js';
import { AssistantService } from '/assistant.js';
const select=id=>document.getElementById(id);
const quoteService=new QuoteService();
const localAssistant=new AssistantService(quoteService);
const colorNames={hijau:'Hijau',krem:'Krem',biru:'Biru',marun:'Merah marun'};
let order={...defaultOrder};let currentQuote;let valid=true;let chatBusy=false;let toastTimer;
function toast(message){select('toast').textContent=message;select('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{select('toast').hidden=true;},4000);}
function readOrder(){return {...order,length:select('length').valueAsNumber,quantity:select('quantity').valueAsNumber,roomWidth:select('roomWidth').valueAsNumber,roomLength:select('roomLength').valueAsNumber,writing:select('writing').checked,trim:select('trim').checked,packing:select('packing').value,shippingCost:select('shippingCost').value===''?null:select('shippingCost').valueAsNumber};}
function setPressed(attribute,value){document.querySelectorAll('['+attribute+']').forEach(button=>button.setAttribute('aria-pressed',String(button.getAttribute(attribute)===String(value))));}
function syncFields(){
  for(const key of ['length','quantity','roomWidth','roomLength','packing'])select(key).value=order[key];
  for(const key of ['writing','trim'])select(key).checked=order[key];
  select('shippingCost').value=order.shippingCost??'';
  for(const key of ['product','mode','width','color','shipping'])setPressed('data-'+key,order[key]);
}
function receipt(){const q=currentQuote;return ['TOKO SANTRI — ESTIMASI',catalog.products.find(p=>p.id===order.product).name+' · '+colorNames[order.color],`Lebar: ${order.width} cm`,`${q.strips} rol/lajur × ${q.meters/q.strips} m = ${q.meters} m`,`Tulisan: ${order.writing?'Ya':'Tidak'}`,`Plisir: ${order.trim?'Ya, tarif perlu konfirmasi':'Tidak'}`,`Packing: ${order.packing==='extra'?'Tambahan, tarif perlu konfirmasi':'Tanpa tambahan'}`,`Subtotal produk: ${rupiah(q.subtotal)}`,`Pengiriman: ${order.shipping==='pickup'?'Ambil di toko':order.shipping==='cargo'?'Indah Cargo':'Kurir'}`,`Tujuan: ${select('destination').value.trim()||'Belum diisi'}`,`Ongkir: ${q.shippingSource==='manual'?rupiah(q.shippingCost)+' (input pelanggan, belum diverifikasi)':q.shippingSource==='pickup'?'Tanpa ongkir':'Perlu konfirmasi'}`,q.total===null?'TOTAL AKHIR: Belum dapat ditentukan':`ESTIMASI TOTAL: ${rupiah(q.total)}`,q.words?'Terbilang '+(q.total===null?'subtotal':'total')+': '+q.words:'',q.pending.length?'Belum termasuk: '+q.pending.join(', '):'',`Versi harga: ${q.version}`,'Tarif pemilik, asumsi per meter panjang; konfirmasi satuan, stok, minimum pesanan, dan seluruh biaya sebelum membayar.'].filter(Boolean).join('\n');}
function update(){
  try{
    order=readOrder();currentQuote=quoteService.calculate(order);valid=true;select('formError').hidden=true;const q=currentQuote;
    select('rollFields').hidden=order.mode!=='roll';select('roomFields').hidden=order.mode!=='room';select('length').disabled=select('quantity').disabled=order.mode!=='roll';select('roomWidth').disabled=select('roomLength').disabled=order.mode!=='room';
    select('productNotice').hidden=order.product==='tikar';select('writingNote').hidden=!order.writing;select('colorName').textContent=colorNames[order.color];select('summaryName').textContent=catalog.products.find(p=>p.id===order.product).name;
    select('summaryVariant').textContent=`Lebar ${order.width} cm · ${colorNames[order.color]}${order.writing?' · Dengan nama':''}`;
    select('metersText').textContent=`${q.meters.toLocaleString('id-ID')} m · ${q.strips} ${order.mode==='room'?'lajur':'rol'}`;
    select('rateText').textContent=rupiah(q.rate);select('subtotalText').textContent=rupiah(q.subtotal);
    select('extraText').textContent=order.trim||order.packing==='extra'?'Perlu konfirmasi':'Tanpa tambahan';
    select('deliveryText').textContent=order.shipping==='pickup'?'Ambil di toko':q.shippingSource==='manual'?rupiah(q.shippingCost)+'*':order.shipping==='cargo'?'Indah Cargo · konfirmasi':'Kurir · konfirmasi';
    select('totalLabel').textContent=q.total===null?'Subtotal yang diketahui':q.shippingSource==='manual'?'Estimasi + ongkir input Anda':'Estimasi total produk';
    select('totalText').textContent=rupiah(q.total??q.subtotal);select('totalText').style.fontSize=q.subtotal===null?'23px':'';
    select('wordsText').textContent=q.words?(q.total===null?'Subtotal: ':'')+q.words.charAt(0).toUpperCase()+q.words.slice(1)+'.':'Harga belum tersedia untuk varian ini.';
    select('pendingText').hidden=q.pending.length===0;select('pendingText').textContent='Total akhir belum tersedia. Perlu konfirmasi: '+q.pending.join(', ')+'.';
    select('shippingFields').hidden=order.shipping==='pickup';select('cargoTools').hidden=order.shipping!=='cargo';select('shippingHint').textContent=order.shipping==='pickup'?'Tanpa ongkir. Jadwal pengambilan dikonfirmasi bersama toko.':q.shippingSource==='manual'?'*Ongkir diisi pelanggan, belum diverifikasi toko.':'Biaya pengiriman belum termasuk. Jangan menganggap ongkir gratis.';
    select('layoutText').textContent=`${q.strips} ${order.mode==='room'?'lajur':'rol'} × ${q.meters/q.strips} meter · ${q.area.toLocaleString('id-ID')} m²${order.trim?' · Plisir '+q.trimMeters.toLocaleString('id-ID')+' m':''}`;
    select('planStrips').replaceChildren();for(let i=0;i<Math.min(q.strips,8);i++){const strip=document.createElement('div');strip.className='planStrip';strip.textContent=(q.meters/q.strips)+' m × '+order.width+' cm';select('planStrips').append(strip);}if(q.strips>8){const more=document.createElement('span');more.className='hint';more.textContent='+ '+(q.strips-8)+' rol/lajur lainnya';select('planStrips').append(more);}
    select('whatsapp').href='https://wa.me/6285105016189?text='+encodeURIComponent('Assalamu’alaikum, saya ingin konfirmasi pesanan berikut.\n\n'+receipt());select('whatsapp').removeAttribute('aria-disabled');
    for(const id of ['share','download','printQuote'])select(id).disabled=false;
  }catch(error){valid=false;select('formError').textContent=error.message;select('formError').hidden=false;select('totalText').textContent='Periksa input';select('wordsText').textContent='Perbaiki ukuran untuk melihat estimasi terbaru.';select('whatsapp').removeAttribute('href');select('whatsapp').setAttribute('aria-disabled','true');for(const id of ['share','download','printQuote'])select(id).disabled=true;}
}
select('quoteForm').addEventListener('submit',event=>event.preventDefault());
select('quoteForm').addEventListener('input',update);select('destination').addEventListener('input',update);
for(const key of ['product','mode','width','color','shipping'])document.querySelectorAll('[data-'+key+']').forEach(button=>button.addEventListener('click',()=>{order[key]=key==='width'?Number(button.dataset[key]):button.dataset[key];if(key==='shipping'){order.shippingCost=null;select('shippingCost').value='';}setPressed('data-'+key,order[key]);update();}));
select('minus').addEventListener('click',()=>{select('quantity').value=Math.max(1,(select('quantity').valueAsNumber||1)-1);update();});select('plus').addEventListener('click',()=>{select('quantity').value=Math.min(10000,(select('quantity').valueAsNumber||1)+1);update();});
select('reset').addEventListener('click',()=>{order={...defaultOrder};select('destination').value='';syncFields();update();history.replaceState(null,'',location.pathname);toast('Pilihan kembali ke awal.');});
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{order={...order,product:'tikar',width:120,writing:button.dataset.preset==='writing'};syncFields();update();select('calculator').scrollIntoView({behavior:'smooth'});});
select('share').addEventListener('click',async()=>{if(!valid)return;const link=new URL(location.href);link.search='';link.hash='';link.searchParams.set('order',JSON.stringify(order));try{if(navigator.share)await navigator.share({title:'Estimasi tikar — Toko Santri',url:link.href});else{await navigator.clipboard.writeText(link.href);toast('Tautan hitungan disalin. Tujuan pribadi tidak ikut dibagikan.');}}catch(error){if(error.name!=='AbortError'){select('actionStatus').textContent='Salin tautan berikut:';const input=document.createElement('input');input.type='text';input.readOnly=true;input.value=link.href;select('actionStatus').append(input);input.select();}}});
select('download').addEventListener('click',()=>{if(!valid)return;const url=URL.createObjectURL(new Blob([receipt()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='estimasi-toko-santri.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Rincian estimasi diunduh.');});
select('printQuote').addEventListener('click',()=>{if(valid)window.print();});
function bubble(text,isUser=false){const item=document.createElement('div');item.className='bubble'+(isUser?' user':'');item.textContent=text;const log=select('chatMessages');log.append(item);while(log.children.length>30)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;return item;}
async function ask(message){
  if(chatBusy)return;if(!valid){toast('Perbaiki input kalkulator terlebih dahulu.');return;}chatBusy=true;select('sendChat').disabled=true;select('chatInput').value='';bubble(message,true);const pending=bubble('Sebentar, saya periksa…');
  try{let result;try{const response=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,context:order}),signal:AbortSignal.timeout(6500)});if(!response.ok)throw new Error('assistantUnavailable');result=await response.json();}catch{result=await localAssistant.reply(message,order,{});}
    pending.textContent=result.answer;select('chatMode').textContent=(result.mode==='gemini'?'Gemini · Pemahaman pertanyaan':'Mode aturan')+' · Hitungan dari daftar harga toko';
    if(result.order){const apply=document.createElement('button');apply.type='button';apply.className='applyQuote';apply.textContent='Terapkan ke kalkulator ↗';apply.addEventListener('click',()=>{order=quoteService.calculate(result.order).order;syncFields();update();toast('Ukuran diterapkan ke kalkulator.');});pending.append(document.createElement('br'),apply);}
  }catch{pending.textContent='Asisten sedang tidak tersedia. Anda tetap bisa menghitung di kalkulator atau menghubungi toko.';}finally{chatBusy=false;select('sendChat').disabled=false;select('chatMessages').scrollTop=select('chatMessages').scrollHeight;}
}
select('chatForm').addEventListener('submit',event=>{event.preventDefault();const message=select('chatInput').value.trim();if(message)ask(message);});document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));
try{const raw=new URLSearchParams(location.search).get('order');if(raw){if(raw.length>1800)throw new Error('tooLong');const parsed=JSON.parse(raw);const safe={};for(const key of Object.keys(defaultOrder))if(Object.hasOwn(parsed,key))safe[key]=parsed[key];order=quoteService.calculate({...defaultOrder,...safe}).order;toast('Hitungan dari tautan dimuat. Harga dihitung ulang dengan tarif terbaru.');}}catch{order={...defaultOrder};toast('Tautan tidak valid. Pilihan awal dipakai.');}
syncFields();update();

select('volumeButton').addEventListener('click',()=>{try{const q=new ShippingService().calculate({length:select('packageLength').valueAsNumber,width:select('packageWidth').valueAsNumber,height:select('packageHeight').valueAsNumber,weight:select('packageWeight').valueAsNumber,packages:select('packageCount').valueAsNumber,service:select('cargoService').value});select('volumeResult').textContent='Berat aktual total: '+q.actualWeight.toLocaleString('id-ID')+' kg. Berat volume total: '+q.volumeWeight.toLocaleString('id-ID',{maximumFractionDigits:2})+' kg. Acuan lebih besar: '+q.referenceWeight.toLocaleString('id-ID',{maximumFractionDigits:2})+' kg. Minimum, pembulatan, dan biaya tambahan ditentukan Indah.';}catch(error){select('volumeResult').textContent=error.message;}});
