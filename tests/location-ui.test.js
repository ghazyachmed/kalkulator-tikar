import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile(new URL('../services/location.js',import.meta.url),'utf8')).replace(/\bexport /g,'')+'\n'+await readFile(new URL('../wordpress/store-location.js',import.meta.url),'utf8')+'\n'+await readFile(new URL('../wordpress/location-app.js',import.meta.url),'utf8');
function setup(){
 const nodes=new Map();let pending;let calls=0;
 const element=()=>({hidden:true,textContent:'',value:'pickup',events:{},children:[],attributes:{},addEventListener(type,fn){this.events[type]=fn;},append(child){this.children.push(child);},setAttribute(name,value){this.attributes[name]=value;},removeAttribute(name){delete this.attributes[name];},dispatchEvent(event){this.events[event.type]?.(event);}});
 const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 const root={querySelector:selector=>get(selector.slice(1))};
 vm.runInNewContext(source,{document:{getElementById:()=>root,createElement:element},navigator:{geolocation:{getCurrentPosition(ok,fail){calls++;pending={ok,fail};}}},Event:class{constructor(type){this.type=type;}}});
 return {get,click:id=>get(id).events.click(),success:coords=>pending.ok({coords}),fail:error=>pending.fail(error),calls:()=>calls};
}
test('UI tidak meminta lokasi saat dimuat; Palur terpilih dan ongkir hanya diterapkan setelah konfirmasi tujuan',async()=>{
 const ui=setup();assert.equal(ui.calls(),0);assert.equal(ui.get('carpetLocation').hidden,false);
 const request=ui.click('carpetLocate');assert.equal(ui.get('carpetLocate').disabled,true);
 ui.success({latitude:-7.566348,longitude:110.866831,accuracy:20});await request;
 assert.match(ui.get('carpetLocationStatus').textContent,/Cabang terdekat: Toko Santri Palur/);
 assert.equal(ui.get('carpetUseLocal').hidden,false);assert.equal(ui.get('carpetDelivery').value,'pickup');
 ui.click('carpetUseLocal');assert.equal(ui.get('carpetDelivery').value,'local');
});
test('Lokasi jauh tidak menghasilkan ongkir lokal',async()=>{
 const ui=setup();const request=ui.click('carpetLocate');ui.success({latitude:-6.2,longitude:106.8,accuracy:20});await request;
 assert.equal(ui.get('carpetDelivery').value,'quote');assert.equal(ui.get('carpetUseLocal').hidden,true);
});
test('Reset mengabaikan hasil GPS yang terlambat',async()=>{
 const ui=setup();const request=ui.click('carpetLocate');ui.click('carpetReset');ui.success({latitude:-7.566348,longitude:110.866831,accuracy:20});await request;
 assert.equal(ui.get('carpetLocationStatus').textContent,'');assert.equal(ui.get('carpetUseLocal').hidden,true);assert.equal(ui.get('carpetLocate').disabled,false);
});
test('Izin ditolak membuka kembali tombol tanpa mengubah pengiriman',async()=>{
 const ui=setup();const request=ui.click('carpetLocate');ui.fail({code:1});await request;
 assert.match(ui.get('carpetLocationStatus').textContent,/izin/);assert.equal(ui.get('carpetLocate').disabled,false);assert.equal(ui.get('carpetDelivery').value,'pickup');
});
