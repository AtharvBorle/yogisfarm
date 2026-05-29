const router = require('express').Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const taxes = await prisma.tax.findMany({ where: { status: 'active' } });
    res.json({ status: true, taxes });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
