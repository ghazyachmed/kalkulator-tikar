// Dibantu AI: simpan pilihan saja, harga dihitung ulang saat pemulihan.
import {OrderCart} from '../domain/cart.js';
export class CartStorage{
 constructor(storage,now=()=>Date.now()){this.storage=storage;this.now=now;this.key='santriCart.v1';this.maxAge=7*24*60*60*1000;}
 save(cart){try{const keys=['product','mode','width','color','length','quantity','roomWidth','roomLength','writing','trim','packing','cargoService','overlock','seams','pillars'];const items=cart.items.map(item=>({kind:item.kind,order:Object.fromEntries(keys.filter(k=>Object.hasOwn(item.order,k)).map(k=>[k,item.order[k]]))}));this.storage.setItem(this.key,JSON.stringify({version:1,updatedAt:this.now(),items}));return true;}catch{return false;}}
 load(){const cart=new OrderCart();try{const raw=this.storage.getItem(this.key);if(!raw)return {cart,status:'empty'};if(raw.length>100000)throw Error('size');const data=JSON.parse(raw);if(data.version!==1||!Number.isFinite(data.updatedAt)||data.updatedAt>this.now()||!Array.isArray(data.items)||data.items.length>50)throw Error('format');if(this.now()-data.updatedAt>this.maxAge){this.storage.removeItem(this.key);return {cart,status:'expired'};}for(const item of data.items)cart.add(item.kind,item.order);return {cart,status:cart.items.length?'restored':'empty'};}catch{return {cart:new OrderCart(),status:'unavailable'};}}
}
