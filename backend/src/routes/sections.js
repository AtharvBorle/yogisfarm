const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
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
    res.json({ status: true, sections });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
