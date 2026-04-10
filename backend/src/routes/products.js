const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, sort, featured, popular, deal, page = 1, limit = 20 } = req.query;
    const where = { status: 'active' };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (brand) {
      const br = await prisma.brand.findUnique({ where: { slug: brand } });
      if (br) where.brandId = br.id;
    }
    if (search) where.name = { contains: search };
    if (featured === 'true') where.featured = true;
    if (popular === 'true') where.popular = true;
    if (deal === 'true') where.deal = true;

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip, take: parseInt(limit),
        include: { category: true, brand: true, variants: true, images: true }
      }),
      prisma.product.count({ where })
    ]);

    res.json({ status: true, products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true, brand: true, tax: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true, benefits: true, features: true,
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!product) return res.json({ status: false, message: 'Product not found' });

    // Related products
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, status: 'active' },
      take: 8, include: { category: true, variants: true }
    });

    res.json({ status: true, product, related });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Quick view
router.get('/:id/quick-view', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, brand: true, variants: true, images: true }
    });
    res.json({ status: true, product });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
