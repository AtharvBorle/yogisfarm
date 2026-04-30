const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAdminAction = async (adminId, action, details = null) => {
    try {
        if (!adminId) return;
        await prisma.adminLog.create({
            data: {
                adminId: parseInt(adminId),
                action,
                details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null
            }
        });
    } catch (err) {
        console.error('Failed to log admin action:', err);
    }
};

module.exports = { logAdminAction };
