import {carpetCatalog,CarpetQuoteService} from '../domain/carpet.js';
import {rupiah,toWords} from '../domain/pricing.js';
// Dibantu AI: percakapan karpet dengan perhitungan deterministik.
export class CarpetAssistant{
 constructor(){this.service=new CarpetQuoteService();}
 reply(message,context){
  const text=message.toLowerCase().trim();const num=s=>Number(s.replace(',','.'));const patch={};
  const product=carpetCatalog.find(p=>text.includes(p.name.toLowerCase())||text.includes(p.id.toLowerCase()))||(/medina.*(?:gambar|masjid)/.test(text)?carpetCatalog.find(p=>p.id==='medinaGambar'):null);
  if(product)patch.product=product.id;
  const forward=text.match(/(-?\d+(?:[.,]\d+)?)\s*(cm|meter|m)\s*[x×]\s*(-?\d+(?:[.,]\d+)?)\s*(?:roll?|lajur|baris(?:\s+karpet)?|potong(?:an)?)\b/);
  const reverse=text.match(/(-?\d+(?:[.,]\d+)?)\s*(?:roll?|lajur|baris(?:\s+karpet)?|potong(?:an)?)\s*[x×]\s*(-?\d+(?:[.,]\d+)?)\s*(cm|meter|m)\b/);
  const pair=text.match(/(-?\d+(?:[.,]\d+)?)\s*(cm|meter|m)?\s*[x×]\s*(-?\d+(?:[.,]\d+)?)\s*(cm|meter|m)?\b/);
  const meters=(v,u)=>num(v)/(u==='cm'?100:1);
  if(forward||reverse){patch.mode='length';patch.length=forward?meters(forward[1],forward[2]):meters(reverse[2],reverse[3]);patch.quantity=num(forward?forward[3]:reverse[1]);}
  else if(pair){patch.mode='room';patch.roomLength=meters(pair[1],pair[2]||pair[4]);patch.roomWidth=meters(pair[3],pair[4]||pair[2]);}
  else{const length=text.match(/(?:panjang\s*)?(-?\d+(?:[.,]\d+)?)\s*(meter|m)\b/);const count=text.match(/(-?\d+(?:[.,]\d+)?)\s*(?:roll?|lajur|baris(?:\s+karpet)?|potong(?:an)?)\b/);if(length){patch.mode='length';patch.length=num(length[1]);}if(count){patch.mode='length';patch.quantity=num(count[1]);}}
  for(const [key,term] of [['overlock','obras'],['seams','sambung(?:an)?'],['pillars','(?:lubang|lobang|tiang)']]){const before=text.match(new RegExp('(-?\\d+(?:[.,]\\d+)?)\\s*(?:titik\\s*)?'+term));const after=text.match(new RegExp(term+'\\s*(-?\\d+(?:[.,]\\d+)?)'));if(before||after)patch[key]=num((after||before)[1]);if(new RegExp('tanpa\\s*'+term).test(text))patch[key]=0;}
  if(/luar kota|di atas 10|lebih dari 10|>=\s*10/.test(text))patch.delivery='quote';else if(/kurang dari 10|<\s*10|kirim lokal/.test(text))patch.delivery='local';else if(/ambil.*toko/.test(text))patch.delivery='pickup';
  const numeric=Object.keys(patch).length>0;
  if(!numeric&&/pilihan|jenis|harga apa|daftar|jual apa/.test(text))return {answer:'Ada 15 jenis karpet. Tinggi mengikuti jenisnya. Harga per meter panjang:\n\n'+carpetCatalog.map(p=>p.name+' · '+p.width+' cm · '+rupiah(p.rate)+'/m').join('\n')+'\n\nPilih jenis pada formulir atau tulis, misalnya “Medina 115 untuk ruangan 10 × 5 m”.'};
  if(!numeric&&/obras|titik|sambung|lubang|lobang|tiang/.test(text))return {answer:'Biaya pengerjaan:\n• Obras: Rp10.000 per lokasi pengerjaan\n• Sambung: Rp30.000/sambungan\n• Lubang / tiang: Rp50.000 per lubang/tiang\n\nContoh: 3 lubang/tiang × Rp50.000 = Rp150.000. Tulis “tiang 3”. Satu lubang untuk satu tiang dihitung satu kali.\n\nUntuk obras dan sambungan, isi jumlah pengerjaan yang dibutuhkan. Jika belum tahu jumlahnya, tanyakan kepada toko melalui WhatsApp.'};
  if(!numeric&&/ongkir|kirim|pengiriman/.test(text))return {answer:'Radius kurang dari 10 km dari JJ Warehouse, Jl. Galuh I No. 3, Banyuanyar, Surakarta: Rp100.000.\nJarak 10 km ke atas atau luar kota: tarif melalui WhatsApp.\nAmbil di toko: tanpa ongkir.\n\nGunakan tombol “Gunakan lokasi saya” di bagian Pengiriman jika Anda berada di alamat tujuan, atau tulis “kirim luar kota”.'};
  if(!numeric&&/bantu|ruangan|mulai|halo/.test(text))return {answer:'Pilih jenis karpet dahulu, lalu tulis ukuran ruangan atau panjang per baris dan jumlahnya.\n\nContoh: “Medina 115 ruangan 10 × 5 m” atau “Medina 105 panjang 8 m × 20 baris”.\n\nHitungan memakai pilihan pada formulir saat ini.'};
  if(!numeric&&!/hitung|total|pesan|book|wa|admin/.test(text))return {answer:'Saya membantu karpet sajadah, ukuran, harga, titik pengerjaan, dan pengiriman. Mulai dari “pilihan karpet” atau tulis jenis dan ukuran kebutuhan Anda.'};
  try{const q=this.service.calculate({...context,...patch});return {order:q.order,quote:q,answer:q.product.name+' · Tinggi '+q.product.width+' cm\n'+(q.order.mode==='room'?'Ruangan '+q.order.roomLength+' × '+q.order.roomWidth+' m. Baris mengikuti panjang ruangan.\n':'')+q.strips+' baris × '+q.length+' m = '+q.meters+' meter\nHarga: '+rupiah(q.product.rate)+'/meter\n\nSubtotal: '+rupiah(q.subtotal)+'\nObras: '+rupiah(q.overlockCost)+'\nSambung: '+rupiah(q.seamCost)+'\nLubang / tiang ('+q.order.pillars+' × Rp50.000): '+rupiah(q.pillarCost)+'\nOngkir: '+(q.shippingCost===null?'Belum diketahui':rupiah(q.shippingCost))+'\n\n'+(q.total===null?'Estimasi belum termasuk ongkir: ':'Estimasi total: ')+rupiah(q.knownTotal)+'\n'+toWords(q.knownTotal)+(q.advice.cutWidthCm?'\n\nBaris terakhir: potong lebar '+q.product.width+' → '+q.advice.lastRowWidthCm+' cm. Obras opsional.':'')+'\n\nStok dapat berubah. Lanjutkan lewat WhatsApp untuk memastikan ketersediaan dan total pesanan.'};}catch(error){return {answer:error.message+' Periksa ukuran atau jumlah titik pengerjaan.'};}
 }
}
