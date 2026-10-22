import {test} from 'node:test';import assert from 'node:assert/strict';import {ShippingService} from '../domain/shipping.js';
const service=new ShippingService();
test('Volume Indah darat memakai pembagi 5000',()=>{const q=service.calculate({length:100,width:50,height:40,weight:12,packages:2,service:'land'});assert.equal(q.volumeWeight,80);assert.equal(q.actualWeight,24);assert.equal(q.referenceWeight,80);});
test('Volume Indah udara memakai pembagi 6000',()=>{const q=service.calculate({length:100,width:60,height:40,weight:60,packages:1,service:'air'});assert.equal(q.volumeWeight,40);assert.equal(q.referenceWeight,60);});
test('Dimensi paket tidak sah ditolak',()=>assert.throws(()=>service.calculate({length:NaN,width:20,height:20,weight:2,packages:1,service:'land'})));
