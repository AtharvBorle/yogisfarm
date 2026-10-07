import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('generate-spa-routes: dist/index.html not found, skipping.');
  process.exit(0);
}

const htmlContent = fs.readFileSync(indexPath, 'utf-8');

// Copy index.html to 404.html for S3 / GitHub Pages fallback
fs.writeFileSync(path.join(distDir, '404.html'), htmlContent, 'utf-8');

// List of all static routes in admin SPA
const routes = [
  'login',
  'sliders',
  'categories',
  'brands',
  'products',
  'inventory',
  'orders',
  'take-action',
  'sections',
  'taxes',
  'shipping',
  'collections',
  'contacts',
  'filemanager',
  'coupons',
  'yogis-points',
  'refer-and-earn',
  'reviews',
  'logs',
  'accounts'
];

routes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  // Write index.html inside the route directory (for /admin/route/ or directory lookups)
  fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent, 'utf-8');
  
  // Also write route.html and route (without extension) for direct S3 key matching
  fs.writeFileSync(path.join(distDir, `${route}.html`), htmlContent, 'utf-8');
  try {
    fs.writeFileSync(path.join(distDir, route), htmlContent, 'utf-8');
  } catch (e) {
    // ignore if conflict with directory
  }
});

console.log(`[SPA Helper] Generated fallback HTML files for ${routes.length} routes in dist/`);
