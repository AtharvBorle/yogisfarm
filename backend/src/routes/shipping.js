const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Public: Get active shipping rules
router.get('/', async (req, res) => {
  try {
    const shipping = await prisma.shipping.findMany({ where: { status: 'active' }, orderBy: { minCartValue: 'asc' } });
    res.json({ status: true, shipping });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
