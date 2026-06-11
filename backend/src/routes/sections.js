const router = require('express').Router();
const prisma = require('../db');
const cache = require('../utils/cache');

router.get('/', async (req, res) => {
  try {
    const cacheKey = 'sections:all';
    const cachedSections = cache.get(cacheKey);
    if (cachedSections) {
      return res.json({ status: true, sections: cachedSections });
    }

    const sections = await prisma.section.findMany({
      where: { status: 'active' }, orderBy: { sortOrder: 'asc' },
      include: {
        category: {
          include: {
            products: {
              where: { status: 'active' }, take: 10,
              include: { category: true, variants: true }
            }
          }
        }
      }
    });

    cache.set(cacheKey, sections, 300); // cache for 5 minutes

    res.json({ status: true, sections });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
