const router = require('express').Router();
const prisma = require('../db');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !phone || !subject || !message) {
      return res.json({ status: false, message: 'Please fill in all required fields' });
    }

    if (message.length > 200) {
      return res.json({ status: false, message: 'Message cannot exceed 200 characters' });
    }

    const subjectWords = subject.trim().split(/\s+/).filter(Boolean);
    if (subjectWords.length > 20) {
      return res.json({ status: false, message: 'Subject cannot exceed 20 words' });
    }

    await prisma.contact.create({ data: { name, email, phone, subject, message } });
    res.json({ status: true, message: 'Message sent successfully' });
  } catch (e) {
    res.json({ status: false, message: 'Failed to send message' });
  }
});

module.exports = router;
