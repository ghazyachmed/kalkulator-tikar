import { ShippingService } from '/shipping.js';
import { QuoteService, defaultOrder, catalog, rupiah } from '/domain.js';
import { AssistantService } from '/assistant.js';
const select=id=>document.getElementById(id);
const quoteService=new QuoteService();
const localAssistant=new AssistantService(quoteService);
const colorNames={hijau:'Hijau',krem:'Krem',biru:'Biru',marun:'Merah marun'};
let chatContext=null;let chatConversation={};
let order={...defaultOrder};let currentQuote;let currentShipment;let valid=true;let chatBusy=false;let toastTimer;
function toast(message){select('toast').textContent=message;select('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{select('toast').hidden=true;},4000);}
function readOrder(){return {...order,length:select('length').valueAsNumber,quantity:select('quantity').valueAsNumber,roomWidth:select('roomWidth').valueAsNumber,roomLength:select('roomLength').valueAsNumber,writing:select('writing').checked,trim:select('trim').checked,packing:select('packing').value,cargoService:select('cargoService').value,shippingCost:select('shippingCost').value===''?null:select('shippingCost').valueAsNumber};}
function setPressed(attribute,value){document.querySelectorAll('['+attribute+']').forEach(button=>button.setAttribute('aria-pressed',String(button.getAttribute(attribute)===String(value))));}
function syncFields(){
  for(const key of ['length','quantity','roomWidth','roomLength','packing','cargoService'])select(key).value=order[key];
  for(const key of ['writing','trim'])select(key).checked=order[key];
  select('shippingCost').value=order.shippingCost??'';
  for(const key of ['product','mode','width','color','shipping'])setPressed('data-'+key,order[key]);
}
function receipt(){const q=currentQuote;return ['TOKO SANTRI — ESTIMASI',catalog.products.find(p=>p.id===order.product).name+' · '+colorNames[order.color],`Lebar: ${order.width} cm`,`${q.strips} rol/lajur × ${q.meters/q.strips} m = ${q.meters} m`,`Tulisan: ${order.writing?'Ya':'Tidak'}`,`Plisir dua ujung: ${rupiah(q.trimCost)}`,`Packing: ${rupiah(q.packingCost)}${q.bagCount?' · '+q.bagCount+' karung':''}`,`Sumber harga: ${q.rateSource.label}`,q.rateSource.kind==='benchmark'||q.rateSource.kind==='assumption'?q.rateSource.note:'',`Subtotal produk: ${rupiah(q.subtotal)}`,`Pengiriman: ${order.shipping==='pickup'?'Ambil di toko':order.shipping==='cargo'?'Indah Cargo':'Kurir'}`,`Tujuan: ${select('destination').value.trim()||'Belum diisi'}`,order.shipping!=='pickup'&&currentShipment?`PERKIRAAN paket: ${currentShipment.packageCount} koli; berat dengan packing ~${currentShipment.actualWeight.toFixed(2)} kg; volume ~${currentShipment.volumeWeight.toFixed(2)} kg; acuan bulat ${currentShipment.billableReference} kg. Benchmark Swan + asumsi packing, bukan hasil timbang.`:'',`Ongkir: ${q.shippingSource==='manual'?rupiah(q.shippingCost)+' (input pelanggan, belum diverifikasi)':q.shippingSource==='pickup'?'Tanpa ongkir':'Perlu konfirmasi'}`,q.total===null?'BIAYA DIKETAHUI: '+rupiah(q.knownTotal):`ESTIMASI TOTAL: ${rupiah(q.total)}`,q.words?'Terbilang '+(q.total===null?'biaya diketahui':'total')+': '+q.words:'',q.pending.length?'Belum termasuk: '+q.pending.join(', '):'',`Versi harga: ${q.version}`,'Tarif Toko Santri per meter panjang. Ongkir mengikuti daerah; berat paket masih estimasi.'].filter(Boolean).join('\n');}
function renderPackage(){
  const panel=select('packageSummary');panel.replaceChildren();
  if(!currentShipment){panel.textContent='Model berat hanya tersedia untuk tikar rol. Berat karpet perlu dikonfirmasi toko.';select('packageDimensions').textContent='';return;}
  const p=currentShipment;const f=n=>n.toLocaleString('id-ID',{maximumFractionDigits:2});
  for(const [label,value] of [['Jumlah paket',p.packageCount.toLocaleString('id-ID')+' koli'],['Perkiraan berat + packing',f(p.actualWeight)+' kg'],['Perkiraan berat volume',f(p.volumeWeight)+' kg'],['Acuan pembulatan/paket',p.billableReference.toLocaleString('id-ID')+' kg total']]){const row=document.createElement('div');const name=document.createElement('span');const result=document.createElement('strong');name.textContent=label;result.textContent=value;row.append(name,result);panel.append(row);}
  select('packageDimensions').textContent=p.groups.map(g=>g.count.toLocaleString('id-ID')+' paket × ~'+g.length+' × '+g.width+' × '+g.height+' cm (tikar '+g.matLength+' m/paket)').join('; ')+'. Hanya perkiraan; bukan hasil timbang atau tarif ekspedisi.';
}
function update(){
  chatContext=null;chatConversation={};
  try{
    order=readOrder();currentQuote=quoteService.calculate(order);valid=true;select('formError').hidden=true;const q=currentQuote;currentShipment=new ShippingService().estimateOrder(q,order.cargoService);renderPackage();
    select('rollFields').hidden=order.mode!=='roll';select('roomFields').hidden=order.mode!=='room';select('length').disabled=select('quantity').disabled=order.mode!=='roll';select('roomWidth').disabled=select('roomLength').disabled=order.mode!=='room';
    select('productNotice').hidden=order.product==='tikar';select('rateNotice').hidden=q.rateSource.kind!=='benchmark'&&q.rateSource.kind!=='assumption';select('rateNotice').textContent='' ;select('writingNote').textContent='Dengan tulisan: '+rupiah(q.rate)+'/m.';select('summaryRateSource').textContent='Sumber: '+q.rateSource.label+(q.rateSource.kind==='owner'?' · per meter panjang':'');select('writingNote').hidden=!order.writing;select('colorName').textContent=colorNames[order.color];select('summaryName').textContent=catalog.products.find(p=>p.id===order.product).name;
    select('summaryVariant').textContent=`Lebar ${order.width} cm · ${colorNames[order.color]}${order.writing?' · Dengan nama':''}`;
    select('metersText').textContent=`${q.meters.toLocaleString('id-ID')} m · ${q.strips} ${order.mode==='room'?'lajur':'rol'}`;
    select('rateText').textContent=rupiah(q.rate);select('subtotalText').textContent=rupiah(q.subtotal);
    select('extraText').textContent=order.trim||order.packing==='extra'?'Plisir '+rupiah(q.trimCost)+' · Packing '+rupiah(q.packingCost)+(q.bagCount?' ('+q.bagCount+' karung)':''):'Tanpa tambahan';
    select('deliveryText').textContent=order.shipping==='pickup'?'Ambil di toko':q.shippingSource==='manual'?rupiah(q.shippingCost)+'*':order.shipping==='cargo'?'Indah Cargo · isi ongkir':'Indah Cargo · isi ongkir';
    select('totalLabel').textContent=q.total===null?'Biaya yang sudah diketahui':q.shippingSource==='manual'?'Estimasi + ongkir input Anda':'Estimasi total belanja';
    select('totalText').textContent=rupiah(q.total??q.knownTotal);select('totalText').style.fontSize=q.subtotal===null?'23px':'';
    select('wordsText').textContent=q.words?(q.total===null?'Biaya diketahui: ':'')+q.words.charAt(0).toUpperCase()+q.words.slice(1)+'.':'Harga belum tersedia untuk varian ini.';
    select('pendingText').hidden=q.pending.length===0;select('pendingText').textContent='Belum termasuk: '+q.pending.join(', ')+'.';
    select('shippingFields').hidden=order.shipping==='pickup';select('cargoTools').hidden=order.shipping!=='cargo';select('shippingHint').textContent=order.shipping==='pickup'?'Gratis ongkir: ambil sendiri di toko.':q.shippingSource==='manual'?'Ongkir yang Anda masukkan sudah dijumlahkan.':'Cek tarif Indah untuk menambahkan ongkir.';
    select('layoutText').textContent=`${q.strips} ${order.mode==='room'?'lajur':'rol'} × ${q.meters/q.strips} meter · ${q.area.toLocaleString('id-ID')} m²${order.trim?' · Plisir '+q.strips+' rol (dua ujung)':''}`;
    select('planStrips').replaceChildren();for(let i=0;i<Math.min(q.strips,8);i++){const strip=document.createElement('div');strip.className='planStrip';strip.textContent=(q.meters/q.strips)+' m × '+order.width+' cm';select('planStrips').append(strip);}if(q.strips>8){const more=document.createElement('span');more.className='hint';more.textContent='+ '+(q.strips-8)+' rol/lajur lainnya';select('planStrips').append(more);}
    select('whatsapp').href='https://wa.me/6285105016189?text='+encodeURIComponent('Assalamu’alaikum, saya ingin konfirmasi pesanan berikut.\n\n'+receipt());select('whatsapp').removeAttribute('aria-disabled');
    for(const id of ['share','download','printQuote'])select(id).disabled=false;
  }catch(error){valid=false;select('formError').textContent=error.message;select('formError').hidden=false;select('totalText').textContent='Periksa input';select('wordsText').textContent='Perbaiki ukuran untuk melihat estimasi terbaru.';select('whatsapp').removeAttribute('href');select('whatsapp').setAttribute('aria-disabled','true');for(const id of ['share','download','printQuote'])select(id).disabled=true;}
}
select('showResult').addEventListener('click',()=>{if(!valid){select('formError').scrollIntoView({block:'center'});return;}select('quoteResult').scrollIntoView({behavior:'smooth',block:'start'});select('quoteResult').focus({preventScroll:true});});
select('quoteForm').addEventListener('submit',event=>event.preventDefault());
select('quoteForm').addEventListener('input',event=>{if(['length','quantity','roomWidth','roomLength','destination','cargoService'].includes(event.target.id))select('shippingCost').value='';update();});
for(const key of ['product','mode','width','color','shipping'])document.querySelectorAll('[data-'+key+']').forEach(button=>button.addEventListener('click',()=>{order[key]=key==='width'?Number(button.dataset[key]):button.dataset[key];if(['shipping','width','mode','product'].includes(key)){order.shippingCost=null;select('shippingCost').value='';}setPressed('data-'+key,order[key]);update();}));
select('minus').addEventListener('click',()=>{select('shippingCost').value='';select('quantity').value=Math.max(1,(select('quantity').valueAsNumber||1)-1);update();});select('plus').addEventListener('click',()=>{select('shippingCost').value='';select('quantity').value=Math.min(10000,(select('quantity').valueAsNumber||1)+1);update();});
select('reset').addEventListener('click',()=>{order={...defaultOrder};select('destination').value='';syncFields();update();history.replaceState(null,'',location.pathname);toast('Pilihan kembali ke awal.');});
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{order={...order,product:'tikar',width:button.dataset.preset==='benchmark'?95:120,writing:button.dataset.preset==='writing'};syncFields();update();select('calculator').scrollIntoView({behavior:'smooth'});});
select('share').addEventListener('click',async()=>{if(!valid)return;const link=new URL(location.href);link.search='';link.hash='';link.searchParams.set('order',JSON.stringify(order));try{if(navigator.share)await navigator.share({title:'Estimasi tikar — Toko Santri',url:link.href});else{await navigator.clipboard.writeText(link.href);toast('Tautan hitungan disalin. Tujuan pribadi tidak ikut dibagikan.');}}catch(error){if(error.name!=='AbortError'){select('actionStatus').textContent='Salin tautan berikut:';const input=document.createElement('input');input.type='text';input.readOnly=true;input.value=link.href;select('actionStatus').append(input);input.select();}}});
select('download').addEventListener('click',()=>{if(!valid)return;const url=URL.createObjectURL(new Blob([receipt()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='estimasi-toko-santri.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Rincian estimasi diunduh.');});
select('printQuote').addEventListener('click',()=>{if(valid)window.print();});
function bubble(text,isUser=false){const item=document.createElement('div');item.className='bubble'+(isUser?' user':'');item.textContent=text;const log=select('chatMessages');log.append(item);while(log.children.length>30)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;return item;}
async function ask(message){
  if(chatBusy)return;if(!valid){toast('Perbaiki input kalkulator terlebih dahulu.');return;}
  chatBusy=true;select('sendChat').disabled=true;select('sendChat').textContent='Memproses…';select('chatForm').setAttribute('aria-busy','true');
  document.querySelectorAll('[data-question]').forEach(button=>button.disabled=true);
  select('chatInput').value='';bubble(message,true);const pending=bubble('Sedang menyiapkan jawaban…');pending.classList.add('loadingBubble');
  select('chatStatus').textContent='Sedang menyiapkan jawaban…';
  const slowTimer=setTimeout(()=>{select('chatStatus').textContent='Masih menghubungkan asisten. Kalkulator tetap bisa digunakan.';},1800);
  try{
    const result=await localAssistant.respond(message,chatContext||order,async()=>{
      const response=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,context:chatContext||order}),signal:AbortSignal.timeout(5500)});
      if(!response.ok)throw Error('assistantUnavailable');return response.json();
    },chatConversation);
    pending.textContent=result.answer;
    if(result.conversation)chatConversation=result.conversation;
    if(result.order)chatContext=result.order;
    if(result.choices?.length){const choices=document.createElement('div');choices.className='replyChoices';for(const item of result.choices){const button=document.createElement('button');button.type='button';button.textContent=item.label;button.addEventListener('click',()=>ask(item.message));choices.append(button);}pending.append(choices);}
    select('chatMode').textContent=result.mode==='gemini'?'Dibantu Gemini · Hitungan dari kalkulator':'Asisten berbasis aturan · Hitungan dari kalkulator';
    select('chatStatus').textContent=result.fallback?'Koneksi lambat atau tidak tersedia. Bantuan dasar tetap aktif.':'Jawaban siap.';
    if(result.order){const apply=document.createElement('button');apply.type='button';apply.className='applyQuote';apply.textContent='Terapkan ke kalkulator ↗';apply.addEventListener('click',()=>{order=quoteService.calculate(result.order).order;syncFields();update();if(chatDialog.open){chatOpener=select('quoteResult');chatDialog.close();}select('quoteResult').scrollIntoView({behavior:'smooth',block:'start'});select('quoteResult').focus({preventScroll:true});toast('Hitungan diperbarui.');});pending.append(document.createElement('br'),apply);}
  }catch{pending.textContent='Asisten sedang tidak tersedia. Anda tetap bisa menghitung di kalkulator atau menghubungi toko.';select('chatStatus').textContent='Silakan coba lagi.';}finally{clearTimeout(slowTimer);pending.classList.remove('loadingBubble');chatBusy=false;select('sendChat').disabled=false;select('sendChat').textContent='Kirim ➤';select('chatForm').setAttribute('aria-busy','false');document.querySelectorAll('[data-question]').forEach(button=>button.disabled=false);select('chatMessages').scrollTop=select('chatMessages').scrollHeight;}
}
select('chatForm').addEventListener('submit',event=>{event.preventDefault();const message=select('chatInput').value.trim();if(message)ask(message);});document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));
try{const raw=new URLSearchParams(location.search).get('order');if(raw){if(raw.length>1800)throw new Error('tooLong');const parsed=JSON.parse(raw);const safe={};for(const key of Object.keys(defaultOrder))if(Object.hasOwn(parsed,key))safe[key]=parsed[key];order=quoteService.calculate({...defaultOrder,...safe}).order;toast('Hitungan dari tautan dimuat. Harga dihitung ulang dengan tarif terbaru.');}}catch{order={...defaultOrder};toast('Tautan tidak valid. Pilihan awal dipakai.');}
syncFields();update();


function showPhoto(color){select('productPhoto').src='/images/tikar-'+color+'.jpg';select('productPhoto').alt='Contoh tikar rol custom '+color+' bertulisan dari katalog Toko Santri';setPressed('data-photo',color);}
for(const button of document.querySelectorAll('[data-photo]'))button.addEventListener('click',()=>showPhoto(button.dataset.photo));
const chatDialog=select('chatDialog');const chatPanel=select('assistant');let chatOpener;
for(const button of document.querySelectorAll('[data-open-chat]'))button.addEventListener('click',()=>{chatOpener=button;select('dialogChatHome').append(chatPanel);chatDialog.showModal();select('chatInput').focus();});
select('closeChat').addEventListener('click',()=>chatDialog.close());chatDialog.addEventListener('close',()=>{select('chatHome').append(chatPanel);chatOpener?.focus();});
select('chatInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();select('chatForm').requestSubmit();}});
