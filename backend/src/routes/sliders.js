const router = require('express').Router();
const prisma = require('../db');
const cache = require('../utils/cache');

router.get('/', async (req, res) => {
  try {
    const { position, type } = req.query;
    const cacheKey = `sliders:position=${position || ''}&type=${type || ''}`;
    
    const cachedSliders = cache.get(cacheKey);
    if (cachedSliders) {
      return res.json({ status: true, sliders: cachedSliders });
    }

    const where = { status: 'active' };
    if (position) where.position = position;
    if (type) where.type = type;
    const sliders = await prisma.slider.findMany({ where, orderBy: { sortOrder: 'asc' } });
    
    cache.set(cacheKey, sliders, 300); // cache for 5 minutes

    res.json({ status: true, sliders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
