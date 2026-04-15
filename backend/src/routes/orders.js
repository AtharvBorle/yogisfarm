const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');

// Generate order number matching reference format: YF-O26-27-0005
const generateOrderNumber = async () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `YF-O${yy}-${mm}`;

  // Find last order with this prefix
  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' }
  });

  let seq = 1;
  if (lastOrder) {
    const parts = lastOrder.orderNumber.split('-');
    seq = parseInt(parts[parts.length - 1]) + 1;
  }
  return `${prefix}-${String(seq).padStart(4, '0')}`;
};

// Place order
router.post('/place', requireLogin, async (req, res) => {
  try {
    const { addressId, paymentMethod = 'cod', couponCode, orderNote, agreeTerms } = req.body;
    const userId = req.session.userId;

    if (!agreeTerms) {
      return res.json({ status: false, message: 'You must agree to Terms & Conditions' });
    }

    const address = await prisma.address.findFirst({ where: { id: parseInt(addressId), userId } });
    if (!address) return res.json({ status: false, message: 'Address not found' });

    const cartItems = await prisma.cart.findMany({
      where: { userId }, include: { product: { include: { tax: true, brand: true } }, variant: true }
    });
    if (!cartItems.length) return res.json({ status: false, message: 'Cart is empty' });

    let subtotal = 0;
    let totalTax = 0;
    const orderItems = cartItems.map(item => {
      const price = item.variant
        ? parseFloat(item.variant.salePrice || item.variant.price)
        : parseFloat(item.product.salePrice || item.product.price);
      const originalPrice = item.variant
        ? parseFloat(item.variant.price)
        : parseFloat(item.product.price);
      const itemTotal = price * item.quantity;
      const taxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;
      const gst = (itemTotal * taxRate) / 100;
      const discount = (originalPrice - price) * item.quantity;
      subtotal += itemTotal;
      totalTax += gst;
      return {
        productId: item.productId,
        name: item.product.name,
        variant: item.variant?.name || null,
        brand: item.product.brand?.name || null,
        price: originalPrice,
        discount,
        gst,
        quantity: item.quantity,
        total: itemTotal
      };
    });

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.status === 'active') {
        if (subtotal >= parseFloat(coupon.minOrderAmount)) {
          discountAmount = coupon.amountType === 'percent'
            ? (subtotal * parseFloat(coupon.amount)) / 100
            : parseFloat(coupon.amount);
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
          await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: coupon.usedCount + 1 } });
        }
      }
    }

    const shipping = subtotal >= 500 ? 0 : 50;
    const total = subtotal - discountAmount + shipping;
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        userId, orderNumber,
        addressId: address.id,
        addressName: address.name, addressPhone: address.phone,
        addressText: address.address, addressCity: address.city,
        addressState: address.state, addressPincode: address.pincode,
        addressType: address.addressType || 'Home',
        subtotal, shipping, discount: discountAmount, tax: totalTax, total,
        couponCode: couponCode || null, orderNote: orderNote || null,
        paymentMethod: paymentMethod.toLowerCase(),
        orderStatus: 'placed',
        paymentStatus: 'pending',
        items: { create: orderItems }
      },
      include: { items: true, user: { select: { name: true, phone: true, email: true } } }
    });

    // Clear cart
    await prisma.cart.deleteMany({ where: { userId } });

    // SMS stub — log order confirmation to console
    console.log(`\n📦 [SMS] Order ${orderNumber} placed by ${order.user.name} (${order.user.phone}). Total: ₹${total}\n`);

    res.json({ status: true, message: 'Order placed successfully', order, orderNumber: order.orderNumber });
  } catch (e) {
    console.error('Order placement error:', e);
    res.json({ status: false, message: e.message });
  }
});

// Get user orders
router.get('/', requireLogin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.session.userId },
      include: { items: { include: { product: { select: { slug: true, image: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: true, orders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Get single order detail (for user)
router.get('/detail/:orderNumber', requireLogin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        items: { include: { product: { include: { brand: true, images: true } } } },
        user: { select: { name: true, phone: true, email: true } },
        deliveryBoy: true
      }
    });
    if (!order) return res.json({ status: false, message: 'Order not found' });
    if (order.userId !== req.session.userId) return res.json({ status: false, message: 'Unauthorized' });
    res.json({ status: true, order });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Track order (public)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true }
    });
    if (!order) return res.json({ status: false, message: 'Order not found' });
    res.json({ status: true, order });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Submit review for a product from order
router.post('/review', requireLogin, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.session.userId;

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({ where: { userId, productId: parseInt(productId) } });
    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating), comment }
      });
      return res.json({ status: true, message: 'Review updated' });
    }

    await prisma.review.create({
      data: { userId, productId: parseInt(productId), rating: parseInt(rating), comment }
    });
    res.json({ status: true, message: 'Review submitted' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
