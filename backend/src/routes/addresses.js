const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.session.userId }, orderBy: { createdAt: 'desc' }
    });
    res.json({ status: true, addresses });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/', requireLogin, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.session.userId }, data: { isDefault: false } });
    }
    const addr = await prisma.address.create({
      data: { userId: req.session.userId, name, phone, address, city, state, pincode, isDefault: !!isDefault }
    });
    res.json({ status: true, message: 'Address added', address: addr });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.delete('/:id', requireLogin, async (req, res) => {
  try {
    await prisma.address.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ status: true, message: 'Address deleted' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
