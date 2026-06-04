const prisma = require('../db');

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

  // Restrict blog_admin from accessing main admin endpoints, except checking own session or logging out
  if (req.baseUrl.startsWith('/api/admin') && req.session.adminRole === 'blog_admin') {
    const isAllowedPath = req.path === '/me' || req.path === '/logout';
    if (!isAllowedPath) {
      return res.status(403).json({ status: false, message: 'Forbidden: Blog admins cannot access main admin endpoints' });
    }
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
