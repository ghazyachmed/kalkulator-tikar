// Dibantu AI: lokasi hanya diakses melalui tindakan pelanggan.
{
 const root=document.getElementById('santriCarpet');
 const get=id=>root.querySelector('#'+id);
 const branches=storeLocations;
 if(branches.length){
  get('carpetLocation').hidden=false;
  get('carpetStoreName').textContent='Cek jarak dari cabang terdekat';
  for(const branch of branches){const item=document.createElement('p');const link=document.createElement('a');link.textContent=branch.name+' — '+branch.address+' ↗';link.href=branch.mapUrl;link.target='_blank';link.rel='noopener noreferrer';item.append(link);get('carpetStoreAddress').append(item);}
  const locator=new LocationService(navigator.geolocation);
  let requestId=0;let lastResult=null;
  const clear=()=>{requestId++;lastResult=null;get('carpetUseLocal').hidden=true;get('carpetLocate').disabled=false;get('carpetLocate').textContent='Gunakan lokasi saya';get('carpetLocate').removeAttribute('aria-busy');get('carpetLocationStatus').textContent='';};
  get('carpetReset').addEventListener('click',clear);
  get('carpetLocate').addEventListener('click',async()=>{
   const current=++requestId;lastResult=null;get('carpetUseLocal').hidden=true;
   get('carpetLocate').disabled=true;get('carpetLocate').textContent='Mencari lokasi…';get('carpetLocate').setAttribute('aria-busy','true');
   get('carpetLocationStatus').textContent='Izinkan akses lokasi jika browser meminta. Pencarian dapat berlangsung hingga 10 detik.';
   try{
    const point=await locator.request();if(current!==requestId)return;
    const result=RadiusService.nearest(branches,point);lastResult=result;
    const km=result.distanceKm.toLocaleString('id-ID',{minimumFractionDigits:1,maximumFractionDigits:2});
    const lead='Cabang terdekat: '+result.branch.name+'. Jarak'+': '+km+' km (garis lurus). Akurasi lokasi ±'+Math.ceil(result.accuracyMeters)+' meter. ';
    get('carpetLocationStatus').textContent=lead+(result.zone==='inside'?'Lokasi ini berada dalam radius 10 km. Jika ini alamat kirim Anda dan masih dalam kota, gunakan tarif lokal di bawah.':result.zone==='outside'?'Lokasi ini berjarak 10 km atau lebih. Minta tarif pengiriman melalui WhatsApp.':'Lokasi terlalu dekat dengan batas 10 km untuk memastikan tarif. Coba cari lokasi lagi atau tanyakan ongkir melalui WhatsApp.');
    get('carpetUseLocal').hidden=result.zone!=='inside';
    if(result.zone!=='inside'){get('carpetDelivery').value='quote';get('carpetDelivery').dispatchEvent(new Event('change',{bubbles:true}));}
   }catch(error){if(current===requestId)get('carpetLocationStatus').textContent=error.message;}
   finally{if(current===requestId){get('carpetLocate').disabled=false;get('carpetLocate').textContent='Cari ulang lokasi saya';get('carpetLocate').removeAttribute('aria-busy');}}
  });
  get('carpetUseLocal').addEventListener('click',()=>{
   if(lastResult?.zone!=='inside')return;
   get('carpetDelivery').value='local';get('carpetDelivery').dispatchEvent(new Event('change',{bubbles:true}));
   get('carpetLocationStatus').textContent+=' Ongkir lokal Rp100.000 sudah ditambahkan ke estimasi.';get('carpetUseLocal').hidden=true;
  });
 }
}
