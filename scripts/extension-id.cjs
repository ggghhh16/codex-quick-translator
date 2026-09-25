const fs = require('node:fs');
const { createHash } = require('node:crypto');
const manifest = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(!manifest.key) throw new Error('Manifest public key is missing.');
console.log([...createHash('sha256').update(Buffer.from(manifest.key,'base64')).digest('hex').slice(0,32)].map(c=>String.fromCharCode(97+parseInt(c,16))).join(''));
