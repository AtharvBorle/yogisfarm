const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { status: 'active' }, orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } }
    });
    res.json({ status: true, brands });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: req.params.slug } });
    if (!brand) return res.json({ status: false, message: 'Brand not found' });
    res.json({ status: true, brand });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
