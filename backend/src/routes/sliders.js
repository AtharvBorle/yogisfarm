const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { position, type } = req.query;
    const where = { status: 'active' };
    if (position) where.position = position;
    if (type) where.type = type;
    const sliders = await prisma.slider.findMany({ where, orderBy: { sortOrder: 'asc' } });
    res.json({ status: true, sliders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
