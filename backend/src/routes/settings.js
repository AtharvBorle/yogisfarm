const router = require('express').Router();
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');

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

router.put('/', requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.json({ status: false, message: 'Invalid settings object' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }

    res.json({ status: true, message: 'Settings saved successfully' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
