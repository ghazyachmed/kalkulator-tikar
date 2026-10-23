// Bantuan AI: Perancangan, implementasi, dan pengujian dibantu Codex.
export const catalog = Object.freeze({
  version:'2026-10-23.1',
  products:[{id:'tikar',name:'Tikar rol',unit:'meter',description:'Anyaman plastik • panjang sesuai kebutuhan'},{id:'karpet',name:'Karpet masjid',unit:'meter',description:'Pilihan karpet untuk masjid & musala'}],
  rates:{'95':{plain:31000,writing:37000},'120':{plain:35000,writing:38000}},
  source:'Tarif pemilik Toko Santri, 23 Oktober 2026. Harga per meter panjang.',
});
export const defaultOrder = Object.freeze({product:'tikar',mode:'roll',width:120,color:'hijau',length:10,quantity:1,roomWidth:6,roomLength:12,writing:false,trim:false,packing:'standard',shipping:'pickup',shippingCost:null,cargoService:'land'});
const inList=(value,list,name)=>{if(!list.includes(value))throw new Error(name+' tidak valid.');};
const dimension=(value,name)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<0.01||value>1000||Math.abs(value*100-Math.round(value*100))>1e-7)throw new Error(name+' harus 0,01–1.000 meter, maksimal 2 desimal.');return Math.round(value*100);};
export class QuoteService {
  constructor(priceBook=catalog){this.priceBook=priceBook;}
  calculate(input){
    const order={...defaultOrder,...input};
    if(order.shipping==='courier')order.shipping='cargo';
    inList(order.product,['tikar','karpet'],'Produk');inList(order.mode,['roll','room'],'Mode');inList(order.width,[95,120],'Lebar');inList(order.color,['hijau','krem','biru','marun'],'Warna');inList(order.packing,['standard','extra'],'Packing');inList(order.shipping,['pickup','courier','cargo'],'Pengiriman');inList(order.cargoService,['land','sea','air'],'Layanan cargo');
    if(typeof order.writing!=='boolean'||typeof order.trim!=='boolean')throw new Error('Pilihan tambahan tidak valid.');
    if(!Number.isInteger(order.quantity)||order.quantity<1||order.quantity>10000)throw new Error('Jumlah harus 1–10.000 rol.');
    const lengthCm=dimension(order.length,'Panjang');const widthCm=dimension(order.roomWidth,'Lebar ruangan');const roomLengthCm=dimension(order.roomLength,'Panjang ruangan');
    const strips=order.mode==='room'?Math.ceil(widthCm/order.width):order.quantity;
    const metersCm=(order.mode==='room'?roomLengthCm:lengthCm)*strips;
    const rate=order.product==='tikar'?this.priceBook.rates[order.width]?.[order.writing?'writing':'plain']:null;
    if(order.shippingCost!==null&&(!Number.isSafeInteger(order.shippingCost)||order.shippingCost<0||order.shippingCost>100000000))throw new Error('Ongkir harus rupiah bulat 0–100.000.000.');
    const shippingCost=order.shipping==='pickup'?0:order.shippingCost;
    const rateSource=order.product!=='tikar'?{kind:'unknown',label:'Menunggu harga toko'}:{kind:'owner',label:'Tarif Toko Santri',note:'Harga per meter panjang dari pemilik, 23 Oktober 2026.'};
    const rollCm=order.mode==='room'?roomLengthCm:lengthCm;
    const bagCapacity=rollCm===1000?6:rollCm===600?10:null;
    const bagCount=order.packing==='extra'&&order.product==='tikar'&&bagCapacity?Math.ceil(strips/bagCapacity):order.packing==='standard'?0:null;
    const packingCost=bagCount===null?null:bagCount*50000;
    const trimCost=order.trim?(order.product==='tikar'?strips*20000:null):0;
    const pending=[];
    if(!rate)pending.push('Harga produk');if(trimCost===null)pending.push('Plisir');if(packingCost===null)pending.push('Kapasitas karung untuk panjang ini');if(order.shipping!=='pickup'&&shippingCost===null)pending.push('Ongkir Indah Cargo');
    const subtotal=rate?Math.round(metersCm*rate/100):null;
    const knownTotal=subtotal===null?null:subtotal+(trimCost??0)+(packingCost??0)+(shippingCost??0);
    const isFinal=pending.length===0;
    return {order,version:this.priceBook.version,strips,meters:metersCm/100,area:metersCm*order.width/10000,trimMeters:(2*(order.width+(order.mode==='room'?roomLengthCm:lengthCm))*strips)/100,rate:rate??null,rateSource,subtotal,trimCost,packingCost,bagCapacity,bagCount,knownTotal,shippingCost,shippingSource:order.shipping==='pickup'?'pickup':shippingCost===null?'unknown':'manual',total:isFinal?knownTotal:null,isFinal,pending,words:subtotal===null?null:toWords(knownTotal)};
  }
}
export const rupiah=value=>value===null?'Harga belum tersedia':new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
export function toWords(amount){
  if(!Number.isSafeInteger(amount)||amount<0||amount>=1000000000000)throw new Error('Nominal tidak valid.');
  const digits=['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
  const read=n=>n<12?digits[n]:n<20?read(n-10)+' belas':n<100?read(Math.floor(n/10))+' puluh '+read(n%10):n<200?'seratus '+read(n-100):n<1000?read(Math.floor(n/100))+' ratus '+read(n%100):n<2000?'seribu '+read(n-1000):n<1000000?read(Math.floor(n/1000))+' ribu '+read(n%1000):n<1000000000?read(Math.floor(n/1000000))+' juta '+read(n%1000000):read(Math.floor(n/1000000000))+' miliar '+read(n%1000000000);
  return ((amount===0?'nol':read(amount)).replace(/\s+/g,' ').trim()+' rupiah');
}
