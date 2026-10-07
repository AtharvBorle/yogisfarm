const router = require('express').Router();
const { requireLogin } = require('../middleware/auth');
const { 
  getPointsConfig, 
  validateReferralCode, 
  getUserReferralSummary 
} = require('../utils/yogisPoints');

/**
 * Public status check for Refer & Earn feature
 * Used by signup page to decide if referral input should be visible.
 */
router.get('/status', async (req, res) => {
  try {
    const config = await getPointsConfig();
    res.json({
      status: true,
      enabled: Boolean(config.enabled && config.referralEnabled),
      pointsEnabled: Boolean(config.enabled),
      referrerRewardPoints: config.referrerRewardPoints,
      referredRewardPoints: config.referredRewardPoints,
      conversionPoints: config.conversionPoints,
      conversionRupees: config.conversionRupees,
      minimumRedeemablePoints: config.minimumRedeemablePoints
    });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

/**
 * Validate referral code dynamically
 */
router.get('/validate', async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.session?.userId || null;
    const result = await validateReferralCode(code, userId);
    res.json({ status: true, ...result });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

/**
 * Customer dashboard summary: code, link, earnings, referrals list
 */
router.get('/my-referrals', requireLogin, async (req, res) => {
  try {
    const summary = await getUserReferralSummary(req.session.userId);
    res.json({ status: true, ...summary });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

module.exports = router;
