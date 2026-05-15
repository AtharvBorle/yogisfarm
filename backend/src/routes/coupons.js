const router = require('express').Router();
const { calculateOrderTotals } = require('../utils/pricing');

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
