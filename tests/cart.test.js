import test from 'node:test';
import assert from 'node:assert/strict';
import {OrderCart} from '../domain/cart.js';
const mat={width:95,length:6,quantity:40,trim:true};
test('multi-length rolls preserve units and include sewing',()=>{const c=new OrderCart();c.add('tikar',mat);c.add('tikar',{...mat,length:4});const q=c.quote('pickup');assert.equal(q.meters,400);assert.equal(q.goods,12400000);assert.equal(q.services,1600000);assert.equal(q.knownTotal,14000000);});
test('shipping charged once, mixed products cannot inherit carpet local rate',()=>{const c=new OrderCart();c.add('tikar',mat);c.add('carpet',{product:'medina105',mode:'length',length:8,quantity:3,overlock:2,seams:1,pillars:3});assert.throws(()=>c.quote('local'));assert.equal(c.quote('manual',150000).shipping,150000);assert.equal(c.quote('quote').total,null);});
test('packing unknown remains pending and edit replaces line',()=>{const c=new OrderCart();const id=c.add('tikar',{...mat,length:4,packing:'extra'});assert.equal(c.quote('pickup').total,null);c.replace(id,'tikar',{...mat,packing:'extra'});assert.equal(c.items.length,1);assert.equal(c.quote('pickup').packing,200000);c.remove(id);assert.equal(c.items.length,0);});
test('failed edit preserves original and IDs remain unique',()=>{const c=new OrderCart();const id=c.add('tikar',mat);assert.throws(()=>c.replace(id,'tikar',{...mat,quantity:-1}));assert.equal(c.items[0].quote.strips,40);c.remove(id);assert.notEqual(c.add('tikar',mat),id);assert.throws(()=>c.quote('manual',NaN));});
