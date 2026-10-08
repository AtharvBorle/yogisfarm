const router = require('express').Router();
const prisma = require('../db');
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
    const { addressId, paymentMethod = 'cod', couponCode, orderNote, agreeTerms, useYogisPoints = false } = req.body;
    const userId = req.session.userId;

    const finalAgreeTerms = agreeTerms !== undefined ? agreeTerms : true;
    if (!finalAgreeTerms) {
      return res.json({ status: false, message: 'You must agree to Terms & Conditions' });
    }

    const address = await prisma.address.findFirst({ where: { id: parseInt(addressId), userId } });
    if (!address) return res.json({ status: false, message: 'Address not found' });

    // === USE CENTRALIZED PRICING ENGINE ===
    const pricing = await calculateOrderTotals(userId, 'userId', couponCode || null, Boolean(useYogisPoints));
    
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

    const { redeemPointsAtomic } = require('../utils/yogisPoints');

    // ─── ONLINE PAYMENT: Create pending order in DB immediately and return Razorpay details ───
    if (paymentMethod.toLowerCase() === 'online') {
      const orderNumber = await generateOrderNumber();

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(pricing.total * 100),
        currency: 'INR',
        receipt: orderNumber,
      });

      // Create the pending order record in the database immediately
      const order = await prisma.order.create({
        data: {
          userId, orderNumber,
          addressId: address.id,
          addressName: address.name, addressPhone: address.phone,
          addressText: address.address, addressCity: address.city,
          addressState: address.state, addressPincode: address.pincode,
          addressType: address.addressType || 'Home',
          subtotal: pricing.subtotal, shipping: pricing.shipping,
          discount: pricing.discountAmount + (pricing.yogisPointsDiscount || 0),
          discountType: pricing.discountType,
          yogisPointsUsed: pricing.yogisPointsUsed || 0,
          yogisPointsDiscount: pricing.yogisPointsDiscount || 0,
          tax: pricing.totalTax,
          shippingTotal: pricing.shippingTotal, shippingTaxable: pricing.shippingTaxable, shippingGST: pricing.shippingGST,
          grandTotal: pricing.grandTotal,
          taxName: 'GST', taxRate: null,
          total: pricing.total, couponCode: (pricing.coupon ? pricing.coupon.code : null), orderNote: orderNote || null,
          paymentMethod: 'online',
          orderStatus: 'pending',
          paymentStatus: 'pending',
          paymentDescription: JSON.stringify({
            razorpay_order_id: razorpayOrder.id,
            cartItemIds: pricing.cartItemIds,
            appliedCouponId: pricing.appliedCouponId
          }),
          items: {
            create: pricing.orderItems.map(item => ({
              name: item.name,
              variant: item.variant,
              brand: item.brand,
              quantity: item.quantity,
              price: item.price,
              mrp: item.mrp,
              productDiscount: item.productDiscount,
              orderDiscount: item.orderDiscount,
              taxableValue: item.taxableValue,
              taxRate: item.gstRate,
              gstAmount: item.gstAmount,
              cgst: item.cgst,
              sgst: item.sgst,
              gst: item.gstAmount,
              hsnCode: item.hsnCode,
              total: item.total,
              ...(item.productId ? { product: { connect: { id: item.productId } } } : {})
            }))
          }
        }
      });

      // Atomically hold/redeem points for online order
      if (pricing.yogisPointsUsed > 0) {
        await prisma.$transaction(async (tx) => {
          await redeemPointsAtomic(userId, order.id, pricing.yogisPointsUsed, pricing.yogisPointsDiscount, tx);
        });
      }

      return res.json({
        status: true,
        message: 'Payment gateway ready',
        razorpayOrder,
        orderNumber,
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
        discount: pricing.discountAmount + (pricing.yogisPointsDiscount || 0),
        discountType: pricing.discountType,
        yogisPointsUsed: pricing.yogisPointsUsed || 0,
        yogisPointsDiscount: pricing.yogisPointsDiscount || 0,
        tax: pricing.totalTax,
        shippingTotal: pricing.shippingTotal, shippingTaxable: pricing.shippingTaxable, shippingGST: pricing.shippingGST,
        grandTotal: pricing.grandTotal,
        taxName: 'GST', taxRate: null,
        total: pricing.total, couponCode: (pricing.coupon ? pricing.coupon.code : null), orderNote: orderNote || null,
        paymentMethod: 'cod',
        orderStatus: 'placed',
        paymentStatus: 'pending',
        items: { 
          create: pricing.orderItems.map(item => ({
            name: item.name,
            variant: item.variant,
            brand: item.brand,
            quantity: item.quantity,
            price: item.price,
            mrp: item.mrp,
            productDiscount: item.productDiscount,
            orderDiscount: item.orderDiscount,
            taxableValue: item.taxableValue,
            taxRate: item.gstRate,
            gstAmount: item.gstAmount,
            cgst: item.cgst,
            sgst: item.sgst,
            gst: item.gstAmount,
            hsnCode: item.hsnCode,
            total: item.total,
            ...(item.productId ? { product: { connect: { id: item.productId } } } : {})
          }))
        }
      },
      include: { items: true, user: { select: { name: true, phone: true, email: true } } }
    });

    // Atomically redeem Yogis Points for COD
    if (pricing.yogisPointsUsed > 0) {
      await prisma.$transaction(async (tx) => {
        await redeemPointsAtomic(userId, order.id, pricing.yogisPointsUsed, pricing.yogisPointsDiscount, tx);
      });
    }

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

