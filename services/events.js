export class EventService {
  constructor(bucket){this.bucket=bucket;}
  async store(event){
    if(!this.bucket)throw new Error('Object storage belum dikonfigurasi.');
    if(event?.type!=='quoteCreated'||!/^[-a-z0-9]{36}$/i.test(event.id))throw new Error('Event tidak valid.');
    // Kunci Tetap: Pengiriman ulang menimpa objek yang sama.
    await this.bucket.put('quotes/'+event.id+'.json',JSON.stringify(event),{httpMetadata:{contentType:'application/json'}});
  }
  async consume(batch){for(const message of batch.messages){try{await this.store(message.body);message.ack();}catch{message.retry({delaySeconds:60});}}}
}
