const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('figma_home_html.txt', 'utf8');
const regex = /src=\"data:image\/([^;]+);base64,([^\"]+)\"/g;

let match;
let count = 0;

// Create an output directory for the extracted images
const outDir = path.join(__dirname, 'frontend', 'src', 'assets', 'figma');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

while ((match = regex.exec(html)) !== null) {
    count++;
    const ext = match[1];
    const base64Data = match[2];
    const filename = `img_${count}.${ext}`;
    fs.writeFileSync(path.join(outDir, filename), Buffer.from(base64Data, 'base64'));
}

console.log(`Extracted ${count} images to ${outDir}`);
