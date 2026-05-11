const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getHsns = async (req, res) => {
    try {
        const hsns = await prisma.hsn.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ status: true, hsns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server Error' });
    }
};

const createHsn = async (req, res) => {
    try {
        const { hsnCode, keywords } = req.body;
        
        if (!hsnCode) {
            return res.status(400).json({ status: false, message: 'HSN Code is required' });
        }

        const existing = await prisma.hsn.findUnique({ where: { hsnCode } });
        if (existing) {
            return res.status(400).json({ status: false, message: 'HSN Code already exists' });
        }

        const hsn = await prisma.hsn.create({
            data: { hsnCode, keywords }
        });
        res.json({ status: true, message: 'HSN Created', hsn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server Error' });
    }
};

const updateHsn = async (req, res) => {
    try {
        const { id } = req.params;
        const { hsnCode, keywords } = req.body;

        const hsn = await prisma.hsn.update({
            where: { id: Number(id) },
            data: { hsnCode, keywords }
        });
        res.json({ status: true, message: 'HSN Updated', hsn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server Error' });
    }
};

const deleteHsn = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.hsn.delete({ where: { id: Number(id) } });
        res.json({ status: true, message: 'HSN Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server Error' });
    }
};

module.exports = { getHsns, createHsn, updateHsn, deleteHsn };