// Helper function to complete order processing once paid successfully
async function completePaidOrder(orderId, paymentId, details) {
  // Update order payment status
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'completed',
      orderStatus: 'placed',
      paymentDescription: paymentId
    },
    include: { user: { select: { phone: true } } }
  });

  // Deduct stock
  if (details && Array.isArray(details.cartItemIds)) {
    for (const ci of details.cartItemIds) {
      try {
        if (ci.variantId) {
          await prisma.productVariant.update({
            where: { id: ci.variantId },
            data: { stock: { decrement: ci.quantity } }
          });
        } else if (ci.productId) {
          await prisma.product.update({
            where: { id: ci.productId },
            data: { stock: { decrement: ci.quantity } }
          });
        }
      } catch (err) {
        console.error('Failed to deduct stock for item:', ci, err);
      }
    }
  }

  // Update coupon usage
  if (details && details.appliedCouponId) {
    try {
      await prisma.coupon.update({
        where: { id: details.appliedCouponId },
        data: { usedCount: { increment: 1 } }
      });
    } catch (err) {
      console.error('Failed to increment coupon usage:', err);
    }
  }

  // Clear customer cart
  await prisma.cart.deleteMany({ where: { userId: order.userId } });

  // Send Order Confirmed SMS
  if (order.user && order.user.phone) {
    try {
      sendOrderConfirmSMS(order.user.phone, order.orderNumber);
    } catch (err) {
      console.error('Failed to send order SMS:', err);
    }
  }

  return order;
}

// Verify Razorpay Payment — completes the pending order record in the database
router.post('/verify-payment', requireLogin, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.json({ status: false, message: 'Invalid payment signature' });
    }

    // Find the pending order by razorpay_order_id
    const order = await prisma.order.findFirst({
      where: {
        paymentMethod: 'online',
        paymentStatus: 'pending',
        paymentDescription: { contains: razorpay_order_id }
      }
    });

    if (!order) {
      // Check if order is already marked completed (could be processed by Webhook already!)
      const completedOrder = await prisma.order.findFirst({
        where: { paymentDescription: razorpay_payment_id }
      });
      if (completedOrder) {
        return res.json({ status: true, message: 'Payment verified and order placed successfully', orderNumber: completedOrder.orderNumber });
      }
      return res.json({ status: false, message: 'Order not found or already verified.' });
    }

    let details = {};
    try {
      details = JSON.parse(order.paymentDescription);
    } catch (e) {
      console.error('Failed to parse payment details JSON:', e);
    }

    // Mark as complete and deduct stock/clear cart
    await completePaidOrder(order.id, razorpay_payment_id, details);

    res.json({ status: true, message: 'Payment verified and order placed successfully', orderNumber: order.orderNumber });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.json({ status: false, message: 'Verification process failed' });
  }
});

