const router = require('express').Router();
const prisma = require('../db');
const { requireLogin } = require('../middleware/auth');
const https = require('https');

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
    const { name, phone, address, city, state, pincode, isDefault, addressType } = req.body;
    
    // Validations
    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.json({ status: false, message: 'Phone number must be exactly 10 digits' });
    }
    if (!pincode || !/^\d{6}$/.test(pincode.toString())) {
      return res.json({ status: false, message: 'Pincode must be exactly 6 digits' });
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.session.userId }, data: { isDefault: false } });
    }
    const addr = await prisma.address.create({
      data: { userId: req.session.userId, name, phone: phone.toString(), address, city, state, pincode: pincode.toString(), isDefault: !!isDefault, addressType: addressType || 'Home' }
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

router.put('/:id', requireLogin, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, isDefault, addressType } = req.body;
    
    // Validations
    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.json({ status: false, message: 'Phone number must be exactly 10 digits' });
    }
    if (!pincode || !/^\d{6}$/.test(pincode.toString())) {
      return res.json({ status: false, message: 'Pincode must be exactly 6 digits' });
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.session.userId }, data: { isDefault: false } });
    }
    const addr = await prisma.address.update({
      where: { id: parseInt(req.params.id) },
      data: { name, phone: phone.toString(), address, city, state, pincode: pincode.toString(), isDefault: !!isDefault, addressType: addressType || 'Home' }
    });
    res.json({ status: true, message: 'Address updated', address: addr });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Pincode lookup proxy route (bypasses browser SSL blocks by routing server-side with rejectUnauthorized: false)
router.get('/pincode/:pincode', requireLogin, async (req, res) => {
  try {
    const { pincode } = req.params;
    const url = `https://api.postalpincode.in/pincode/${pincode}`;
    const options = {
      agent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };
    https.get(url, options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          res.json({ status: true, data: parsed });
        } catch (e) {
          res.json({ status: false, message: 'Invalid response from pincode service' });
        }
      });
    }).on('error', (err) => {
      res.json({ status: false, message: err.message });
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
