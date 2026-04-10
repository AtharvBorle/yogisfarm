const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: false, message: 'Please login first' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ status: false, message: 'Admin access required' });
  }
  next();
}

async function loadUser(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      req.user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    } catch (e) {}
  }
  next();
}

module.exports = { requireLogin, requireAdmin, loadUser };