// Razorpay Webhook Endpoint (Safety fallback if connection drops)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ status: false, message: 'Missing signature' });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ status: false, message: 'Webhook secret is not configured' });
    }

    // Verify webhook signature
    const isValid = Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );

    if (!isValid) {
      return res.status(400).json({ status: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment.entity;
      const razorpay_order_id = paymentEntity.order_id;
      const razorpay_payment_id = paymentEntity.id;

      // Find the order that is still pending and has this razorpay_order_id in paymentDescription
      const order = await prisma.order.findFirst({
        where: {
          paymentMethod: 'online',
          paymentStatus: 'pending',
          paymentDescription: { contains: razorpay_order_id }
        }
      });

      if (order) {
        let details = {};
        try {
          details = JSON.parse(order.paymentDescription);
        } catch (e) {
          console.error('Failed to parse payment details JSON:', e);
        }

        await completePaidOrder(order.id, razorpay_payment_id, details);
        console.log(`[Webhook] Order ${order.orderNumber} successfully paid and verified via Webhook.`);
      }
    }

    res.json({ status: true, message: 'Webhook event processed successfully' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ status: false, message: error.message });
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

    const earnTxs = await prisma.yogisPointsTransaction.findMany({
      where: { userId: req.session.userId, type: 'ORDER_EARN' },
      select: { orderId: true, points: true }
    });
    const earnMap = new Map();
    earnTxs.forEach(t => { if (t.orderId) earnMap.set(t.orderId, t.points); });

    const enrichedOrders = orders.map(o => ({
      ...o,
      pointsEarned: earnMap.get(o.id) || 0
    }));

    res.json({ status: true, orders: enrichedOrders });
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

    let pointsEarned = 0;
    const earnTx = await prisma.yogisPointsTransaction.findFirst({
      where: { orderId: order.id, type: 'ORDER_EARN' }
    });
    if (earnTx) pointsEarned = earnTx.points;

    res.json({ status: true, order: { ...order, pointsEarned } });
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

    let pointsEarned = 0;
    const earnTx = await prisma.yogisPointsTransaction.findFirst({
      where: { orderId: order.id, type: 'ORDER_EARN' }
    });
    if (earnTx) pointsEarned = earnTx.points;
    
    res.json({ status: true, order: { ...order, pointsEarned }, coupon });
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

    const pId = parseInt(productId);
    if (!productId || isNaN(pId)) {
      return res.json({ status: false, message: 'Product not found' });
    }

    const productExists = await prisma.product.findUnique({ where: { id: pId } });
    if (!productExists) {
      return res.json({ status: false, message: 'Product not found' });
    }

    if (comment && comment.length > 200) {
      return res.json({ status: false, message: 'Review comment cannot exceed 200 characters' });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({ where: { userId, productId: pId } });
    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating), comment }
      });
      return res.json({ status: true, message: 'Review updated' });
    }

    await prisma.review.create({
      data: { userId, productId: pId, rating: parseInt(rating), comment }
    });
    res.json({ status: true, message: 'Review submitted' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Mark order as failed when payment is cancelled or failed on the frontend
router.post('/payment-failed', requireLogin, async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const userId = req.session.userId;

    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });

    if (!order) {
      return res.json({ status: false, message: 'Order not found' });
    }

    if (order.userId !== userId) {
      return res.json({ status: false, message: 'Unauthorized' });
    }

    // Only update if it is currently pending
    if (order.paymentStatus === 'pending') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: 'failed',
          paymentStatus: 'failed'
        }
      });

      // Restore any points reserved for this failed order
      if (order.yogisPointsUsed > 0) {
        const { reverseOrderPoints } = require('../utils/yogisPoints');
        await reverseOrderPoints(order.id);
      }
    }

    res.json({ status: true, message: 'Order marked as failed' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
