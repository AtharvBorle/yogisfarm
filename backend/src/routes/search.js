const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.length < 2) return res.json({ status: true, products: [] });
    const products = await prisma.product.findMany({
      where: { status: 'active', name: { contains: keyword } },
      select: { id: true, name: true, slug: true, image: true, price: true, salePrice: true },
      take: 10
    });
    res.json({ status: true, products });
  } catch (e) {
    res.json({ status: false, products: [] });
  }
});

module.exports = router;
