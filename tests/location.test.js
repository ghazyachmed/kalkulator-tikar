import test from 'node:test';
import assert from 'node:assert/strict';
import {RadiusService,LocationService} from '../services/location.js';
const service=new RadiusService({latitude:0,longitude:0});
test('Jarak dihitung di permukaan bumi, termasuk koordinat selatan',()=>{
 assert.equal(service.measure({latitude:0,longitude:0,accuracy:10}).distanceKm,0);
 const q=service.measure({latitude:-0.05,longitude:0,accuracy:20});
 assert.ok(q.distanceKm>5.5&&q.distanceKm<5.6);assert.equal(q.zone,'inside');
});
test('Akurasi GPS yang melintasi batas 10 km tidak menjanjikan tarif lokal',()=>{
 assert.equal(service.measure({latitude:0.0898,longitude:0,accuracy:100}).zone,'uncertain');
 assert.equal(service.measure({latitude:0.1,longitude:0,accuracy:10}).zone,'outside');
});
test('Koordinat dan akurasi tidak valid ditolak',()=>{
 for(const coords of [{latitude:91,longitude:0,accuracy:0},{latitude:0,longitude:181,accuracy:0},{latitude:0,longitude:0,accuracy:-1},{latitude:NaN,longitude:0,accuracy:0}])assert.throws(()=>service.measure(coords));
});
test('Lokasi hanya diminta setelah request, dengan batas waktu',async()=>{
 let calls=0;const source={getCurrentPosition(success,error,options){calls++;assert.equal(options.timeout,10000);success({coords:{latitude:-7,longitude:110,accuracy:20}});}};
 const locator=new LocationService(source);assert.equal(calls,0);assert.equal((await locator.request()).latitude,-7);assert.equal(calls,1);
});
test('Izin ditolak dan perangkat tanpa GPS memberi pesan yang bisa ditindaklanjuti',async()=>{
 await assert.rejects(new LocationService(null).request(),/tidak mendukung/);
 await assert.rejects(new LocationService({getCurrentPosition(ok,fail){fail({code:1});}}).request(),/izin/);
 await assert.rejects(new LocationService({getCurrentPosition(ok,fail){fail({code:3});}}).request(),/Coba lagi/);
});
test('Cabang terdekat dipilih dari seluruh cabang, bukan urutan daftar',()=>{
 const branches=[{name:'A',latitude:0,longitude:0},{name:'B',latitude:0,longitude:1}];
 const point={latitude:0,longitude:0.99,accuracy:20};
 const result=RadiusService.nearest(branches,point);assert.equal(result.branch.name,'B');assert.equal(result.zone,'inside');
 assert.throws(()=>RadiusService.nearest([],point));
});
