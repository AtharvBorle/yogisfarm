const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendOrderConfirmSMS } = require('../utils/sms');
const { calculateOrderTotals } = require('../utils/pricing');

// Generate order number matching reference format: YF260430A0001AZ
const generateOrderNumber = async () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `YF${yy}${mm}${dd}`;

  // Find last order for today
  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' }
  });

  let nextSeq = 1;
  let nextSeries = 'A';

  if (lastOrder) {
    const oNum = lastOrder.orderNumber;
    const len = oNum.length;
    // Validate it's the new pattern (length >= 15 and no hyphens)
    if (len >= 15 && !oNum.includes('-')) {
      const lastSeq = parseInt(oNum.substring(len - 6, len - 2), 10);
      const lastSeries = oNum.substring(8, len - 6);

      nextSeq = lastSeq + 1;
      nextSeries = lastSeries;

      if (nextSeq > 9999) {
        nextSeq = 1;
        // Increment series string (A -> B, Z -> AA)
        let carry = 1;
        let res = '';
        for (let i = lastSeries.length - 1; i >= 0; i--) {
          let val = lastSeries.charCodeAt(i) - 65 + carry;
          res = String.fromCharCode((val % 26) + 65) + res;
          carry = Math.floor(val / 26);
        }
        if (carry > 0) res = 'A' + res;
        nextSeries = res;
      }
    }
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomChars = chars.charAt(Math.floor(Math.random() * 26)) + chars.charAt(Math.floor(Math.random() * 26));

  return `${prefix}${nextSeries}${String(nextSeq).padStart(4, '0')}${randomChars}`;
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

    // === USE CENTRALIZED PRICING ENGINE ===
    const pricing = await calculateOrderTotals(userId, 'userId', couponCode || null);
    
    // === STRICT INVOICE VALIDATION ASSERTIONS (Point 8) ===
    let sumOfItemTotals = 0;
    for (const item of pricing.orderItems) {
      sumOfItemTotals += item.total;
      const taxRebuild = Math.round((item.taxableValue + item.cgst + item.sgst) * 100) / 100;
      if (Math.abs(taxRebuild - Math.round(item.total * 100) / 100) > 0.02) {
        throw new Error(`Invoice Validation Failed: Line item tax mismatch for ${item.name}`);
      }
    }
    
    const shippingTaxRebuild = Math.round((pricing.shippingTaxable + pricing.shippingGST) * 100) / 100;
    if (Math.abs(shippingTaxRebuild - Math.round(pricing.shippingTotal * 100) / 100) > 0.02) {
      throw new Error('Invoice Validation Failed: Shipping tax mismatch');
    }

    const calculatedGrandTotal = sumOfItemTotals + pricing.shippingTotal;
    if (Math.abs(calculatedGrandTotal - pricing.grandTotal) > 0.02) {
      throw new Error('Invoice Validation Failed: Grand total mismatch');
    }

    // ─── ONLINE PAYMENT: Only create Razorpay order, store data in session ───
    if (paymentMethod.toLowerCase() === 'online') {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(pricing.total * 100),
        currency: 'INR',
        receipt: `pending_${userId}_${Date.now()}`,
      });

      // Store all order details in session so we can create the DB order after payment
      req.session.pendingOrder = {
        addressId: address.id,
        addressName: address.name, addressPhone: address.phone,
        addressText: address.address, addressCity: address.city,
        addressState: address.state, addressPincode: address.pincode,
        addressType: address.addressType || 'Home',
        subtotal: pricing.subtotal, shipping: pricing.shipping,
        discount: pricing.discountAmount, tax: pricing.totalTax,
        shippingTotal: pricing.shippingTotal, shippingTaxable: pricing.shippingTaxable, shippingGST: pricing.shippingGST,
        grandTotal: pricing.grandTotal,
        taxName: 'GST', taxRate: null,
        total: pricing.total, couponCode: couponCode || null,
        orderNote: orderNote || null,
        appliedCouponId: pricing.appliedCouponId,
        orderItems: pricing.orderItems,
        cartItemIds: pricing.cartItemIds
      };

      return res.json({
        status: true,
        message: 'Payment gateway ready',
        razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID
      });
    }

    // ─── COD: Create order immediately ───
    const orderNumber = await generateOrderNumber();

    // Update coupon usage
    if (pricing.appliedCouponId) {
      await prisma.coupon.update({ where: { id: pricing.appliedCouponId }, data: { usedCount: { increment: 1 } } });
    }

    const order = await prisma.order.create({
      data: {
        userId, orderNumber,
        addressId: address.id,
        addressName: address.name, addressPhone: address.phone,
        addressText: address.address, addressCity: address.city,
        addressState: address.state, addressPincode: address.pincode,
        addressType: address.addressType || 'Home',
        subtotal: pricing.subtotal, shipping: pricing.shipping,
        discount: pricing.discountAmount, tax: pricing.totalTax,
        shippingTotal: pricing.shippingTotal, shippingTaxable: pricing.shippingTaxable, shippingGST: pricing.shippingGST,
        grandTotal: pricing.grandTotal,
        taxName: 'GST', taxRate: null,
        total: pricing.total, couponCode: couponCode || null, orderNote: orderNote || null,
        paymentMethod: 'cod',
        orderStatus: 'placed',
        paymentStatus: 'pending',
        items: { create: pricing.orderItems }
      },
      include: { items: true, user: { select: { name: true, phone: true, email: true } } }
    });

    // Deduct stock for COD
    for (const ci of pricing.cartItemIds) {
      if (ci.variantId) {
        await prisma.productVariant.update({
          where: { id: ci.variantId },
          data: { stock: { decrement: ci.quantity } }
        });
      } else {
        await prisma.product.update({
          where: { id: ci.productId },
          data: { stock: { decrement: ci.quantity } }
        });
      }
    }

    // Clear cart
    await prisma.cart.deleteMany({ where: { userId } });

    // Send Order Confirmed SMS
    sendOrderConfirmSMS(order.user.phone, orderNumber);

    res.json({ status: true, message: 'Order placed successfully', order, orderNumber: order.orderNumber });
  } catch (e) {
    console.error('Order placement error:', e);
    res.json({ status: false, message: e.message });
  }
});

