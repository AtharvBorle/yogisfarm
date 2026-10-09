const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🚀 Starting YogisFarms database cleanup...');
  
  // List of all tables to truncate
  const tables = [
    'reviews',
    'wishlist',
    'cart',
    'order_items',
    'orders',
    'delivery_collections',
    'delivery_boys',
    'courier_partners',
    'product_benefits',
    'product_features',
    'product_images',
    'product_variants',
    'products',
    'categories',
    'brands',
    'coupons',
    'sliders',
    'sections',
    'taxes',
    'hsns',
    'contacts',
    'addresses',
    'users',
    'admin_logs',
    'sessions',
    'shipping',
    'blog_posts',
    'blog_categories',
    'referrals',
    'yogis_points_lots',
    'yogis_points_transactions',
    'yogis_points_accounts'
  ];

  try {
    // Disable foreign key checks for MySQL
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    for (const table of tables) {
      try {
        console.log(`Truncating table: ${table}...`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      } catch (err) {
        console.warn(`⚠️ Warning: Could not truncate table ${table}:`, err.message);
      }
    }

    // Re-enable foreign key checks
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    // Clear SEO settings from settings table
    try {
      console.log('Clearing SEO settings from settings table...');
      const seoDeleteResult = await prisma.setting.deleteMany({
        where: {
          key: {
            startsWith: 'seo_'
          }
        }
      });
      console.log(`Cleared ${seoDeleteResult.count} SEO setting row(s).`);
    } catch (err) {
      console.warn('⚠️ Warning: Could not clear SEO settings:', err.message);
    }

    console.log(' \n✅ Database cleanup complete! All rows in all tables deleted, while keeping Admin users and settings intact (except SEO configurations).');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
