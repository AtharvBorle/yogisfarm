const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Blog Admin user...');

  // Hash the default password for the blog admin
  const hashedPassword = await bcrypt.hash('blogadmin123', 10);

  // Upsert the Blog Admin to prevent duplicate key errors on multiple runs
  await prisma.admin.upsert({
    where: { email: 'blogadmin@yogisfarm.in' },
    update: { 
      role: 'blog_admin',
      name: 'Blog Administrator'
    },
    create: { 
      name: 'Blog Administrator', 
      email: 'blogadmin@yogisfarm.in', 
      password: hashedPassword, 
      role: 'blog_admin',
      phone: '9970790459', // Sames as default admin phone if needed, or null
      twoFactorEnabled: false 
    }
  });

  console.log('✅ Blog Admin created (email: blogadmin@yogisfarm.in, password: blogadmin123, role: blog_admin)');
  console.log('\n🎉 Blog Admin seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
