const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const PrismaStore = require('./utils/sessionStore');
const prisma = require('./db');
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (required for secure cookies behind CloudFront/Nginx)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://192.168.0.151:5173', 
    'http://192.168.0.151:5174',
    'https://yogisfarms.com',
    'https://www.yogisfarms.com',
    'https://admin.yogisfarms.com',
    'https://www.admin.yogisfarms.com',
    'http://yogisfarms.com',
    'http://www.yogisfarms.com',
    'http://admin.yogisfarms.com',
    'http://www.admin.yogisfarms.com',
    'https://uat.yogisfarms.com',
    'http://uat.yogisfarms.com',
    'https://uat-admin.yogisfarms.com',
    'http://uat-admin.yogisfarms.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'yogisfarm-secret',
  resave: true,
  saveUninitialized: false,
  store: new PrismaStore(prisma),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: process.env.NODE_ENV === 'production' ? '.yogisfarms.com' : undefined
  }
}));

// Enforce admin absolute session expiration
app.use((req, res, next) => {
  if (req.session && req.session.adminExpiry) {
    const timeLeft = req.session.adminExpiry - Date.now();
    if (timeLeft <= 0) {
      req.session.destroy((err) => {
        if (err) console.error('Failed to destroy expired session:', err);
        return res.status(401).json({ status: false, message: 'Session expired' });
      });
      return;
    } else {
      req.session.cookie.expires = new Date(req.session.adminExpiry);
      req.session.cookie.maxAge = timeLeft;
    }
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '../../frontend/dist'), { index: false }));

// Make prisma available in routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/sliders', require('./routes/sliders'));
app.use('/api/search', require('./routes/search'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/taxes', require('./routes/taxes'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/hsns', require('./routes/hsn.routes'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/hsns', require('./routes/hsn.routes'));

// Delivery routes
app.use('/api/delivery', require('./routes/delivery'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend's index.html with dynamically injected SEO tags
const fs = require('fs');
app.get('*', async (req, res) => {
  // Ignore API, health, and static asset routes
  if (
    req.path.startsWith('/api') || 
    req.path.startsWith('/uploads') ||
    req.path.includes('.')
  ) {
    return res.status(404).send('Not found');
  }

  const distPath = path.join(__dirname, '../../frontend/dist');
  let indexPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    // If build folder does not exist, try source index.html
    indexPath = path.join(__dirname, '../../frontend/index.html');
  }

  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('index.html not found');
  }

  try {
    let html = fs.readFileSync(indexPath, 'utf8');

    const urlPath = req.path;
    let seoKey = null;
    let fallbackTitle = 'YogisFarms';
    let fallbackDesc = 'YogisFarms - Pure & Natural Farm Products';
    let fallbackKeywords = '';

    // Route matching for SEO
    if (urlPath === '/' || urlPath === '') {
      seoKey = 'home';
    } else if (urlPath.startsWith('/about-us') || urlPath.startsWith('/about')) {
      seoKey = 'about-us';
    } else if (urlPath.startsWith('/contact-us') || urlPath.startsWith('/contact')) {
      seoKey = 'contact-us';
    } else if (urlPath.startsWith('/shop')) {
      seoKey = 'shop';
    } else if (urlPath.startsWith('/blogs') && !urlPath.includes('/blogs/')) {
      seoKey = 'blogs';
    } else if (urlPath.startsWith('/cart')) {
      seoKey = 'cart';
    } else if (urlPath.startsWith('/checkout')) {
      seoKey = 'checkout';
    } else if (urlPath.startsWith('/wishlist')) {
      seoKey = 'wishlist';
    } else if (urlPath.startsWith('/blogs/')) {
      const slug = urlPath.substring(7).split('?')[0];
      seoKey = `blogs/${slug}`;

      const blog = await prisma.blogPost.findUnique({
        where: { slug }
      });
      if (blog) {
        fallbackTitle = blog.title;
        fallbackDesc = blog.description || '';
        fallbackKeywords = blog.tags || '';
      }
    } else if (urlPath.startsWith('/product/')) {
      const slug = urlPath.substring(9).split('?')[0];
      seoKey = `product/${slug}`;

      const product = await prisma.product.findUnique({
        where: { slug }
      });
      if (product) {
        fallbackTitle = product.name;
        fallbackDesc = product.description || '';
        if (product.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: product.categoryId }
          });
          if (category) {
            fallbackKeywords = category.name;
          }
        }
      }
    }

    let title = fallbackTitle;
    let description = fallbackDesc;
    let keywords = fallbackKeywords;

    if (seoKey) {
      const dbSettings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              `seo_${seoKey}_title`,
              `seo_${seoKey}_description`,
              `seo_${seoKey}_keywords`
            ]
          }
        }
      });

      const settingsMap = {};
      dbSettings.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      title = settingsMap[`seo_${seoKey}_title`] || title;
      description = settingsMap[`seo_${seoKey}_description`] || description;
      keywords = settingsMap[`seo_${seoKey}_keywords`] || keywords;
    }

    // Escape dynamic HTML injection content safely
    const escapeHtml = (unsafe) => {
      return (unsafe || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const cleanTitle = escapeHtml(title);
    const cleanDesc = escapeHtml(description);
    const cleanKeywords = escapeHtml(keywords);

    // Strip existing title, description, and keywords tags
    html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
    html = html.replace(/<meta\s+[^>]*name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+[^>]*property=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta\s+[^>]*name=["']keywords["'][^>]*>/gi, '');

    // Inject the new tags right after <head>
    const seoTags = `\n    <title>${cleanTitle}</title>\n    <meta name="description" content="${cleanDesc}">\n    <meta property="description" content="${cleanDesc}">\n    <meta name="keywords" content="${cleanKeywords}">`;

    html = html.replace('<head>', `<head>${seoTags}`);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Error generating dynamic HTML:', err);
    res.sendFile(indexPath);
  }
});

app.listen(PORT, () => {
  console.log(`YogisFarms Backend running on http://localhost:${PORT}`);
});
