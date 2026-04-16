const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const { requireAdmin } = require('../middleware/auth');

// Multer config — supports subfolder uploads via uploadPath field
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = req.body.uploadPath || req.query.uploadPath || '';
    const dir = path.join(__dirname, '..', '..', 'uploads', subdir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Admin Auth ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.json({ status: false, message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.json({ status: false, message: 'Invalid credentials' });
    req.session.adminId = admin.id;
    req.session.adminRole = admin.role;
    res.json({ status: true, message: 'Login successful', admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.get('/me', requireAdmin, async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.session.adminId }, select: { id: true, name: true, email: true, role: true } });
  res.json({ status: true, admin });
});

router.post('/change-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({ where: { id: req.session.adminId } });
    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return res.json({ status: false, message: 'Current password incorrect' });
    await prisma.admin.update({ where: { id: admin.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
    res.json({ status: true, message: 'Password changed' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.get('/logout', (req, res) => {
  delete req.session.adminId;
  delete req.session.adminRole;
  res.json({ status: true, message: 'Logged out' });
});

// ─── Dashboard Stats ───
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);

    const [
      totalSalesAgg,
      lastMonthSalesAgg,
      totalOrders,
      lastMonthOrders,
      totalUsers,
      lastMonthUsers,
      totalProducts,
      recentOrders,
      topProductsRaw
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { orderStatus: { not: 'cancelled' } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { orderStatus: { not: 'cancelled' }, createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth } } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth } } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } } }
      }),
      prisma.orderItem.groupBy({
        by: ['name'], _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } }, take: 10
      })
    ]);

    // Monthly Sales Trend (Last 6 months)
    const salesTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthSales = await prisma.order.aggregate({
        _sum: { total: true },
        where: { orderStatus: { not: 'cancelled' }, createdAt: { gte: start, lt: end } }
      });
      salesTrend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        sales: Number(monthSales._sum.total || 0)
      });
    }

    const totalSales = Number(totalSalesAgg._sum.total || 0);
    const lastMonthSales = Number(lastMonthSalesAgg._sum.total || 0);

    // Calculate percentage changes
    const calcChange = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.json({
      status: true,
      stats: {
        totalSales,
        salesChange: calcChange(totalSales - lastMonthSales, lastMonthSales),
        totalOrders,
        ordersChange: calcChange(totalOrders - lastMonthOrders, lastMonthOrders),
        totalUsers,
        usersChange: calcChange(totalUsers - lastMonthUsers, lastMonthUsers),
        totalProducts,
        productsChange: 0, // Product count growth is usually less relevant but we can add if needed
        recentOrders,
        topProducts: topProductsRaw.map(p => ({ name: p.name, value: p._sum.quantity })),
        salesTrend
      }
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Sliders CRUD ───
router.get('/sliders', requireAdmin, async (req, res) => {
  const sliders = await prisma.slider.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ status: true, sliders });
});

router.post('/sliders', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, status, type, position, linkType, link, image: bodyImage } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : (bodyImage || '');
    const slider = await prisma.slider.create({ data: { name, image, status: status || 'active', type: type || 'web', position: position || 'main', linkType, link } });
    res.json({ status: true, message: 'Slider created', slider });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/sliders/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, status, type, position, linkType, link, image: bodyImage } = req.body;
    const data = { name, status, type, position, linkType, link };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    else if (bodyImage) data.image = bodyImage;
    const slider = await prisma.slider.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ status: true, message: 'Slider updated', slider });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/sliders/order/update', requireAdmin, async (req, res) => {
  try {
    const { order } = req.body;
    for (let i = 0; i < order.length; i++) {
      await prisma.slider.update({ where: { id: order[i] }, data: { sortOrder: i } });
    }
    res.json({ status: true, message: 'Order updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/sliders/:id', requireAdmin, async (req, res) => {
  await prisma.slider.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Slider deleted' });
});

// ─── Categories CRUD ───
router.get('/categories', requireAdmin, async (req, res) => {
  const categories = await prisma.category.findMany({ include: { parent: true }, orderBy: { createdAt: 'desc' } });
  res.json({ status: true, categories });
});

router.post('/categories', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, status, parentId, featured, image: bodyImage } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const image = req.file ? '/uploads/' + req.file.filename : (bodyImage || null);
    const category = await prisma.category.create({
      data: { name, slug, image, status: status || 'active', parentId: parentId ? parseInt(parentId) : null, featured: featured === 'true' }
    });
    res.json({ status: true, message: 'Category created', category });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/categories/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, status, parentId, featured, image: bodyImage } = req.body;
    const data = { name, status, parentId: parentId ? parseInt(parentId) : null, featured: featured === 'true' };
    if (name) data.slug = slugify(name, { lower: true, strict: true });
    if (req.file) data.image = '/uploads/' + req.file.filename;
    else if (bodyImage) data.image = bodyImage;
    const category = await prisma.category.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ status: true, message: 'Category updated', category });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Category deleted' });
});

