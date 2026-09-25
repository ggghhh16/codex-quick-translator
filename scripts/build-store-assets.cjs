// Optional development dependency: sharp. No runtime dependency is added to the extension.
const fs=require('node:fs');const path=require('node:path');const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
  fs.mkdirSync(path.join(root,'extension/icons'),{recursive:true});
  fs.mkdirSync(path.join(root,'store/images'),{recursive:true});
  const icon=fs.readFileSync(path.join(root,'store/icon.svg'));
  for(const size of [16,32,48,128])await sharp(icon).resize(size,size).png().toFile(path.join(root,`extension/icons/icon-${size}.png`));
  const promo=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280"><rect width="440" height="280" fill="#191b17"/><circle cx="356" cy="42" r="148" fill="#242a1e"/><rect x="35" y="53" width="194" height="178" rx="12" fill="#252821" stroke="#56604a"/><path d="M56 81h108m-108 20h138m-138 20h118" stroke="#8e9881" stroke-width="6" stroke-linecap="round"/><rect x="50" y="139" width="151" height="22" rx="4" fill="#a8bb83"/><path d="M56 185h125m-125 20h94" stroke="#8e9881" stroke-width="6" stroke-linecap="round"/><rect x="224" y="106" width="181" height="133" rx="14" fill="#353b2d" stroke="#a3b48b"/><path d="M245 132h92m-92 22h137m-137 20h123m-123 31h65" stroke="#d3dcc8" stroke-width="6" stroke-linecap="round"/><g transform="translate(278 14) scale(.70)">${icon.toString().replace(/<svg[^>]*>|<\/svg>/g,'')}</g></svg>`);
  await sharp(promo).png().toFile(path.join(root,'store/images/promo-440x280.png'));
  console.log('Store icon sizes and 440x280 promotional tile generated');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
