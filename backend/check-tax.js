const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const taxes = await prisma.tax.findMany({ where: { status: 'active' } });
  console.log('Active taxes:', JSON.stringify(taxes, null, 2));
  await prisma.$disconnect();
}
check();
