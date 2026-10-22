export class ShippingService {
  calculate({length,width,height,weight,packages,service}){
    for(const value of [length,width,height,weight])if(typeof value!=='number'||!Number.isFinite(value)||value<=0||value>10000)throw new Error('Ukuran dan berat paket harus lebih dari 0 sampai 10.000.');
    if(!Number.isInteger(packages)||packages<1||packages>1000)throw new Error('Jumlah paket harus 1–1.000.');
    if(!['land','sea','air'].includes(service))throw new Error('Layanan tidak valid.');
    const divisor=service==='air'?6000:5000;const volumeWeight=length*width*height*packages/divisor;const actualWeight=weight*packages;
    return {volumeWeight,actualWeight,referenceWeight:Math.max(volumeWeight,actualWeight),divisor};
  }
}
