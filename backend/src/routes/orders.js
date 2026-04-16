const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

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
      where: { userId }, include: { product: { include: { brand: true } }, variant: true }
    });
    if (!cartItems.length) return res.json({ status: false, message: 'Cart is empty' });

    // Fetch global tax rate from admin Tax section
    const globalTax = await prisma.tax.findFirst({ where: { status: 'active' } });
    const globalTaxRate = globalTax ? parseFloat(globalTax.tax) : 0;

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
      const gst = (itemTotal * globalTaxRate) / 100;
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

    // Fetch dynamic shipping from admin settings
    const shippingRule = await prisma.shipping.findFirst({ where: { status: 'active' }, orderBy: { minCartValue: 'asc' } });
    let shipping = 0;
    if (shippingRule) {
      shipping = subtotal >= parseFloat(shippingRule.minCartValue) ? 0 : parseFloat(shippingRule.charge);
    }
    const total = subtotal - discountAmount + shipping + totalTax;
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

    // Deduct stock
    for (const item of cartItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // Clear cart (moved here because the order implies they checked out)
    if (paymentMethod.toLowerCase() === 'cod') {
       await prisma.cart.deleteMany({ where: { userId } });
    }

    if (paymentMethod.toLowerCase() === 'online') {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(total * 100), // amount in paise
        currency: 'INR',
        receipt: orderNumber,
      };

      const razorpayOrder = await razorpay.orders.create(options);
      
      return res.json({
        status: true,
        message: 'Order created, pending payment',
        orderNumber,
        razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID
      });
    }

    // Clear cart (COD only path)
    await prisma.cart.deleteMany({ where: { userId } });

    // SMS stub — log order confirmation to console
    console.log(`\n📦 [SMS] COD Order ${orderNumber} placed by ${order.user.name} (${order.user.phone}). Total: ₹${total}\n`);

    res.json({ status: true, message: 'Order placed successfully', order, orderNumber: order.orderNumber });
  } catch (e) {
    console.error('Order placement error:', e);
    res.json({ status: false, message: e.message });
  }
});

// Verify Razorpay Payment Route
router.post('/verify-payment', requireLogin, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await prisma.order.update({
        where: { orderNumber },
        data: { paymentStatus: 'completed', paymentDescription: razorpay_payment_id },
        include: { user: { select: { name: true, phone: true } } }
      });
      // Clear cart now
      await prisma.cart.deleteMany({ where: { userId: req.session.userId } });
      
      console.log(`\n📦 [SMS] Online Order ${orderNumber} verified and placed by ${order.user.name} (${order.user.phone}). Total: ₹${order.total}\n`);

      res.json({ status: true, message: 'Payment verified successfully' });
    } else {
      res.json({ status: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.json({ status: false, message: 'Verification process failed' });
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
        items: { include: { product: { select: { slug: true, image: true, name: true, price: true, salePrice: true, id: true, tax: true, categoryId: true, featured: true, status: true, hoverImage: true, brand: true, images: true } } } },
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
