const router = require('express').Router();
const prisma = require('../db');
const { requireLogin } = require('../middleware/auth');
const { 
  getPointsConfig, 
  getUserPointsSummary, 
  checkRedemptionEligibility 
} = require('../utils/yogisPoints');

// Public status check (returns global toggle and conversion rate)
router.get('/status', async (req, res) => {
  try {
    const config = await getPointsConfig();
    res.json({
      status: true,
      enabled: config.enabled,
      pointsPerOrder: config.enabled ? (config.pointsPerOrder || 0) : 0,
      conversionPoints: config.conversionPoints,
      conversionRupees: config.conversionRupees,
      minimumRedeemablePoints: config.minimumRedeemablePoints,
      minimumCartValue: config.minimumCartValue,
      minPoints: config.minimumRedeemablePoints,
      minOrderValue: config.minimumCartValue,
      welcomeBonusEnabled: config.welcomeBonusEnabled,
      welcomeBonusPoints: config.welcomeBonusPoints,
      config: {
        enabled: config.enabled,
        pointsPerOrder: config.pointsPerOrder,
        conversionPoints: config.conversionPoints,
        conversionRupees: config.conversionRupees,
        minimumRedeemablePoints: config.minimumRedeemablePoints,
        minimumCartValue: config.minimumCartValue
      }
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Customer balance, rupee value & transaction history
router.get('/my-points', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const summary = await getUserPointsSummary(userId);
    const config = await getPointsConfig();

    const transactions = await prisma.yogisPointsTransaction.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      status: true,
      ...summary,
      minOrderValue: config.minimumCartValue,
      minPoints: config.minimumRedeemablePoints,
      minimumRedeemablePoints: config.minimumRedeemablePoints,
      minimumCartValue: config.minimumCartValue,
      config: {
        enabled: config.enabled,
        pointsPerOrder: config.pointsPerOrder,
        conversionPoints: config.conversionPoints,
        conversionRupees: config.conversionRupees,
        minimumRedeemablePoints: config.minimumRedeemablePoints,
        minimumCartValue: config.minimumCartValue
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        points: t.points,
        balanceAfter: t.balanceAfter,
        description: t.description,
        orderNumber: t.order ? t.order.orderNumber : null,
        orderId: t.orderId,
        expiresAt: t.expiresAt,
        createdAt: t.createdAt
      }))
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Check redemption eligibility for the logged in user
router.post('/check-eligibility', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { cartTotal = 0, couponDiscount = 0 } = req.body;
    const eligibility = await checkRedemptionEligibility(userId, parseFloat(cartTotal), parseFloat(couponDiscount));
    res.json({ status: true, ...eligibility });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
