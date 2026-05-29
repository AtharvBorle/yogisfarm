const router = require('express').Router();
const prisma = require('../db');
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

    const review = await prisma.review.create({
      data: { userId: req.session.userId, productId: pId, rating: parseInt(rating), comment }
    });
    res.json({ status: true, message: 'Review submitted', review });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
