import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CarpetQuoteService,carpetCatalog} from '../domain/carpet.js';
const service=new CarpetQuoteService();
const base={product:'medina105',mode:'length',length:8,quantity:20,roomLength:8,roomWidth:20,overlock:0,seams:0,pillars:0,delivery:'pickup'};
test('Daftar harga pemilik memetakan jenis dan tinggi',()=>{assert.equal(carpetCatalog.length,15);assert.ok(carpetCatalog.slice(0,11).every(p=>p.width===120));assert.equal(carpetCatalog.find(p=>p.id==='medina115').width,115);assert.ok(carpetCatalog.slice(12).every(p=>p.width===105));});
test('Harga per meter panjang bukan meter persegi',()=>{const q=service.calculate(base);assert.equal(q.meters,160);assert.equal(q.subtotal,19200000);});
test('Biaya titik dan sambungan terpisah dari panjang',()=>{const q=service.calculate({...base,length:10,quantity:1,overlock:4,seams:2,pillars:3,delivery:'local'});assert.equal(q.overlockCost,40000);assert.equal(q.seamCost,60000);assert.equal(q.pillarCost,150000);assert.equal(q.shippingCost,100000);assert.equal(q.total,1550000);});
test('Luar kota tidak dianggap gratis ongkir',()=>{const q=service.calculate({...base,delivery:'quote'});assert.equal(q.total,null);assert.equal(q.shippingCost,null);assert.equal(q.knownTotal,19200000);assert.ok(q.pending.includes('ongkir'));});
test('Ruangan menggunakan tinggi tiap jenis dan lajur dibulatkan ke atas',()=>{const q=service.calculate({...base,product:'medina115',mode:'room',roomLength:10,roomWidth:5});assert.equal(q.strips,5);assert.equal(q.meters,50);assert.equal(q.subtotal,6500000);});
test('Input negatif pecahan titik dan jenis tak dikenal ditolak',()=>{for(const patch of [{overlock:-1},{seams:1.5},{pillars:Infinity},{length:0},{quantity:1.5},{product:'fake'},{delivery:'free'}])assert.throws(()=>service.calculate({...base,...patch}));});

import {CarpetAssistant} from '../services/carpet-assistant.js';
const chat=new CarpetAssistant();
test('Chat karpet membedakan meter dan jumlah lajur',()=>{const r=chat.reply('Medina 105 panjang 8 m x 20 rol',base);assert.equal(r.quote.meters,160);assert.equal(r.quote.subtotal,19200000);});
test('Chat karpet menghitung jenis tinggi dan biaya pengerjaan',()=>{const r=chat.reply('Medina 115 ruangan 10 x 5 m obras 4 sambung 2 tiang 3 kirim luar kota',base);assert.equal(r.quote.meters,50);assert.equal(r.quote.knownTotal,6750000);assert.equal(r.quote.total,null);});
test('Chat katalog tidak menghasilkan pesanan contoh',()=>{assert.equal(chat.reply('pilihan karpet',base).quote,undefined);});
test('Ruangan lebih sempit menyarankan potong dan obras tanpa menambah biaya',()=>{
 const q=service.calculate({...base,product:'dinasty',mode:'room',roomLength:8,roomWidth:0.9});
 assert.equal(q.advice.cutWidthCm,30);assert.equal(q.advice.multipleRows,false);
 assert.match(q.advice.notes.join(' '),/obras/i);assert.equal(q.overlockCost,0);assert.equal(q.seamCost,0);
});
test('Lebar pas beberapa baris tidak menyarankan pemotongan',()=>{
 const q=service.calculate({...base,product:'dinasty',mode:'room',roomLength:8,roomWidth:3.6});
 assert.equal(q.strips,3);assert.equal(q.advice.cutWidthCm,0);assert.equal(q.advice.multipleRows,true);
 assert.match(q.advice.notes.join(' '),/berdampingan/);assert.equal(q.seamCost,0);
});
test('Lebar tidak pas menjelaskan lebar baris terakhir dan estimasi bahan utuh',()=>{
 const q=service.calculate({...base,product:'dinasty',mode:'room',roomLength:8,roomWidth:3});
 assert.equal(q.strips,3);assert.equal(q.advice.lastRowWidthCm,60);assert.equal(q.advice.cutWidthCm,60);assert.equal(q.meters,24);
});
test('Panjang pesanan tanpa ukuran ruangan tidak menebak potongan atau sambungan',()=>{
 const q=service.calculate(base);assert.equal(q.advice.cutWidthCm,null);assert.match(q.advice.notes.join(' '),/ukuran ruangan/);
});
test('Chat memahami baris dan memberikan rekomendasi yang sama dengan kalkulator',()=>{
 const q=chat.reply('Dinasty 8 m x 3 baris',base);assert.equal(q.quote.meters,24);assert.match(q.answer,/3 baris/);
 const room=chat.reply('Dinasty ruangan 8 x 3 m',base);assert.match(room.answer,/obras/i);assert.equal(room.quote.overlockCost,0);
});
