const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateOrderTotals } = require('../utils/pricing');

router.get('/suggestions', async (req, res) => {
  try {
    const identifier = req.session?.userId || req.sessionID;
    const type = req.session?.userId ? 'userId' : 'sessionId';

    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        status: 'active',
        showOnCart: true,
        OR: [
          { expireOn: null },
          { expireOn: { gt: now } }
        ]
      }
    });

    const suggestions = [];

    const cartItems = await prisma.cart.findMany({
      where: type === 'userId' ? { userId: identifier } : { sessionId: identifier },
      include: { product: { include: { brand: true, tax: true, hsn: true } }, variant: true }
    });

    let offerPriceSum = 0;
    if (cartItems.length > 0) {
      cartItems.forEach(item => {
        const offerPrice = item.variant
          ? parseFloat(item.variant.salePrice || item.variant.price)
          : parseFloat(item.product.salePrice || item.product.price);
        offerPriceSum += offerPrice * item.quantity;
      });
    }

    const { evaluateCouponForCart } = require('../utils/pricing');

    for (const coupon of coupons) {
      // Exclude if user has exceeded limits
      if (req.session?.userId) {
        if (coupon.firstOrdersLimit) {
          const orderCount = await prisma.order.count({
            where: {
              userId: req.session.userId,
              orderStatus: { notIn: ['cancelled', 'failed', 'pending'] }
            }
          });
          if (orderCount >= coupon.firstOrdersLimit) continue;
        }
        if (coupon.userLimit) {
          const userUsageCount = await prisma.order.count({
            where: {
              userId: req.session.userId,
              couponCode: coupon.code,
              orderStatus: { notIn: ['cancelled', 'failed'] }
            }
          });
          if (userUsageCount >= coupon.userLimit) continue;
        }
      }

      if (cartItems.length === 0) {
        suggestions.push({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          status: 'available',
          message: 'Apply this coupon at checkout.'
        });
        continue;
      }

      const evalResult = await evaluateCouponForCart(coupon, cartItems, identifier, type, offerPriceSum);
      
      if (evalResult.isValid) {
        suggestions.push({
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          status: 'applicable',
          discountAmount: evalResult.discountAmount,
          message: `Save ₹${Math.round(evalResult.discountAmount * 100) / 100} on your cart!`
        });
      } else {
        if (coupon.isBogo) {
          suggestions.push({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            status: 'bogo_criteria_unmet',
            message: 'BOGO Offer: Add required items to qualify.'
          });
        } else if (offerPriceSum < parseFloat(coupon.minOrderAmount)) {
          const diff = parseFloat((parseFloat(coupon.minOrderAmount) - offerPriceSum).toFixed(2));
          suggestions.push({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            status: 'nearly_applicable',
            remainingAmount: diff,
            message: `Spend ₹${diff} more to unlock.`
          });
        } else {
          suggestions.push({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            status: 'available',
            message: 'Apply this coupon at checkout.'
          });
        }
      }
    }

    res.json({ status: true, suggestions });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/apply', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!req.session || !req.session.userId) {
      return res.json({ status: false, message: 'Please login to apply coupon' });
    }

    // Use the SAME pricing engine that order placement uses
    const pricing = await calculateOrderTotals(req.session.userId, 'userId', code);

    if (!pricing.appliedCouponId) {
      return res.json({ status: false, message: 'Coupon could not be applied' });
    }

    res.json({
      status: true,
      message: 'Coupon applied',
      discount: Math.round(pricing.discountAmount * 100) / 100,
      coupon: pricing.coupon
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
