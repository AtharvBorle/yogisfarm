const fs = require('fs');

let html = '<html><body style="background:#ccc; display:flex; flex-wrap:wrap; font-family:sans-serif;">';
for(let i=1; i<=47; i++) {
    const path = `frontend/src/assets/figma/img_${i}.png`;
    if(fs.existsSync(path)) {
        html += `<div style="margin:10px;text-align:center;background:#fff;padding:10px;border-radius:8px;">
            <img src="${path}" style="max-width:150px; max-height:150px;"/><br/>img_${i}.png
        </div>`;
    }
}
html += '</body></html>';
fs.writeFileSync('preview_assets.html', html);
console.log('Created preview_assets.html');
