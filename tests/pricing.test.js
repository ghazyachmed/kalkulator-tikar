import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QuoteService, toWords, defaultOrder } from '../domain/pricing.js';
const engine = new QuoteService();
test('120 cm: 10 meter × 2 rol = Rp700.000', () => {
  const q = engine.calculate({...defaultOrder, length:10, quantity:2});
  assert.equal(q.subtotal,700000); assert.equal(q.total,700000); assert.equal(q.isFinal,true);
});
test('Tulisan memakai tarif Rp38.000', () => assert.equal(engine.calculate({...defaultOrder, writing:true, length:10, quantity:2}).total,760000));
test('Lebar 95 cm tidak mewarisi harga 120 cm', () => { const q=engine.calculate({...defaultOrder,width:95}); assert.equal(q.total,null); assert.equal(q.isFinal,false); });
test('Ongkir dan plisir yang belum diketahui tidak dianggap gratis', () => {const q=engine.calculate({...defaultOrder,trim:true,shipping:'cargo'}); assert.equal(q.isFinal,false); assert.equal(q.total,null); assert.ok(q.pending.includes('Plisir'));});
test('Kebutuhan ruangan membulatkan jumlah lajur ke atas', () => {const q=engine.calculate({...defaultOrder,mode:'room',roomWidth:5,roomLength:10});assert.equal(q.strips,5);assert.equal(q.meters,50);assert.equal(q.total,1750000);});
test('Desimal tepat sampai sentimeter', () => assert.equal(engine.calculate({...defaultOrder,length:1.11,quantity:3}).total,116550));
test('Tolak ukuran negatif, NaN, infinity, jumlah pecahan, enum palsu', () => { for(const patch of [{length:-1},{length:NaN},{length:Infinity},{quantity:1.5},{width:110},{color:'pink'},{product:'fake'},{shipping:'fake'},{writing:'true'},{length:1.001}]) assert.throws(()=>engine.calculate({...defaultOrder,...patch})); });
test('Produk lain belum diberi harga palsu',()=>assert.equal(engine.calculate({...defaultOrder,product:'karpet'}).total,null));
test('Terbilang hingga miliar, nol dan bilangan tidak sah',()=>{assert.equal(toWords(760000),'tujuh ratus enam puluh ribu rupiah');assert.equal(toWords(1000000),'satu juta rupiah');assert.equal(toWords(0),'nol rupiah');assert.throws(()=>toWords(-1));});
test('Ongkir manual masuk estimasi dan ditandai sumbernya',()=>{const q=engine.calculate({...defaultOrder,shipping:'cargo',shippingCost:50000});assert.equal(q.total,400000);assert.equal(q.shippingSource,'manual');});
test('Ongkir tidak sah ditolak',()=>{for(const shippingCost of [-1,Infinity,1.5,'50000'])assert.throws(()=>engine.calculate({...defaultOrder,shipping:'cargo',shippingCost}));});
