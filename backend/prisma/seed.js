const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@yogisfarm.in' },
    update: {},
    create: { name: 'Yogis Farm', email: 'admin@yogisfarm.in', password: hashedPassword, role: 'superadmin' }
  });
  console.log('✅ Admin created (admin@yogisfarm.in / admin123)');

  console.log('\n🎉 Database seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
