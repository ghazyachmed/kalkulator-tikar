// Dibantu AI: interaksi karpet menggunakan perhitungan lokal.
{
const carpetRoot=document.getElementById('santriCarpet');
const field=id=>carpetRoot.querySelector('#'+id);
const service=new CarpetQuoteService();let latestCarpetQuote;const carpetAssistant=new CarpetAssistant();
const fmt=value=>value.toLocaleString('id-ID',{maximumFractionDigits:2});
for(const product of carpetCatalog){const option=document.createElement('option');option.value=product.id;option.textContent=product.name+' · '+product.width+' cm · '+rupiah(product.rate)+'/m';field('carpetProduct').append(option);const row=document.createElement('tr');for(const text of [product.name,product.width+' cm',rupiah(product.rate)]){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}field('carpetPriceRows').append(row);}
field('carpetProduct').value='medina105';
const carpetPhotos={mecca:'2018/11/MECCA-DUA-STRIP-HIJAU-225x300.jpg',dinasty:'2018/11/Dinasty-merah-hij-toko-225x300.jpg',kingdom:'2018/11/KINGDOM-HIJAU-225x300.jpg',almira:'2018/11/KARPET-ALMIRA-MERAH-221x300.jpg',rajakhan:'2018/11/RAJAKHAN-Y-1-S-203x300.jpg',medinaPilar:'2018/11/MEDENA-PILAR-MERAH-225x300.jpeg'};
let lastCarpetChoice='';
function showCarpetChoices(){
 if(lastCarpetChoice===field('carpetProduct').value)return;lastCarpetChoice=field('carpetProduct').value;
 const chosen=carpetCatalog.find(p=>p.id===field('carpetProduct').value);field('carpetHeight').value=chosen.width;
 field('carpetChoices').replaceChildren();
 for(const product of carpetCatalog.filter(p=>p.width===chosen.width)){
 const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(product.id===chosen.id));
 if(carpetPhotos[product.id]){const img=document.createElement('img');img.src='https://tokosantri.co.id/wp-content/uploads/'+carpetPhotos[product.id];img.alt='Contoh motif '+product.name;img.width=180;img.height=130;img.loading='lazy';img.addEventListener('error',()=>{const missing=document.createElement('span');missing.className='photoMissing';missing.textContent='Foto belum tersedia';img.replaceWith(missing);},{once:true});b.append(img);}else{const missing=document.createElement('span');missing.className='photoMissing';missing.textContent='Foto belum tersedia';b.append(missing);}
 for(const text of [product.name,rupiah(product.rate)+'/m']){const span=document.createElement('span');span.textContent=text;b.append(span);}
 b.addEventListener('click',()=>{field('carpetProduct').value=product.id;calculateCarpet();});field('carpetChoices').append(b);
 }
 for(const option of field('carpetProduct').options){option.hidden=carpetCatalog.find(p=>p.id===option.value).width!==chosen.width;}
}
field('carpetHeight').addEventListener('change',()=>{field('carpetProduct').value=carpetCatalog.find(p=>p.width===Number(field('carpetHeight').value)).id;calculateCarpet();});
field('carpetCartAdd').addEventListener('click',()=>{calculateCarpet();if(latestCarpetQuote)document.dispatchEvent(new CustomEvent('santri:add',{detail:{kind:'carpet',order:latestCarpetQuote.order}}));});
document.addEventListener('santri:edit',event=>{if(event.detail.kind!=='carpet')return;const o=event.detail.order;for(const [key,id] of Object.entries({product:'carpetProduct',mode:'carpetMode',length:'carpetLength',quantity:'carpetQuantity',roomLength:'carpetRoomLength',roomWidth:'carpetRoomWidth',overlock:'carpetOverlock',seams:'carpetSeams',pillars:'carpetPillars',delivery:'carpetDelivery'}))field(id).value=o[key];calculateCarpet();document.querySelector('[data-calculator="carpet"]').click();field('carpetForm').scrollIntoView({behavior:'smooth',block:'start'});});

