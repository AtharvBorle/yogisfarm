const session = require('express-session');

class PrismaStore extends session.Store {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async get(sid, cb) {
    try {
      const sessionData = await this.prisma.session.findUnique({ where: { sid } });
      if (!sessionData) return cb(null, null);
      
      // check expiry
      if (sessionData.expiresAt && sessionData.expiresAt < new Date()) {
        await this.prisma.session.delete({ where: { sid } });
        return cb(null, null);
      }
      return cb(null, JSON.parse(sessionData.data));
    } catch (err) {
      return cb(err);
    }
  }

  async set(sid, sessionData, cb) {
    try {
      const expiresAt = sessionData.cookie && sessionData.cookie.expires 
                        ? new Date(sessionData.cookie.expires) 
                        : new Date(Date.now() + 86400000);
                        
      await this.prisma.session.upsert({
        where: { sid },
        update: { data: JSON.stringify(sessionData), expiresAt },
        create: { sid, data: JSON.stringify(sessionData), expiresAt }
      });
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  async destroy(sid, cb) {
    const callback = cb || (() => {});
    try {
      await this.prisma.session.delete({ where: { sid } });
      callback(null);
    } catch (err) {
      if (err.code === 'P2025') return callback(null); // Record doesn't exist
      callback(err);
    }
  }
}

module.exports = PrismaStore;