// ─── Brands CRUD ───
router.get('/brands', requireAdmin, async (req, res) => {
  const brands = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ status: true, brands });
});

router.post('/brands', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, status, image: bodyImage } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const image = req.file ? '/uploads/' + req.file.filename : (bodyImage || null);
    const brand = await prisma.brand.create({ data: { name, slug, image, status: status || 'active' } });
    res.json({ status: true, message: 'Brand created', brand });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/brands/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, status, showHome, image: bodyImage } = req.body;
    const data = { name, status, showHome: showHome === 'true' };
    if (name) data.slug = slugify(name, { lower: true, strict: true });
    if (req.file) data.image = '/uploads/' + req.file.filename;
    else if (bodyImage) data.image = bodyImage;
    const brand = await prisma.brand.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ status: true, message: 'Brand updated', brand });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/brands/:id', requireAdmin, async (req, res) => {
  await prisma.brand.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Brand deleted' });
});

router.put('/brands/order/update', requireAdmin, async (req, res) => {
  try {
    const { order } = req.body;
    for (let i = 0; i < order.length; i++) {
      await prisma.brand.update({ where: { id: order[i] }, data: { sortOrder: i } });
    }
    res.json({ status: true, message: 'Brand order updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Products CRUD ───
router.get('/products', requireAdmin, async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true, images: true, variants: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ status: true, products });
});

router.post('/products', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, shortDescription, description, categoryId, brandId, taxId, price, salePrice,
      video, tags, stock, unit, status, featured, popular, deal, variants, benefits, features, image: bodyImage } = req.body;

    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
    const image = req.file ? '/uploads/' + req.file.filename : (bodyImage || null);

    const product = await prisma.product.create({
      data: {
        name, slug, shortDescription, description, image, video, tags,
        categoryId: categoryId ? parseInt(categoryId) : null,
        brandId: brandId ? parseInt(brandId) : null,
        taxId: taxId ? parseInt(taxId) : null,
        price: Math.max(0, parseFloat(price || 0)), salePrice: salePrice ? Math.max(0, parseFloat(salePrice)) : null,
        stock: Math.max(0, parseInt(stock || 0)), unit, status: status || 'active',
        featured: featured === 'true', popular: popular === 'true', deal: deal === 'true',
        ...(variants ? { variants: { create: JSON.parse(variants) } } : {}),
        ...(benefits ? { benefits: { create: JSON.parse(benefits) } } : {}),
        ...(features ? { features: { create: JSON.parse(features) } } : {})
      },
      include: { category: true, brand: true, variants: true, images: true }
    });
    res.json({ status: true, message: 'Product created', product });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, shortDescription, description, categoryId, brandId, taxId, price, salePrice,
      video, tags, stock, unit, status, featured, popular, deal, image: bodyImage } = req.body;

    const data = {
      name, shortDescription, description, video, tags,
      categoryId: categoryId ? parseInt(categoryId) : null,
      brandId: brandId ? parseInt(brandId) : null,
      taxId: taxId ? parseInt(taxId) : null,
      price: Math.max(0, parseFloat(price || 0)), salePrice: salePrice ? Math.max(0, parseFloat(salePrice)) : null,
      stock: Math.max(0, parseInt(stock || 0)), unit, status,
      featured: featured === 'true', popular: popular === 'true', deal: deal === 'true'
    };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    else if (bodyImage) data.image = bodyImage;

    const product = await prisma.product.update({ where: { id }, data, include: { category: true, brand: true } });
    res.json({ status: true, message: 'Product updated', product });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.patch('/products/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const { field } = req.body;
    if (!['featured', 'popular', 'deal'].includes(field)) return res.json({ status: false, message: 'Invalid field' });
    const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
    await prisma.product.update({ where: { id: product.id }, data: { [field]: !product[field] } });
    res.json({ status: true, message: `${field} toggled` });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Product deleted' });
});

