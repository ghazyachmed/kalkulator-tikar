// Dibantu AI: estimasi radius lokal tanpa menyimpan koordinat pelanggan.
export class RadiusService{
 static nearest(branches,point){
  if(!branches.length)throw new Error('Lokasi cabang belum tersedia.');
  return branches.map(branch=>({...new RadiusService(branch).measure(point),branch})).reduce((best,result)=>result.distanceKm<best.distanceKm?result:best);
 }
 constructor(origin){this.validate({...origin,accuracy:0});this.origin=Object.freeze({...origin});}
 validate(point){if(!point||!Number.isFinite(point.latitude)||Math.abs(point.latitude)>90||!Number.isFinite(point.longitude)||Math.abs(point.longitude)>180||!Number.isFinite(point.accuracy)||point.accuracy<0)throw new Error('Lokasi belum cukup jelas. Coba lagi atau pilih pengiriman secara manual.');}
 measure(point){
  this.validate(point);const rad=value=>value*Math.PI/180;
  const deltaLat=rad(point.latitude-this.origin.latitude),deltaLon=rad(point.longitude-this.origin.longitude);
  const a=Math.sin(deltaLat/2)**2+Math.cos(rad(this.origin.latitude))*Math.cos(rad(point.latitude))*Math.sin(deltaLon/2)**2;
  const distanceKm=6371*2*Math.atan2(Math.sqrt(Math.min(1,a)),Math.sqrt(Math.max(0,1-a)));
  const marginKm=point.accuracy/1000;
  return {distanceKm,accuracyMeters:point.accuracy,zone:distanceKm+marginKm<10?'inside':distanceKm-marginKm>=10?'outside':'uncertain'};
 }
}
export class LocationService{
 constructor(geolocation){this.geolocation=geolocation;}
 request(){return new Promise((resolve,reject)=>{
  if(!this.geolocation){reject(new Error('Perangkat ini tidak mendukung lokasi otomatis. Pilih pengiriman secara manual.'));return;}
  this.geolocation.getCurrentPosition(position=>resolve({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy}),error=>reject(new Error(error.code===1?'Akses lokasi belum diizinkan. Aktifkan izin lokasi di browser atau pilih pengiriman secara manual.':error.code===3?'Lokasi belum ditemukan dalam 10 detik. Coba lagi di tempat terbuka atau pilih pengiriman secara manual.':'Lokasi belum terbaca. Aktifkan layanan lokasi perangkat, lalu coba lagi.')),{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
 });}
}