function calculateCarpet(){
 showCarpetChoices();
 const room=field('carpetMode').value==='room';field('carpetLengthFields').hidden=room;field('carpetRoomFields').hidden=!room;
 for(const id of ['carpetLength','carpetQuantity'])field(id).disabled=room;
 for(const id of ['carpetRoomLength','carpetRoomWidth'])field(id).disabled=!room;
 field('carpetDirection').textContent=room?'Karpet dihitung memanjang searah panjang ruangan, dengan jumlah baris yang cukup untuk menutup lebarnya. Sesuaikan arah pemasangan dengan shaf salat.':'Satu baris karpet berarti satu potongan yang dibentangkan memanjang. Contoh: 4 potongan sepanjang 8 m = isi panjang 8 dan jumlah baris 4.';
 try{
  const q=service.calculate({product:field('carpetProduct').value,mode:field('carpetMode').value,length:field('carpetLength').valueAsNumber,quantity:field('carpetQuantity').valueAsNumber,roomLength:field('carpetRoomLength').valueAsNumber,roomWidth:field('carpetRoomWidth').valueAsNumber,overlock:field('carpetOverlock').valueAsNumber,seams:field('carpetSeams').valueAsNumber,pillars:field('carpetPillars').valueAsNumber,delivery:field('carpetDelivery').value});
  latestCarpetQuote=q;field('carpetError').hidden=true;field('carpetAdvice').hidden=!q.advice.cutWidthCm;field('carpetAdvice').textContent=q.advice.cutWidthCm?'Baris terakhir: potong lebar '+q.product.width+' → '+fmt(q.advice.lastRowWidthCm)+' cm. Obras opsional.':'';field('carpetRate').textContent='Tinggi '+q.product.width+' cm · '+rupiah(q.product.rate)+' per meter panjang';field('carpetVariant').textContent=q.product.name+' · Tinggi '+q.product.width+' cm';
  const rows=[['Kebutuhan',q.strips+' baris × '+fmt(q.length)+' m'],['Total panjang',fmt(q.meters)+' meter'],['Subtotal karpet',rupiah(q.subtotal)],['Obras ('+q.order.overlock+' lokasi)',rupiah(q.overlockCost)],['Sambung ('+q.order.seams+' sambungan)',rupiah(q.seamCost)],['Lubang / tiang ('+q.order.pillars+' × Rp50.000)',rupiah(q.pillarCost)],['Pengiriman',q.shippingCost===null?'Hubungi WhatsApp':q.order.delivery==='pickup'?'Ambil di toko':rupiah(q.shippingCost)+' · radius <10 km']];
  field('carpetDetails').replaceChildren();for(const [label,value] of rows){const row=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);field('carpetDetails').append(row);}
  field('carpetTotalLabel').textContent=q.total===null?'Estimasi belum termasuk ongkir':'Estimasi total';field('carpetTotal').textContent=rupiah(q.knownTotal);field('carpetWords').textContent=toWords(q.knownTotal);field('carpetPending').textContent=q.total===null?'Ongkir belum termasuk. Hubungi toko untuk tarif tujuan Anda.':'';
  const message=['Assalamu’alaikum, saya ingin pesan karpet sajadah.','',q.product.name+' · Tinggi '+q.product.width+' cm','Harga: '+rupiah(q.product.rate)+'/meter panjang',...rows.map(([label,value])=>label+': '+value),'',(q.total===null?'Estimasi belum termasuk ongkir: ':'Estimasi total: ')+rupiah(q.knownTotal),'Mohon cek stok, ukuran, titik pengerjaan, dan biaya pengiriman.'].join('\n');
  field('carpetWhatsapp').href='https://wa.me/6285105016189?text='+encodeURIComponent(message);field('carpetWhatsapp').removeAttribute('aria-disabled');
 }catch(error){latestCarpetQuote=null;field('carpetAdvice').hidden=true;field('carpetError').hidden=false;field('carpetError').textContent=error.message;field('carpetTotal').textContent='Periksa isian';field('carpetWords').textContent='Perbaiki isian untuk melihat estimasi terbaru.';field('carpetDetails').replaceChildren();field('carpetWhatsapp').removeAttribute('href');field('carpetWhatsapp').setAttribute('aria-disabled','true');}
}
field('carpetForm').addEventListener('submit',event=>event.preventDefault());field('carpetForm').addEventListener('input',event=>{if(event.target.id!=='carpetHeight')calculateCarpet();});field('carpetForm').addEventListener('change',calculateCarpet);
field('carpetShowResult').addEventListener('click',()=>{const target=field('carpetError').hidden?field('carpetResult'):field('carpetError');target.scrollIntoView({behavior:'smooth',block:'start'});target.focus({preventScroll:true});});
for(const button of document.querySelectorAll('[data-calculator]'))button.addEventListener('click',()=>{const carpet=button.dataset.calculator==='carpet';document.getElementById('santriChooseHint').hidden=true;document.getElementById('santriCalculator').hidden=carpet;carpetRoot.hidden=!carpet;for(const choice of document.querySelectorAll('[data-calculator]'))choice.setAttribute('aria-pressed',String(choice===button));});
calculateCarpet();
if(new URLSearchParams(location.search).has('order'))document.querySelector('[data-calculator="tikar"]').click();
function askCarpet(message){
 const log=field('carpetChatLog');const add=(text,user=false)=>{const node=document.createElement('div');node.className='carpetBubble'+(user?' user':'');node.textContent=text;log.append(node);while(log.children.length>24)log.firstElementChild.remove();return node;};
 add(message,true);field('carpetChatInput').value='';
 if(!latestCarpetQuote){add('Ada isian kalkulator yang perlu diperbaiki. Periksa bagian yang ditandai, lalu kirim pertanyaan Anda lagi.');return;}
 const result=carpetAssistant.reply(message,latestCarpetQuote.order);
 const reply=add(result.answer);
 if(result.order){const o=result.order;for(const [key,id] of Object.entries({product:'carpetProduct',mode:'carpetMode',length:'carpetLength',quantity:'carpetQuantity',roomLength:'carpetRoomLength',roomWidth:'carpetRoomWidth',overlock:'carpetOverlock',seams:'carpetSeams',pillars:'carpetPillars',delivery:'carpetDelivery'}))field(id).value=o[key];calculateCarpet();const link=document.createElement('a');link.className='carpetButton';link.textContent='Lanjut pesan di WhatsApp ↗';link.href=field('carpetWhatsapp').href;link.target='_blank';link.rel='noopener noreferrer';reply.append(link);}
 log.scrollTop=log.scrollHeight;
}
field('carpetOpenChat').addEventListener('click',()=>{field('carpetDialogHome').append(field('carpetChatPanel'));field('carpetChatDialog').showModal();field('carpetChatInput').focus();});
field('carpetCloseChat').addEventListener('click',()=>field('carpetChatDialog').close());
field('carpetChatDialog').addEventListener('close',()=>{field('carpetChatHome').append(field('carpetChatPanel'));field('carpetOpenChat').focus();});
field('carpetReset').addEventListener('click',()=>{field('carpetForm').reset();field('carpetProduct').value='medina105';calculateCarpet();});
field('carpetChatForm').addEventListener('submit',event=>{event.preventDefault();const message=field('carpetChatInput').value.trim();if(message)askCarpet(message);});
for(const button of carpetRoot.querySelectorAll('[data-carpet-question]'))button.addEventListener('click',()=>askCarpet(button.dataset.carpetQuestion));
field('carpetChatInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();field('carpetChatForm').requestSubmit();}});

}
