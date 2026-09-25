function encode(message) {
  const body = Buffer.from(JSON.stringify(message));
  const header = Buffer.alloc(4); header.writeUInt32LE(body.length);
  return Buffer.concat([header,body]);
}
function decoder(onMessage, onError) {
  let buffer = Buffer.alloc(0); let failed = false;
  return chunk => {
    if(failed) return;
    buffer = Buffer.concat([buffer,chunk]);
    try {
      while(buffer.length >= 4) {
        const size = buffer.readUInt32LE(0);
        if(size > 1024 * 1024) throw new Error('本地消息超过大小限制。');
        if(buffer.length < size+4) return;
        const body = buffer.subarray(4,size+4); buffer = buffer.subarray(size+4);
        onMessage(JSON.parse(body.toString('utf8')));
      }
    } catch(e) { failed = true; onError(e); }
  };
}
module.exports = { encode, decoder };
