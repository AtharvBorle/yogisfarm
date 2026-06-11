const router = require('express').Router();
const prisma = require('../db');
const cache = require('../utils/cache');

router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const cacheKey = `categories:featured=${featured || ''}`;

    const cachedCategories = cache.get(cacheKey);
    if (cachedCategories) {
      return res.json({ status: true, categories: cachedCategories });
    }

    const where = { status: 'active' };
    if (featured === 'true') where.featured = true;
    const categories = await prisma.category.findMany({
      where, orderBy: { sortOrder: 'asc' },
      include: { parent: true, _count: { select: { products: true } } }
    });

    cache.set(cacheKey, categories, 300); // cache for 5 minutes

    res.json({ status: true, categories });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const cacheKey = `categories:slug=${req.params.slug}`;
    const cachedCategory = cache.get(cacheKey);
    if (cachedCategory) {
      return res.json({ status: true, category: cachedCategory });
    }

    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { children: true, _count: { select: { products: true } } }
    });
    if (!category) return res.json({ status: false, message: 'Category not found' });

    cache.set(cacheKey, category, 300); // cache for 5 minutes

    res.json({ status: true, category });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
