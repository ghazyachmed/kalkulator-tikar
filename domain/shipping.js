export const packageModel=Object.freeze({version:'swan-3kg-6.8m-v1',kgPerSquareMeter:3/(6.8*0.95),thicknessCm:0.12,coreDiameterCm:4,wrapCm:2,endAllowanceCm:4,packingKg:0.25,maxLength:20,source:'https://tikarswan.com/wp-content/uploads/2022/11/Katalog-Produk-Tikar-SWAN-BRAND.pdf'});
export class ShippingService {
  calculate({length,width,height,weight,packages,service}){
    for(const value of [length,width,height,weight])if(typeof value!=='number'||!Number.isFinite(value)||value<=0||value>10000)throw new Error('Ukuran dan berat paket harus lebih dari 0 sampai 10.000.');
    if(!Number.isInteger(packages)||packages<1||packages>10000000)throw new Error('Jumlah paket di luar batas simulasi.');
    if(!['land','sea','air'].includes(service))throw new Error('Layanan tidak valid.');
    const divisor=service==='air'?6000:5000;const volumeWeight=length*width*height*packages/divisor;const actualWeight=weight*packages;
    return {volumeWeight,actualWeight,referenceWeight:Math.max(volumeWeight,actualWeight),divisor};
  }
  estimateOrder(quote,service='land'){
    if(quote.order.product!=='tikar')return null;
    const {width}=quote.order;const {strips,meters}=quote;
    if(![95,120].includes(width)||!Number.isInteger(strips)||strips<1||strips>100000||!Number.isFinite(meters)||meters<=0||meters>10000000)throw new Error('Ukuran pesanan tidak valid.');
    const model=packageModel;const lengthCm=Math.round(meters/strips*100);const fullCount=Math.floor(lengthCm/(model.maxLength*100));const remainderCm=lengthCm%(model.maxLength*100);const groups=[];
    const addGroup=(matLength,count)=>{
      if(!count)return;const diameter=Math.ceil(Math.sqrt(model.coreDiameterCm**2+4*matLength*100*model.thicknessCm/Math.PI)+model.wrapCm);
      const netPerPackage=matLength*width/100*model.kgPerSquareMeter;
      const grossPerPackage=netPerPackage+model.packingKg;
      const result=this.calculate({length:width+model.endAllowanceCm,width:diameter,height:diameter,weight:grossPerPackage,packages:count,service});
      groups.push({count,matLength,length:width+model.endAllowanceCm,width:diameter,height:diameter,netWeight:netPerPackage*count,...result,billableReference:Math.ceil(Math.max(grossPerPackage,(width+model.endAllowanceCm)*diameter**2/result.divisor))*count});
    };
    addGroup(model.maxLength,fullCount*strips);if(remainderCm)addGroup(remainderCm/100,strips);
    const sum=key=>groups.reduce((total,group)=>total+group[key],0);
    return {isEstimate:true,modelVersion:model.version,groups,packageCount:groups.reduce((total,group)=>total+group.count,0),netWeight:sum('netWeight'),actualWeight:sum('actualWeight'),volumeWeight:sum('volumeWeight'),referenceWeight:sum('referenceWeight'),billableReference:sum('billableReference'),source:model.source,service};
  }
}
