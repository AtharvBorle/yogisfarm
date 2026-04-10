const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const cats = await prisma.category.findMany({ include: { parent: true } });
    console.log('Categories OK', cats.length);
    const secs = await prisma.section.findMany({ include: { category: true } });
    console.log('Sections OK', secs.length);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
