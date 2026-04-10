const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json({ status: true, settings: obj });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
