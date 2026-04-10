const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');

// Place order
router.post('/place', requireLogin, async (req, res) => {
  try {
    const { addressId, paymentMethod = 'cod', couponCode, orderNote } = req.body;
    const userId = req.session.userId;

    const address = await prisma.address.findFirst({ where: { id: parseInt(addressId), userId } });
    if (!address) return res.json({ status: false, message: 'Address not found' });

    const cartItems = await prisma.cart.findMany({
      where: { userId }, include: { product: { include: { tax: true, brand: true } }, variant: true }
    });
    if (!cartItems.length) return res.json({ status: false, message: 'Cart is empty' });

    let subtotal = 0;
    const orderItems = cartItems.map(item => {
      const price = item.variant
        ? parseFloat(item.variant.salePrice || item.variant.price)
        : parseFloat(item.product.salePrice || item.product.price);
      const itemTotal = price * item.quantity;
      const taxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;
      const gst = (itemTotal * taxRate) / 100;
      const discount = item.product.salePrice
        ? (parseFloat(item.product.price) - parseFloat(item.product.salePrice)) * item.quantity
        : 0;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        name: item.product.name,
        variant: item.variant?.name || null,
        brand: item.product.brand?.name || null,
        price: parseFloat(item.product.price),
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

    const now = new Date();
    const orderNumber = `YF-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const order = await prisma.order.create({
      data: {
        userId, orderNumber,
        addressId: address.id,
        addressName: address.name, addressPhone: address.phone,
        addressText: address.address, addressCity: address.city,
        addressState: address.state, addressPincode: address.pincode,
        subtotal, shipping, discount: discountAmount, total,
        couponCode: couponCode || null, orderNote: orderNote || null,
        paymentMethod, orderStatus: 'confirmed', paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        items: { create: orderItems }
      },
      include: { items: true }
    });

    // Clear cart
    await prisma.cart.deleteMany({ where: { userId } });

    res.json({ status: true, message: 'Order placed successfully', order });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Get user orders
router.get('/', requireLogin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.session.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: true, orders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Track order
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

module.exports = router;