// Product images - supports both file upload and Filemanager paths (JSON body)
router.post('/products/:id/images', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    let imageData = [];
    // Support file uploads
    if (req.files && req.files.length > 0) {
      imageData = req.files.map((f, i) => ({ productId, image: '/uploads/' + f.filename, sortOrder: i }));
    }
    // Support Filemanager paths sent as JSON array
    if (req.body.images && Array.isArray(req.body.images)) {
      const startIdx = imageData.length;
      const fmImages = req.body.images.map((imgPath, i) => ({ productId, image: imgPath, sortOrder: startIdx + i }));
      imageData = imageData.concat(fmImages);
    }
    if (imageData.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({ data: imageData });
    } else {
      // If empty array sent, clear all
      await prisma.productImage.deleteMany({ where: { productId } });
    }
    res.json({ status: true, message: 'Images uploaded' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Orders Management ───
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { status: orderStatus, paymentMethod, paymentStatus } = req.query;
    const where = {};
    if (orderStatus) where.orderStatus = orderStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const orders = await prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, phone: true, email: true } }, items: true, deliveryBoy: true, courierPartner: true }
    });
    res.json({ status: true, orders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true, items: { include: { product: { include: { brand: true, tax: true } } } }, deliveryBoy: true, courierPartner: true }
    });
    res.json({ status: true, order });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const current = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) }, select: { orderStatus: true } });
    if (!current) return res.json({ status: false, message: 'Order not found' });

    // Status flow validation
    const allowedTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'delivered'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
      returned: []
    };
    const allowed = allowedTransitions[current.orderStatus] || [];
    if (!allowed.includes(orderStatus)) {
      return res.json({ status: false, message: `Cannot change status from "${current.orderStatus}" to "${orderStatus}"` });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { orderStatus },
      include: { user: { select: { name: true, phone: true } }, items: true }
    });

    if (orderStatus === 'cancelled') {
        for (const item of order.items) {
           if (item.variant) {
               const variant = await prisma.productVariant.findFirst({ where: { name: item.variant, productId: item.productId } });
               if (variant) {
                   await prisma.productVariant.update({
                       where: { id: variant.id },
                       data: { stock: { increment: item.quantity } }
                   });
               }
           } else {
               await prisma.product.update({
                   where: { id: item.productId },
                   data: { stock: { increment: item.quantity } }
               });
           }
        }
    }

    // Status-specific SMS stubs
    const smsMessages = {
      confirmed: `✅ [SMS] Dear ${order.user.name}, your order ${order.orderNumber} has been confirmed! We are preparing it for dispatch.`,
      shipped: `🚚 [SMS] Dear ${order.user.name}, your order ${order.orderNumber} has been shipped! It's on its way to you.`,
      out_for_delivery: `🛵 [SMS] Dear ${order.user.name}, your order ${order.orderNumber} is out for delivery today!`,
      delivered: `📬 [SMS] Dear ${order.user.name}, your order ${order.orderNumber} has been delivered! Thank you for shopping with Yogi's Farm.`,
      cancelled: `❌ [SMS] Dear ${order.user.name}, your order ${order.orderNumber} has been cancelled. If you have any questions, please contact us.`
    };
    if (smsMessages[orderStatus]) {
      console.log(`\n${smsMessages[orderStatus]} | Phone: ${order.user.phone}\n`);
    }

    // COD handling
    if (orderStatus === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
      if (order.deliveryBoyId) {
        await prisma.deliveryBoy.update({
          where: { id: order.deliveryBoyId },
          data: { outstandingAmount: { increment: order.total } }
        });
      }
    }

    res.json({ status: true, message: 'Order status updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/orders/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { paymentStatus, paymentDescription } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { paymentStatus, paymentDescription },
      include: { user: { select: { name: true, phone: true } } }
    });
    // SMS stub — log payment update to console
    console.log(`\n💰 [SMS] Order ${order.orderNumber} payment status: "${paymentStatus}" for ${order.user.name} (${order.user.phone})\n`);
    res.json({ status: true, message: 'Payment updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Delivery Option Assignment ───
router.put('/orders/:id/delivery-option', requireAdmin, async (req, res) => {
  try {
    const { deliveryType, deliveryBoyId, courierPartnerId, trackingId } = req.body;
    const data = { deliveryType };
    if (deliveryType === 'delivery_boy') {
      data.deliveryBoyId = parseInt(deliveryBoyId);
      data.courierPartnerId = null;
      data.trackingId = null;
    } else if (deliveryType === 'courier') {
      data.courierPartnerId = parseInt(courierPartnerId);
      data.trackingId = trackingId || null;
      data.deliveryBoyId = null;
    }

    // Auto-set status to shipped when delivery is assigned (only if currently confirmed)
    const current = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) }, select: { orderStatus: true, orderNumber: true }, });
    if (current && (current.orderStatus === 'confirmed' || current.orderStatus === 'placed')) {
      data.orderStatus = 'shipped';
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) }, data,
      include: { user: { select: { name: true, phone: true } } }
    });

    if (data.orderStatus === 'shipped') {
      console.log(`\n🚚 [SMS] Dear ${order.user.name}, your order ${order.orderNumber} has been shipped! It's on its way to you. | Phone: ${order.user.phone}\n`);
    }

    res.json({ status: true, message: 'Delivery option updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Delivery Boys CRUD ───
router.get('/delivery-boys', requireAdmin, async (req, res) => {
  const boys = await prisma.deliveryBoy.findMany({ 
    where: { status: 'active' }, 
    orderBy: { createdAt: 'desc' },
    include: { collections: { orderBy: { createdAt: 'desc' }, take: 5 } }
  });
  // Strip pins before sending
  const safeBoys = boys.map(b => {
    const { pin, ...safe } = b;
    return safe;
  });
  res.json({ status: true, deliveryBoys: safeBoys });
});

router.post('/delivery-boys', requireAdmin, async (req, res) => {
  try {
    const { name, phone, pin, city, pincode } = req.body;
    let hashedPin = null;
    if (pin) hashedPin = await bcrypt.hash(pin, 10);
    const boy = await prisma.deliveryBoy.create({ data: { name, phone, pin: hashedPin, city, pincode } });
    const { pin: _, ...safeBoy } = boy;
    res.json({ status: true, message: 'Delivery boy created', deliveryBoy: safeBoy });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/delivery-boys/:id', requireAdmin, async (req, res) => {
  try {
    const { name, phone, pin, city, pincode, status } = req.body;
    const data = { name, phone, city, pincode, status };
    if (pin) data.pin = await bcrypt.hash(pin, 10);
    const boy = await prisma.deliveryBoy.update({ where: { id: parseInt(req.params.id) }, data });
    const { pin: _, ...safeBoy } = boy;
    res.json({ status: true, message: 'Delivery boy updated', deliveryBoy: safeBoy });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/delivery-boys/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.deliveryBoy.update({ where: { id: parseInt(req.params.id) }, data: { status: 'inactive' } });
    res.json({ status: true, message: 'Delivery boy removed' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Delivery Collections ───
router.post('/delivery-boys/:id/collect', requireAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const collectAmount = parseFloat(amount);
    if (!collectAmount || collectAmount <= 0) {
      return res.json({ status: false, message: 'Invalid collection amount' });
    }

    const deliveryBoy = await prisma.deliveryBoy.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!deliveryBoy) return res.json({ status: false, message: 'Delivery boy not found' });
    
    if (collectAmount > deliveryBoy.outstandingAmount) {
      return res.json({ status: false, message: `Amount exceeds outstanding balance (₹${deliveryBoy.outstandingAmount})` });
    }

    await prisma.$transaction([
      prisma.deliveryCollection.create({
        data: {
          deliveryBoyId: deliveryBoy.id,
          amount: collectAmount,
          adminId: req.session.adminId
        }
      }),
      prisma.deliveryBoy.update({
        where: { id: deliveryBoy.id },
        data: { outstandingAmount: { decrement: collectAmount } }
      })
    ]);

    const updated = await prisma.deliveryBoy.findUnique({ where: { id: deliveryBoy.id } });
    res.json({ status: true, message: 'Cash collected successfully', outstandingAmount: updated.outstandingAmount });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Courier Partners CRUD ───
router.get('/courier-partners', requireAdmin, async (req, res) => {
  const partners = await prisma.courierPartner.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } });
  res.json({ status: true, courierPartners: partners });
});

router.post('/courier-partners', requireAdmin, async (req, res) => {
  try {
    const { name, trackingLink } = req.body;
    const partner = await prisma.courierPartner.create({ data: { name, trackingLink } });
    res.json({ status: true, message: 'Courier partner created', courierPartner: partner });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/courier-partners/:id', requireAdmin, async (req, res) => {
  try {
    const { name, trackingLink, status } = req.body;
    const partner = await prisma.courierPartner.update({ where: { id: parseInt(req.params.id) }, data: { name, trackingLink, status } });
    res.json({ status: true, message: 'Courier partner updated', courierPartner: partner });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/courier-partners/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.courierPartner.update({ where: { id: parseInt(req.params.id) }, data: { status: 'inactive' } });
    res.json({ status: true, message: 'Courier partner removed' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Sections CRUD ───
router.get('/sections', requireAdmin, async (req, res) => {
  const sections = await prisma.section.findMany({ include: { category: true }, orderBy: { sortOrder: 'asc' } });
  res.json({ status: true, sections });
});

router.post('/sections', requireAdmin, async (req, res) => {
  try {
    const { name, status, categoryId } = req.body;
    const section = await prisma.section.create({
      data: { name, status: status || 'active', categoryId: categoryId ? parseInt(categoryId) : null }
    });
    res.json({ status: true, message: 'Section created', section });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/sections/:id', requireAdmin, async (req, res) => {
  try {
    const { name, status, categoryId } = req.body;
    const section = await prisma.section.update({
      where: { id: parseInt(req.params.id) },
      data: { name, status, categoryId: categoryId ? parseInt(categoryId) : null }
    });
    res.json({ status: true, message: 'Section updated', section });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/sections/:id', requireAdmin, async (req, res) => {
  await prisma.section.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Section deleted' });
});

router.put('/sections/order/update', requireAdmin, async (req, res) => {
  try {
    const { order } = req.body;
    for (let i = 0; i < order.length; i++) {
      await prisma.section.update({ where: { id: order[i] }, data: { sortOrder: i } });
    }
    res.json({ status: true, message: 'Section order updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Tax CRUD ───
router.get('/taxes', requireAdmin, async (req, res) => {
  const taxes = await prisma.tax.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ status: true, taxes });
});

router.post('/taxes', requireAdmin, async (req, res) => {
  try {
    const { name, tax: taxRate, status } = req.body;
    const tax = await prisma.tax.create({ data: { name, tax: parseFloat(taxRate), status: status || 'active' } });
    res.json({ status: true, message: 'Tax created', tax });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/taxes/:id', requireAdmin, async (req, res) => {
  try {
    const { name, tax: taxRate, status } = req.body;
    const tax = await prisma.tax.update({
      where: { id: parseInt(req.params.id) },
      data: { name, tax: parseFloat(taxRate), status }
    });
    res.json({ status: true, message: 'Tax updated', tax });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/taxes/:id', requireAdmin, async (req, res) => {
  await prisma.tax.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Tax deleted' });
});

// ─── Shipping CRUD ───
router.get('/shipping', requireAdmin, async (req, res) => {
  const shipping = await prisma.shipping.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ status: true, shipping });
});

router.post('/shipping', requireAdmin, async (req, res) => {
  try {
    const { name, charge, minCartValue, status } = req.body;
    const shipping = await prisma.shipping.create({
      data: { name, charge: parseFloat(charge), minCartValue: parseFloat(minCartValue), status: status || 'active' }
    });
    res.json({ status: true, message: 'Shipping rule created', shipping });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/shipping/:id', requireAdmin, async (req, res) => {
  try {
    const { name, charge, minCartValue, status } = req.body;
    const shipping = await prisma.shipping.update({
      where: { id: parseInt(req.params.id) },
      data: { name, charge: parseFloat(charge), minCartValue: parseFloat(minCartValue), status }
    });
    res.json({ status: true, message: 'Shipping rule updated', shipping });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/shipping/:id', requireAdmin, async (req, res) => {
  await prisma.shipping.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Shipping rule deleted' });
});

// ─── Reviews CRUD ───
router.get('/reviews', requireAdmin, async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true, phone: true } }, product: { select: { name: true, id: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ status: true, reviews });
});

router.put('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const review = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: { status, comment }
    });
    res.json({ status: true, message: 'Review updated', review });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ status: true, message: 'Review deleted' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Contact Submissions ───
router.get('/contacts', requireAdmin, async (req, res) => {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ status: true, contacts });
});

router.delete('/contacts/:id', requireAdmin, async (req, res) => {
  await prisma.contact.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Contact deleted' });
});

// ─── Coupons CRUD ───
router.get('/coupons', requireAdmin, async (req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ status: true, coupons });
});

router.post('/coupons', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, code, status, amountType, amount, minOrderAmount, description, expireOn } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;
    const coupon = await prisma.coupon.create({
      data: { name, code, image, status: status || 'active', amountType: amountType || 'percent',
        amount: parseFloat(amount), minOrderAmount: parseFloat(minOrderAmount || 0),
        description, expireOn: expireOn ? new Date(expireOn) : null }
    });
    res.json({ status: true, message: 'Coupon created', coupon });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/coupons/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, code, status, amountType, amount, minOrderAmount, description, expireOn } = req.body;
    const data = { name, code, status, amountType, amount: parseFloat(amount),
      minOrderAmount: parseFloat(minOrderAmount || 0), description, expireOn: expireOn ? new Date(expireOn) : null };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    const coupon = await prisma.coupon.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ status: true, message: 'Coupon updated', coupon });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/coupons/:id', requireAdmin, async (req, res) => {
  await prisma.coupon.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Coupon deleted' });
});

// ─── Settings ───
router.get('/settings', requireAdmin, async (req, res) => {
  const settings = await prisma.setting.findMany();
  res.json({ status: true, settings });
});

router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    }
    res.json({ status: true, message: 'Settings updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Sections CRUD ───
router.get('/sections', requireAdmin, async (req, res) => {
  const sections = await prisma.section.findMany({ include: { category: true }, orderBy: { sortOrder: 'asc' } });
  res.json({ status: true, sections });
});

router.post('/sections', requireAdmin, async (req, res) => {
  try {
    const { name, categoryId, status } = req.body;
    const section = await prisma.section.create({
      data: { name, status: status || 'active', categoryId: categoryId ? parseInt(categoryId) : null }
    });
    res.json({ status: true, message: 'Section created', section });
  } catch (e) { res.json({ status: false, message: e.message }); }
});

router.put('/sections/:id', requireAdmin, async (req, res) => {
  try {
    const { name, categoryId, status } = req.body;
    const section = await prisma.section.update({
      where: { id: parseInt(req.params.id) },
      data: { name, status, categoryId: categoryId ? parseInt(categoryId) : null }
    });
    res.json({ status: true, message: 'Section updated', section });
  } catch (e) { res.json({ status: false, message: e.message }); }
});

router.delete('/sections/:id', requireAdmin, async (req, res) => {
  await prisma.section.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ status: true, message: 'Section deleted' });
});

// ─── File Manager ───
router.get('/files', requireAdmin, async (req, res) => {
  try {
    const dir = path.join(__dirname, '..', '..', 'uploads');
    const subdir = req.query.path || '';
    const fullPath = path.join(dir, subdir);
    if (!fs.existsSync(fullPath)) return res.json({ status: true, files: [], folders: [], currentPath: subdir });

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory()).map(e => e.name);
    const files = entries.filter(e => e.isFile()).map(e => ({
      name: e.name,
      path: '/uploads/' + (subdir ? subdir + '/' : '') + e.name,
      size: fs.statSync(path.join(fullPath, e.name)).size
    }));
    res.json({ status: true, files, folders, currentPath: subdir });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/files/upload', requireAdmin, upload.array('files', 20), async (req, res) => {
  try {
    const subdir = req.body.uploadPath || '';
    const files = req.files.map(f => ({
      name: f.filename,
      path: '/uploads/' + (subdir ? subdir + '/' : '') + f.filename
    }));
    res.json({ status: true, message: 'Files uploaded', files });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/files/folder', requireAdmin, async (req, res) => {
  try {
    const { name, parentPath } = req.body;
    const dir = path.join(__dirname, '..', '..', 'uploads', parentPath || '', name);
    fs.mkdirSync(dir, { recursive: true });
    res.json({ status: true, message: 'Folder created' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/files/folder', requireAdmin, async (req, res) => {
  try {
    const { folderPath } = req.body;
    const fullPath = path.join(__dirname, '..', '..', 'uploads', folderPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
    res.json({ status: true, message: 'Folder deleted' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/files', requireAdmin, async (req, res) => {
  try {
    const { filePath } = req.body;
    const fullPath = path.join(__dirname, '..', '..', filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    res.json({ status: true, message: 'File deleted' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Settings ───
router.get('/settings', requireAdmin, async (req, res) => {
  const settings = await prisma.setting.findMany();
  const obj = {};
  settings.forEach(s => { obj[s.key] = s.value; });
  res.json({ status: true, settings: obj });
});

router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body; // { key: value, key: value }
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    res.json({ status: true, message: 'Settings saved' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
