const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(req.params.productId), status: 'active' },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: true, reviews });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/', requireLogin, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: { userId: req.session.userId, productId: parseInt(productId), rating: parseInt(rating), comment }
    });
    res.json({ status: true, message: 'Review submitted', review });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
