const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/apply', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) return res.json({ status: false, message: 'Invalid coupon code' });
    if (coupon.status !== 'active') return res.json({ status: false, message: 'Coupon is inactive' });
    if (coupon.expireOn && new Date() > coupon.expireOn) return res.json({ status: false, message: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.json({ status: false, message: 'Coupon usage limit reached' });
    if (parseFloat(subtotal) < parseFloat(coupon.minOrderAmount)) {
      return res.json({ status: false, message: `Minimum order ₹${coupon.minOrderAmount} required` });
    }

    let discount = coupon.amountType === 'percent'
      ? (parseFloat(subtotal) * parseFloat(coupon.amount)) / 100
      : parseFloat(coupon.amount);
    if (coupon.maxDiscount) discount = Math.min(discount, parseFloat(coupon.maxDiscount));

    res.json({ status: true, message: 'Coupon applied', discount: Math.round(discount * 100) / 100, coupon });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
