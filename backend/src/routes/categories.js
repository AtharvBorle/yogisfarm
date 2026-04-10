const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const where = { status: 'active' };
    if (featured === 'true') where.featured = true;
    const categories = await prisma.category.findMany({
      where, orderBy: { sortOrder: 'asc' },
      include: { parent: true, _count: { select: { products: true } } }
    });
    res.json({ status: true, categories });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { children: true, _count: { select: { products: true } } }
    });
    if (!category) return res.json({ status: false, message: 'Category not found' });
    res.json({ status: true, category });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