// Verify Razorpay Payment — creates the actual DB order only after payment success
router.post('/verify-payment', requireLogin, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.session.userId;
    const pendingOrder = req.session.pendingOrder;

    if (!pendingOrder) {
      return res.json({ status: false, message: 'No pending order found. Please try again.' });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.json({ status: false, message: 'Invalid payment signature' });
    }

    // Payment verified — now create the real order
    const orderNumber = await generateOrderNumber();

    // Update coupon usage
    if (pendingOrder.appliedCouponId) {
      await prisma.coupon.update({ where: { id: pendingOrder.appliedCouponId }, data: { usedCount: { increment: 1 } } });
    }

    const order = await prisma.order.create({
      data: {
        userId, orderNumber,
        addressId: pendingOrder.addressId,
        addressName: pendingOrder.addressName, addressPhone: pendingOrder.addressPhone,
        addressText: pendingOrder.addressText, addressCity: pendingOrder.addressCity,
        addressState: pendingOrder.addressState, addressPincode: pendingOrder.addressPincode,
        addressType: pendingOrder.addressType,
        subtotal: pendingOrder.subtotal, shipping: pendingOrder.shipping,
        discount: pendingOrder.discount, tax: pendingOrder.tax,
        shippingTotal: pendingOrder.shippingTotal, shippingTaxable: pendingOrder.shippingTaxable, shippingGST: pendingOrder.shippingGST,
        grandTotal: pendingOrder.grandTotal,
        taxName: pendingOrder.taxName, taxRate: pendingOrder.taxRate,
        total: pendingOrder.total,
        couponCode: pendingOrder.couponCode, orderNote: pendingOrder.orderNote,
        paymentMethod: 'online',
        orderStatus: 'placed',
        paymentStatus: 'completed',
        paymentDescription: razorpay_payment_id,
        items: { create: pendingOrder.orderItems }
      },
      include: { items: true, user: { select: { name: true, phone: true, email: true } } }
    });

    // Deduct stock
    for (const ci of pendingOrder.cartItemIds) {
      if (ci.variantId) {
        await prisma.productVariant.update({
          where: { id: ci.variantId },
          data: { stock: { decrement: ci.quantity } }
        });
      } else {
        await prisma.product.update({
          where: { id: ci.productId },
          data: { stock: { decrement: ci.quantity } }
        });
      }
    }

    // Clear cart
    await prisma.cart.deleteMany({ where: { userId } });

    // Clear pending order from session
    delete req.session.pendingOrder;

    // Send Order Confirmed SMS
    sendOrderConfirmSMS(order.user.phone, orderNumber);

    res.json({ status: true, message: 'Payment verified and order placed successfully', orderNumber });
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
    let orderNumber = req.params.orderNumber.toUpperCase();
    if (orderNumber.startsWith('YF-0')) orderNumber = 'YF-O' + orderNumber.substring(4);

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: { select: { slug: true, image: true, name: true, id: true, tax: true, categoryId: true, featured: true, status: true, hoverImage: true, brand: true, images: true } } } },
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

// Public invoice endpoint (no login required - for SMS links)
router.get('/invoice/:orderNumber', async (req, res) => {
  try {
    let orderNumber = req.params.orderNumber.toUpperCase();
    if (orderNumber.startsWith('YF-0')) orderNumber = 'YF-O' + orderNumber.substring(4);

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: { select: { slug: true, image: true, name: true } } } },
        user: { select: { name: true, phone: true, email: true } }
      }
    });
    if (!order) return res.json({ status: false, message: 'Order not found' });
    
    let coupon = null;
    if (order.couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: order.couponCode } });
    }
    
    res.json({ status: true, order, coupon });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Track order (public)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    let orderNumber = req.params.orderNumber.toUpperCase();
    if (orderNumber.startsWith('YF-0')) orderNumber = 'YF-O' + orderNumber.substring(4);

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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
