// Dibantu AI: tarif dari daftar harga pemilik tahun 2026.
export const carpetCatalog=Object.freeze([
  ['raudhah','Raudhah',120,710000],['alNima','Al Nima',120,610000],['alImam','Al Imam',120,470000],['alNamaz','Al Namaz',120,390000],['mecca','Mecca',120,350000],['maulana','Maulana',120,260000],['rajakhan','Rajakhan',120,260000],['kingdom','Kingdom',120,205000],['alQuds','Al Quds',120,200000],['almira','Almira',120,180000],['dinasty','Dinasty',120,170000],['medina115','Medina 115',115,130000],['medina105','Medina 105',105,120000],['medinaGambar','Medina Gambar / Masjid',105,67000],['medinaPilar','Medina Pilar',105,67000]
].map(([id,name,width,rate])=>Object.freeze({id,name,width,rate})));
export class CarpetQuoteService{
  constructor(){this.products=new Map(carpetCatalog.map(p=>[p.id,p]));}
  calculate(order){
    const product=this.products.get(order.product);if(!product)throw Error('Pilih jenis karpet yang tersedia.');
    if(!['length','room'].includes(order.mode))throw Error('Pilih cara menghitung.');
    if(!['pickup','local','quote'].includes(order.delivery))throw Error('Pilih cara pengiriman.');
    const number=(value,label,min,max,integer=false)=>{if(!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))throw Error(label+' tidak valid.');return value;};
    const length=number(order.mode==='room'?order.roomLength:order.length,'Panjang',0.01,1000);
    const strips=order.mode==='room'?Math.ceil(number(order.roomWidth,'Lebar ruangan',0.01,1000)*100/product.width):number(order.quantity,'Jumlah baris karpet',1,10000,true);
    const meters=Math.round(length*strips*100)/100;
    const subtotal=Math.round(meters*product.rate);
    const overlockCost=number(order.overlock,'Titik obras',0,10000,true)*10000;
    const seamCost=number(order.seams,'Jumlah sambungan',0,10000,true)*30000;
    const pillarCost=number(order.pillars,'Jumlah lubang / tiang',0,10000,true)*50000;
    const shippingCost=order.delivery==='pickup'?0:order.delivery==='local'?100000:null;
    const knownTotal=subtotal+overlockCost+seamCost+pillarCost+(shippingCost??0);
    const advice=carpetAdvice(order,product,strips);
    return {advice,order:{...order},product,length,strips,meters,subtotal,overlockCost,seamCost,pillarCost,shippingCost,knownTotal,total:shippingCost===null?null:knownTotal,pending:shippingCost===null?['ongkir']:[]};
  }
}

// Rekomendasi tidak menetapkan jumlah titik pengerjaan.
export function carpetAdvice(order,product,rows){
 const fmt=value=>value.toLocaleString('id-ID',{maximumFractionDigits:2});
 if(order.mode!=='room')return {cutWidthCm:null,multipleRows:false,notes:['Punya ukuran ruangan? Pilih “Dari ukuran ruangan” untuk melihat saran potong, obras, dan sambungan.']};
 const roomCm=Math.round(order.roomWidth*10000)/100;
 const cutWidthCm=Math.max(0,Math.round((rows*product.width-roomCm)*100)/100);
 const lastRowWidthCm=Math.round((product.width-cutWidthCm)*100)/100;
 const notes=[];
 if(cutWidthCm>0){notes.push('Disarankan: sesuaikan lebar '+(rows===1?'karpet':'baris terakhir')+' dari '+product.width+' cm menjadi '+fmt(lastRowWidthCm)+' cm (potong '+fmt(cutWidthCm)+' cm). Pertimbangkan obras pada tepi hasil potongan agar rapi.');notes.push('Estimasi bahan tetap memakai lebar karpet utuh sebelum dipotong.');}
 else notes.push('Lebar ruangan pas untuk '+rows+' baris karpet. Tidak diperlukan pemotongan lebar berdasarkan ukuran ini.');
 if(rows>1)notes.push('Pasang '+rows+' baris karpet berdampingan. Sambungan bisa dipertimbangkan jika ingin baris-barisnya menyatu; ruangan yang lebih lebar tidak otomatis membutuhkan jasa sambung.');
 notes.push('Saran ini mengikuti arah panjang ruangan. Jumlah titik obras dan sambungan ditentukan dari rencana pemasangan; biaya baru ditambahkan saat Anda mengisi jumlahnya.');
 return {cutWidthCm,lastRowWidthCm,multipleRows:rows>1,notes};
}
