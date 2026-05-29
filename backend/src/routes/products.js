const router = require('express').Router();
const prisma = require('../db');

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
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip, take: parseInt(limit),
        include: { 
          category: true, 
          brand: true, 
          variants: true, 
          images: true,
          reviews: { where: { status: 'active' } }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({ status: true, products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Get homepage compact list sections (top selling, trending, recently added, top rated)
router.get('/homepage-lists', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    // 1. Recently Added (actual creation date)
    const recentlyAdded = await prisma.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { variants: true, reviews: { where: { status: 'active' } } }
    });

    // 2. Top Rated & 3. Trending Products
    const allProducts = await prisma.product.findMany({
      where: { status: 'active' },
      include: { variants: true, reviews: { where: { status: 'active' } } }
    });
    
    // Top Rated (live dynamic rating calculation)
    const topRated = [...allProducts]
      .map(p => {
        const avg = p.reviews.length > 0
          ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length)
          : 5.0;
        return { ...p, avgRating: avg };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);

    // Trending (based on review counts / engagement & recency)
    const trending = [...allProducts]
      .sort((a, b) => {
        if (b.reviews.length !== a.reviews.length) {
          return b.reviews.length - a.reviews.length;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, limit);

    // 4. Top Selling (based on actual sales from OrderItem grouped by productId)
    const topSold = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        productId: { not: null },
        order: {
          orderStatus: { in: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
        }
      },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: limit
    });

    const topSoldIds = topSold.map(item => item.productId).filter(Boolean);
    let topSelling = [];
    if (topSoldIds.length > 0) {
      topSelling = await prisma.product.findMany({
        where: { id: { in: topSoldIds }, status: 'active' },
        include: { variants: true, reviews: { where: { status: 'active' } } }
      });
      topSelling.sort((a, b) => topSoldIds.indexOf(a.id) - topSoldIds.indexOf(b.id));
    }
    
    if (topSelling.length < limit) {
      const remainingLimit = limit - topSelling.length;
      const fallbackProducts = await prisma.product.findMany({
        where: { id: { notIn: topSoldIds }, status: 'active' },
        take: remainingLimit,
        include: { variants: true, reviews: { where: { status: 'active' } } }
      });
      topSelling = [...topSelling, ...fallbackProducts];
    }

    res.json({
      status: true,
      topSelling,
      trending,
      recentlyAdded,
      topRated
    });
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
        category: true, brand: true, tax: true, hsn: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true, benefits: true, features: true,
        reviews: { where: { status: 'active' }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
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
      include: { 
        category: true, 
        brand: true, 
        variants: true, 
        images: true,
        reviews: { where: { status: 'active' }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });
    res.json({ status: true, product });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
