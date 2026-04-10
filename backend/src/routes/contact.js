const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    await prisma.contact.create({ data: { name, email, phone, subject, message } });
    res.json({ status: true, message: 'Message sent successfully' });
  } catch (e) {
    res.json({ status: false, message: 'Failed to send message' });
  }
});

module.exports = router;
