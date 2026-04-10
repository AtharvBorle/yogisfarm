const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.session.userId },
      include: { product: { include: { category: true, variants: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: true, items });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/toggle', requireLogin, async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.session.userId, productId: parseInt(productId) } }
    });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      res.json({ status: true, message: 'Removed from wishlist', inWishlist: false });
    } else {
      await prisma.wishlist.create({ data: { userId: req.session.userId, productId: parseInt(productId) } });
      res.json({ status: true, message: 'Added to wishlist', inWishlist: true });
    }
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/remove/:productId', requireLogin, async (req, res) => {
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.session.userId, productId: parseInt(req.params.productId) }
    });
    res.json({ status: true, message: 'Removed from wishlist' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
