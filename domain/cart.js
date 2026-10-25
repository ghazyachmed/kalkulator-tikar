// Dibantu AI: keranjang menghitung ulang harga, ongkir hanya sekali.
import {QuoteService} from './pricing.js';
import {CarpetQuoteService} from './carpet.js';
export class OrderCart{
 constructor(){this.items=[];this.nextId=1;}
 line(kind,input){
  if(!['tikar','carpet'].includes(kind))throw Error('Produk tidak tersedia.');
  const quote=kind==='tikar'?new QuoteService().calculate({...input,shipping:'pickup',shippingCost:null}):new CarpetQuoteService().calculate({...input,delivery:'pickup'});
  return {kind,order:quote.order,quote};
 }
 add(kind,input){if(this.items.length>=50)throw Error('Maksimal 50 rincian dalam satu pesanan.');const line=this.line(kind,input);const id=this.nextId++;this.items.push({id,...line});return id;}
 replace(id,kind,input){const index=this.items.findIndex(item=>item.id===id);if(index<0)throw Error('Rincian tidak ditemukan.');this.items[index]={id,...this.line(kind,input)};}
 remove(id){this.items=this.items.filter(item=>item.id!==id);}
 quote(delivery='quote',cost=null){
  if(!['pickup','local','quote','manual'].includes(delivery))throw Error('Pilih pengiriman.');
  if(delivery==='local'&&this.items.some(item=>item.kind!=='carpet'))throw Error('Tarif lokal ini khusus karpet. Ongkir pesanan campuran perlu tarif toko.');
  if(delivery==='manual'&&(!Number.isSafeInteger(cost)||cost<0||cost>100000000))throw Error('Isi tarif ongkir yang valid.');
  let goods=0,services=0,packing=0,meters=0;const pending=[];
  for(const [index,item] of this.items.entries()){const q=item.quote;goods+=q.subtotal;meters+=q.meters;services+=item.kind==='tikar'?q.trimCost??0:q.overlockCost+q.seamCost+q.pillarCost;packing+=q.packingCost??0;for(const p of q.pending)pending.push('Item '+(index+1)+': '+p);}
  const shipping=delivery==='pickup'?0:delivery==='local'?100000:delivery==='manual'?cost:null;
  if(shipping===null)pending.push('Ongkir seluruh pesanan');
  const knownTotal=goods+services+packing+(shipping??0);
  return {goods,services,packing,meters:Math.round(meters*100)/100,shipping,knownTotal,total:pending.length?null:knownTotal,pending};
 }
}
