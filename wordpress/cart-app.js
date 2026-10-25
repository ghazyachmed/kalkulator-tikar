// Dibantu AI: keranjang lokal tanpa mengirim data ke server.
{
 let browserStorage;try{browserStorage=window.localStorage;}catch{}
 const persistence=new CartStorage(browserStorage);const restored=persistence.load();const cart=restored.cart;let editId=null;const el=id=>document.getElementById(id);const fmt=n=>n.toLocaleString('id-ID',{maximumFractionDigits:2});
 function persist(){el('cartStorageNote').textContent=persistence.save(cart)?'Keranjang tersimpan otomatis.':'Browser tidak dapat menyimpan keranjang. Jangan tutup halaman sebelum menyalin atau mengirim rincian lewat WhatsApp.';}
 function describe(item){const q=item.quote;return item.kind==='tikar'?'Tikar rol '+q.order.width+' cm · '+colorNames[q.order.color]+' · '+(q.order.writing?'Dengan tulisan':'Tanpa tulisan'):q.product.name+' · '+q.product.width+' cm';}
 function detail(item){const q=item.quote;return q.strips+' '+(item.kind==='tikar'?'rol':'baris')+' × '+fmt(q.meters/q.strips)+' m = '+fmt(q.meters)+' m';}
 function extras(item){const q=item.quote;return item.kind==='tikar'?'Plisir '+rupiah(q.trimCost)+' · Packing '+(q.packingCost===null?'menunggu kapasitas karung':rupiah(q.packingCost)):'Obras '+q.order.overlock+' lokasi: '+rupiah(q.overlockCost)+' · Sambung '+q.order.seams+': '+rupiah(q.seamCost)+' · Lubang/tiang '+q.order.pillars+': '+rupiah(q.pillarCost);}
 function clearManualShipping(){if(el('cartDelivery').value==='manual'){el('cartDelivery').value='quote';el('cartCost').value='';}}
 function resetEdit(){editId=null;el('cartCancel').hidden=true;document.querySelectorAll('[data-cart-add]').forEach(b=>b.textContent='Tambah ke keranjang');}
 function render(){
  el('cartClear').disabled=!cart.items.length;el('cartClear').hidden=!cart.items.length;el('cartStorageNote').hidden=!cart.items.length;el('cartCount').textContent=cart.items.length+' item';el('cartJump').textContent='Lihat keranjang ('+cart.items.length+')';el('cartEmpty').hidden=!!cart.items.length;el('cartCheckout').hidden=!cart.items.length;
  const mixed=cart.items.some(i=>i.kind==='tikar');el('cartLocal').disabled=mixed;if(mixed&&el('cartDelivery').value==='local')el('cartDelivery').value='quote';
  for(const id of ['whatsapp','carpetWhatsapp'])el(id).hidden=cart.items.length>0;
  el('cartItems').replaceChildren();
  for(const item of cart.items){const row=document.createElement('article');const heading=document.createElement('h3');heading.textContent=describe(item);row.append(heading);for(const text of [detail(item),'Produk '+rupiah(item.quote.subtotal)+' · '+rupiah(item.quote.rate??item.quote.product.rate)+'/m',extras(item)]){const p=document.createElement('p');p.textContent=text;row.append(p);}
   const edit=document.createElement('button');edit.type='button';edit.textContent='Ubah';edit.setAttribute('aria-label','Ubah '+describe(item));edit.addEventListener('click',()=>{editId=item.id;el('cartCancel').hidden=false;document.dispatchEvent(new CustomEvent('santri:edit',{detail:item}));document.querySelectorAll('[data-cart-add]').forEach(b=>b.textContent='Simpan perubahan item');});
   const remove=document.createElement('button');remove.type='button';remove.textContent='Hapus';remove.setAttribute('aria-label','Hapus '+describe(item));remove.addEventListener('click',()=>{cart.remove(item.id);persist();clearManualShipping();if(editId===item.id)resetEdit();render();el('cartStatus').textContent='Item dihapus.';el('cartMore').focus();});row.append(edit,remove);el('cartItems').append(row);
  }
  el('cartCostField').hidden=el('cartDelivery').value!=='manual';el('cartWhatsapp').removeAttribute('href');
  try{const q=cart.quote(el('cartDelivery').value,el('cartCost').value===''?null:el('cartCost').valueAsNumber);el('cartSummary').replaceChildren();
   const rows=[['Subtotal produk',q.goods],['Jahit & pengerjaan',q.services],['Packing',q.packing],['Ongkir seluruh pesanan',q.shipping]];
   for(const [label,value] of rows){const div=document.createElement('div');const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value===null?'Menunggu tarif':rupiah(value);div.append(dt,dd);el('cartSummary').append(div);}
   el('cartTotal').textContent=(q.total===null?'Biaya diketahui: ':'Estimasi total: ')+rupiah(q.knownTotal);el('cartWords').textContent=toWords(q.knownTotal);el('cartPending').textContent=q.pending.length?'Belum termasuk: '+q.pending.join('; ')+'.':'';
   const msg=['Assalamu’alaikum, mohon konfirmasi pesanan berikut.','',...cart.items.flatMap((item,i)=>[(i+1)+'. '+describe(item),detail(item),'Harga '+rupiah(item.quote.rate??item.quote.product.rate)+'/m; produk '+rupiah(item.quote.subtotal),extras(item),'']),...rows.map(([k,v])=>k+': '+(v===null?'Menunggu tarif':rupiah(v))),el('cartTotal').textContent,el('cartWords').textContent,el('cartPending').textContent,'Pengiriman: '+el('cartDelivery').selectedOptions[0].textContent,'Mohon cek stok, pengerjaan, packing, alamat tujuan dan total akhir.'].filter(Boolean).join('\n');
   if(cart.items.length)el('cartWhatsapp').href='https://wa.me/6285105016189?text='+encodeURIComponent(msg);el('cartWhatsapp').setAttribute('aria-disabled',String(!cart.items.length));
  }catch(e){el('cartTotal').textContent='Periksa ongkir';el('cartWords').textContent='';el('cartPending').textContent=e.message;el('cartWhatsapp').setAttribute('aria-disabled','true');}
 }
 document.addEventListener('santri:add',event=>{try{const {kind,order}=event.detail;if(editId!==null)cart.replace(editId,kind,order);else cart.add(kind,order);persist();clearManualShipping();resetEdit();render();el('cartStatus').textContent='Item ditambahkan.';el('santriCart').scrollIntoView({behavior:'smooth',block:'start'});el('santriCart').focus({preventScroll:true});}catch(e){el('cartStatus').textContent=e.message;el('cartStatus').scrollIntoView({block:'center'});}});
 el('cartJump').addEventListener('click',()=>{el('santriCart').scrollIntoView({behavior:'smooth',block:'start'});el('santriCart').focus({preventScroll:true});});
 el('cartMore').addEventListener('click',()=>{resetEdit();document.querySelector('.santriProductPicker').scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('[data-calculator]').focus({preventScroll:true});});el('cartCancel').addEventListener('click',()=>{resetEdit();el('cartStatus').textContent='Perubahan dibatalkan.';});
 el('cartClear').addEventListener('click',()=>{el('cartClearDialog').showModal();el('cartKeep').focus();});
 el('cartKeep').addEventListener('click',()=>el('cartClearDialog').close());
 el('cartClearConfirm').addEventListener('click',()=>{cart.items=[];resetEdit();el('cartDelivery').value='quote';el('cartCost').value='';persist();render();el('cartClearDialog').close();el('cartStatus').textContent='Keranjang dikosongkan.';el('cartMore').focus();});
 el('cartClearDialog').addEventListener('close',()=>{if(cart.items.length)el('cartClear').focus();});
 if(restored.status==='restored')el('cartStatus').textContent='Keranjang dipulihkan. Harga diperbarui; pilih kembali pengiriman.';
 if(restored.status==='expired')el('cartStatus').textContent='Keranjang sebelumnya sudah melewati masa simpan 7 hari. Silakan mulai pesanan baru.';
 if(restored.status==='unavailable')el('cartStorageNote').textContent='Keranjang sebelumnya tidak dapat dipulihkan. Anda tetap bisa menghitung dan membuat pesanan baru.';
 el('cartDelivery').addEventListener('change',render);el('cartCost').addEventListener('input',render);render();
}
