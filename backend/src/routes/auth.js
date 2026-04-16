const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');
const crypto = require('crypto');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.json({ status: false, message: 'Phone number must be exactly 10 digits' });
    }
    const otp = process.env.DEMO_MODE === 'true' ? '123456' : String(crypto.randomInt(100000, 999999));
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // SMS stub — log OTP to console
    console.log(`\n📱 [SMS] OTP for ${phone}: ${otp} | Expires: ${otpExpiry.toLocaleTimeString()}\n`);

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

    await prisma.user.update({ where: { id: user.id }, data: { otp: null, otpExpiry: null } });
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

    const needsDetails = !user.name;
    res.json({ status: true, message: 'OTP verified', user, needsDetails });
  } catch (e) {
    res.json({ status: false, message: 'Verification failed' });
  }
});

// Submit details (after first login)
router.post('/submit-details', requireLogin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.session.userId },
      data: { name, email }
    });
    res.json({ status: true, message: 'Details saved', user });
  } catch (e) {
    res.json({ status: false, message: 'Failed to save details' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = process.env.DEMO_MODE === 'true' ? '123456' : String(crypto.randomInt(100000, 999999));
    // SMS stub — log OTP to console
    console.log(`\n📱 [SMS] Resend OTP for ${phone}: ${otp} | Expires: ${new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString()}\n`);
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

module.exports = router;
