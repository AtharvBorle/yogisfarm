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

  // Settings
  const settings = [
    { key: 'site_name', value: 'Yogis Farm' },
    { key: 'site_tagline', value: 'Farm Fresh, Direct to You' },
    { key: 'site_email', value: 'info@yogisfarm.in' },
    { key: 'site_phone', value: '9119501177' },
    { key: 'site_address', value: 'S.No 18, Salkunje Bunglow, Sudardhan Park society, Ingale Nagar, Warje, Pune - 417006' },
    { key: 'site_logo', value: '/uploads/logo.png' },
    { key: 'site_currency', value: '₹' },
    { key: 'site_currency_code', value: 'INR' },
    { key: 'site_color', value: '#3BB77E' },
    { key: 'free_shipping_min', value: '500' },
    { key: 'shipping_charge', value: '50' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log('✅ Settings seeded');

  // Tax
  await prisma.tax.createMany({
    data: [
      { name: '5%', tax: 5, status: 'active' },
      { name: '18 tax', tax: 18, status: 'active' },
      { name: 'No TAX', tax: 0, status: 'active' }
    ],
    skipDuplicates: true
  });
  console.log('✅ Tax rates seeded');

  // Categories
  const categories = [
    { name: 'Wheat Atta', slug: 'wheat-atta', featured: true, sortOrder: 1 },
    { name: 'Millet Atta', slug: 'millet-atta', featured: true, sortOrder: 2 },
    { name: 'Multigrain Atta', slug: 'multigrain-atta', featured: true, sortOrder: 3 },
    { name: 'Oil', slug: 'oil', featured: true, sortOrder: 4 },
    { name: 'Dal', slug: 'dal', featured: true, sortOrder: 5 },
    { name: 'Tofu', slug: 'tofu', featured: true, sortOrder: 6 },
    { name: 'Fresh Vegies', slug: 'fresh-vegies', featured: true, sortOrder: 7 }
  ];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  console.log('✅ Categories seeded');

  // Brands
  const brands = [
    { name: 'Yogis', slug: 'yogis' },
    { name: 'Healthy Food', slug: 'healthy-food' },
    { name: 'Natural Food', slug: 'natural-food' },
    { name: 'Organic Food', slug: 'organic-food' },
    { name: 'Organic Natural Food', slug: 'organic-natural-food' }
  ];
  for (const b of brands) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }
  console.log('✅ Brands seeded');

  // Get category/brand IDs
  const dalCat = await prisma.category.findUnique({ where: { slug: 'dal' } });
  const oilCat = await prisma.category.findUnique({ where: { slug: 'oil' } });
  const wheatCat = await prisma.category.findUnique({ where: { slug: 'wheat-atta' } });
  const tofuCat = await prisma.category.findUnique({ where: { slug: 'tofu' } });
  const yogisBrand = await prisma.brand.findUnique({ where: { slug: 'yogis' } });

  // Products
  const products = [
    { name: 'Premium Quality Toor Dal', slug: 'premium-quality-toor-dal', shortDescription: 'Farm-fresh, protein-rich Toor Dal for everyday cooking.', price: 299, salePrice: 199, categoryId: dalCat?.id, brandId: yogisBrand?.id, stock: 100, unit: '1 Kg', featured: true, deal: true },
    { name: 'Premium Quality Moong Dal', slug: 'premium-quality-moong-dal', shortDescription: 'Nutritious and light Moong Dal for healthy meals.', price: 399, salePrice: 299, categoryId: dalCat?.id, brandId: yogisBrand?.id, stock: 100, unit: '1 Kg', featured: true, deal: true },
    { name: 'Premium Quality Urad Dal', slug: 'premium-quality-urad-dal', shortDescription: 'Authentic Urad Dal with rich flavor and texture.', price: 349, salePrice: 269, categoryId: dalCat?.id, brandId: yogisBrand?.id, stock: 100, unit: '1 Kg', featured: true, deal: true },
    { name: 'Premium Quality Harbara Dal', slug: 'premium-quality-harbara-dal', shortDescription: 'Nutritious Harbara Dal with authentic taste.', price: 349, salePrice: 299, categoryId: dalCat?.id, brandId: yogisBrand?.id, stock: 100, unit: '1 Kg', featured: true, deal: true },
    { name: 'Tofu Soy Paneer', slug: 'tofu-soy-paneer', shortDescription: 'Our tofu is crafted to provide a rich source of protein.', price: 60, categoryId: tofuCat?.id, brandId: yogisBrand?.id, stock: 50, unit: '200g', featured: true, deal: true },
    { name: 'Lakdi Ghana Sunflower Oil', slug: 'lakdi-ghana-sunflower-oil', shortDescription: 'Wood-pressed sunflower oil for healthy cooking.', price: 450, salePrice: 399, categoryId: oilCat?.id, brandId: yogisBrand?.id, stock: 80, unit: '1 Ltr', popular: true },
    { name: 'Lakdi Ghana Groundnut Oil', slug: 'lakdi-ghana-groundnut-oil', shortDescription: 'Traditional wood-pressed groundnut oil.', price: 500, salePrice: 449, categoryId: oilCat?.id, brandId: yogisBrand?.id, stock: 80, unit: '1 Ltr', popular: true },
    { name: 'Lokwan Wheat Stone Ground Atta', slug: 'lokwan-wheat-stone-ground-atta', shortDescription: 'Traditional chakki-ground wheat flour.', price: 80, salePrice: 65, categoryId: wheatCat?.id, brandId: yogisBrand?.id, stock: 200, unit: '1 Kg', featured: true, popular: true },
    { name: 'MP Sehori Wheat Atta', slug: 'mp-sehori-wheat-atta', shortDescription: 'Premium MP wheat stone ground atta.', price: 90, salePrice: 75, categoryId: wheatCat?.id, brandId: yogisBrand?.id, stock: 150, unit: '1 Kg', popular: true }
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log('✅ Products seeded');

  // Sections
  const sectionData = [
    { name: 'Premium Quality Dal', categoryId: dalCat?.id, status: 'active', sortOrder: 1 },
    { name: 'Lakdi Ghana Oil', categoryId: oilCat?.id, status: 'active', sortOrder: 2 }
  ];
  for (const s of sectionData) {
    if (s.categoryId) await prisma.section.create({ data: s });
  }
  console.log('✅ Sections seeded');

  // Coupons
  await prisma.coupon.upsert({
    where: { code: 'AMANORA10' },
    update: {},
    create: {
      name: 'SPECIAL AMANORA DISCOUNT', code: 'AMANORA10',
      amountType: 'percent', amount: 10, minOrderAmount: 60,
      description: 'Get 10% OFF exclusively for Amanora Society residents.', status: 'active',
      expireOn: new Date('2026-12-31')
    }
  });
  console.log('✅ Coupons seeded');

  // Delivery Boys
  await prisma.deliveryBoy.createMany({
    data: [
      { name: 'Mangesh Ghodke', phone: '8329604027' },
      { name: 'Krutika Kate', phone: '9393939393' }
    ],
    skipDuplicates: true
  });
  console.log('✅ Delivery boys seeded');

  console.log('\n🎉 Database seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
