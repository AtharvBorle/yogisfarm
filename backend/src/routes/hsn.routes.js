const express = require('express');
const router = express.Router();
const { getHsns, createHsn, updateHsn, deleteHsn } = require('../controllers/hsn.controller');
const { requireAdmin } = require('../middleware/auth');

router.get('/', getHsns);
router.post('/', requireAdmin, createHsn);
router.put('/:id', requireAdmin, updateHsn);
router.delete('/:id', requireAdmin, deleteHsn);

module.exports = router;
