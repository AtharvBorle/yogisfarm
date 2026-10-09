const router = require('express').Router();
const prisma = require('../db');
const { requireLogin } = require('../middleware/auth');
const crypto = require('crypto');
const { sendOtpSMS } = require('../utils/sms');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.json({ status: false, message: 'Phone number must be exactly 10 digits' });
    }
    const otp = process.env.DEMO_MODE === 'true' ? '123456' : String(crypto.randomInt(100000, 999999));
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Send OTP via Way2Smart SMS
    sendOtpSMS(phone, otp);

    let user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpiry } });
    } else {
      user = await prisma.user.create({ data: { phone, otp, otpExpiry } });
    }
    res.json({ status: true, message: 'OTP sent successfully', isNew: !user.name });
  } catch (e) {
    res.json({ status: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.json({ status: false, message: 'User not found' });
    if (user.otp !== otp) return res.json({ status: false, message: 'Invalid OTP' });
    if (user.otpExpiry && new Date() > user.otpExpiry) return res.json({ status: false, message: 'OTP expired' });

    const updateData = { otp: null, otpExpiry: null };
    if (user.deletionRequestedAt) {
      updateData.deletionRequestedAt = null;
    }
    await prisma.user.update({ where: { id: user.id }, data: updateData });
    req.session.userId = user.id;

    // Migrate guest cart
    if (req.session.sessionId) {
      const guestItems = await prisma.cart.findMany({ where: { sessionId: req.session.sessionId } });
      for (const item of guestItems) {
        const existing = await prisma.cart.findFirst({
          where: { userId: user.id, productId: item.productId, variantId: item.variantId }
        });
        if (existing) {
          await prisma.cart.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
          await prisma.cart.delete({ where: { id: item.id } });
        } else {
          await prisma.cart.update({ where: { id: item.id }, data: { userId: user.id, sessionId: null } });
        }
      }
    }

    // Explicitly save session to DB before responding (prevents race with next request)
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const needsDetails = !user.name;

    // For existing users logging in, ensure welcome bonus is processed if eligible.
    // For new users needing details, rewards are processed atomically in submit-details.
    if (!needsDetails) {
      try {
        const { awardWelcomeBonus } = require('../utils/yogisPoints');
        await awardWelcomeBonus(user.id);
      } catch (bonusErr) {
        console.error('Error checking/awarding welcome bonus:', bonusErr);
      }
    }

    res.json({ status: true, message: 'OTP verified', user, needsDetails });
  } catch (e) {
    res.json({ status: false, message: 'Verification failed' });
  }
});

// Submit details (after first login)
router.post('/submit-details', requireLogin, async (req, res) => {
  try {
    const { name, email, referralCode } = req.body;
    if (!name || !name.trim()) {
      return res.json({ status: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.json({ status: false, message: 'Email is required' });
    }

    const { processNewCustomerSignup } = require('../utils/yogisPoints');
    const result = await processNewCustomerSignup({
      userId: req.session.userId,
      name,
      email,
      referralCode
    });

    res.json({
      status: true,
      message: 'Registration successful',
      user: result.user,
      referralRewarded: result.referralRewarded,
      welcomeBonusRewarded: result.welcomeBonusRewarded
    });
  } catch (e) {
    console.error('Error in submit-details:', e);
    res.json({ status: false, message: e.message || 'Failed to save details' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = process.env.DEMO_MODE === 'true' ? '123456' : String(crypto.randomInt(100000, 999999));
    // Resend OTP via Way2Smart SMS
    sendOtpSMS(phone, otp);
    await prisma.user.update({ where: { phone }, data: { otp, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) } });
    res.json({ status: true, message: 'OTP resent' });
  } catch (e) {
    res.json({ status: false, message: 'Failed to resend OTP' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ status: false, loggedIn: false });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    res.json({ status: true, loggedIn: true, user });
  } catch (e) {
    res.json({ status: false, loggedIn: false });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ status: true, message: 'Logged out' });
});

// Request account deletion
router.post('/delete-account-request', requireLogin, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.session.userId },
      data: { deletionRequestedAt: new Date() }
    });
    req.session.destroy();
    res.json({ status: true, message: 'Account deletion requested successfully. You have been logged out.' });
  } catch (e) {
    res.json({ status: false, message: 'Failed to request account deletion' });
  }
});

module.exports = router;
