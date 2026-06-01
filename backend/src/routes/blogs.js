const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const slugify = require('slugify');
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Configure Multer for local uploads or S3
let upload;
let s3;

if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const subdir = req.body.uploadPath || req.query.uploadPath || 'blogs';
        const dirPath = subdir ? `uploads/${subdir}/` : 'uploads/';
        cb(null, dirPath + Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
  });
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const subdir = req.body.uploadPath || req.query.uploadPath || 'blogs';
      const dir = path.join(__dirname, '..', '..', 'uploads', subdir);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
  });
  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}

// Static fallback blogs for auto-seeding
const STATIC_BLOGS = [
  {
    category: "Healthy Oils",
    title: "Lakdi Ghana Groundnut Oil",
    slug: "lakdi-ghana-groundnut-oil",
    description: "Yogi’s Farm Lakdi Ghana Groundnut Oil is 100% natural, cold-pressed, and preservative-free. Rich in antioxidants and Vitamin E, it enhances taste, boosts immunity, and supports heart health. Perfect for everyday cooking.",
    authorName: "ProWIn",
    authorDate: "20th May 2026",
    image: "/src/assets/figma/img_22.png", // fallback local figma image or custom S3
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Yogi’s Farm Lakdi Ghana Groundnut Oil is 100% natural, cold-pressed, and preservative-free. Rich in antioxidants and Vitamin E, it enhances taste, boosts immunity, and supports heart health. Perfect for everyday cooking.
      </p>

      <h3 style="font-size: 20px; font-weight: 700; color: #101828; margin-top: 30px; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
        Understanding The Cold-Press Process: How Lakdi Ghana Oil Is Made
      </h3>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        As health and wellness take center stage in everyday living, consumers are becoming more mindful of the oils they use in cooking. The shift from refined oils to traditional, chemical-free alternatives is growing and <span style="text-decoration: underline; font-weight: 600;">Yogis Farms</span> is leading the way with its commitment to the cold-press process using the Lakdi Ghana method.
      </p>

      <h3 style="font-size: 24px; font-weight: 700; color: #101828; margin-top: 40px; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
        What is Cold-Pressed Oil?
      </h3>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        - Cold-pressed oil, also known as Lakdi Ghana oil or wood-pressed oil, is extracted at low temperatures using a wooden churner. Unlike refined oils that are treated with chemicals and exposed to high heat, cold-pressed oils retain their natural nutrients, aroma, and flavor. These oils are unrefined, additive-free, and packed with health benefits, making them ideal for daily use in Indian kitchens.
      </p>

      <h3 style="font-size: 24px; font-weight: 600; color: #101828; margin-top: 40px; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
        How is Lakdi Ghana Oil Made at Yogi’s Lakdi Ghana Oil?
      </h3>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        At Yogis Farms Lakdi Ghana Oil, traditional values meet modern hygiene standards to deliver oil that is natural, nutritious, and full of flavor. Here’s how our cold-pressed oil is made:
      </p>

      <h4 style="font-size: 20px; font-weight: 600; color: #0A6738; margin-top: 30px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
        1. Selection of High-Quality Seeds
      </h4>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        Every batch starts with the finest quality seeds. Whether it's groundnut (peanut), sesame (til), coconut, or mustard, we source non-GMO, pesticide-free seeds from trusted local farms. This ensures that the base ingredient of the oil is clean, safe, and nutrient-rich.
      </p>

      <h4 style="font-size: 20px; font-weight: 600; color: #0A6738; margin-top: 30px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
        2. Wooden Churner (Lakdi Ghana) Extraction
      </h4>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        We follow the traditional Lakdi Ghana technique, where oil is extracted using a wooden cold-press machine. The wooden churner prevents heat build-up and preserves the essential nutrients, antioxidants, and natural aroma of the oil.
      </p>

      <h4 style="font-size: 20px; font-weight: 600; color: #0A6738; margin-top: 30px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
        3. Cold-Press Process
      </h4>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        The extraction is carried out at a low speed and temperature (below 45°C), which ensures that the nutritional properties of the seeds are retained. This method helps preserve important vitamins like A, E, and essential fatty acids. The process does not involve any chemicals or artificial preservatives.
      </p>

      <h4 style="font-size: 20px; font-weight: 600; color: #0A6738; margin-top: 30px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
        4. Natural Sedimentation
      </h4>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        After extraction, the oil is allowed to settle naturally for two to three days. This allows impurities to settle at the bottom, and the pure oil is separated without the need for synthetic filtration. The result is clean, clear, and nutrient-rich oil.
      </p>

      <h4 style="font-size: 20px; font-weight: 600; color: #0A6738; margin-top: 30px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
        5. Clean and Safe Packaging
      </h4>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        We package the oil in food-grade containers to maintain its purity and freshness. Each batch goes through stringent quality checks, ensuring that customers receive only the best cold-pressed oil for cooking and wellness.
      </p>

      <h3 style="font-size: 24px; font-weight: 700; color: #101828; margin-top: 40px; margin-bottom: 20px; font-family: 'Poppins', sans-serif;">
        Why Choose Chakan's Lakdi Ghana Oil?
      </h3>
      <ul style="font-size: 16px; color: #4A4A4A; line-height: 32px; list-style-type: disc; padding-left: 20px; margin-bottom: 30px;">
        <li>100 percent natural and unrefined</li>
        <li>Extracted using the traditional lakdi ghana method</li>
        <li>Free from chemicals, preservatives, and additives</li>
        <li>Rich in antioxidants, essential fatty acids, and vitamins</li>
        <li>Suitable for cooking, skincare, and general wellness</li>
        <li>Hygienically packed and quality-tested</li>
      </ul>
    `
  },
  {
    category: "Nutrition",
    title: "Benefits of Millet Atta",
    slug: "benefits-of-millet-atta",
    description: "Millets are gluten-free powerhouses loaded with protein, fiber, and vital minerals. Switching to Millet Atta supports blood sugar management, weight control, and heart health.",
    authorName: "ProWIn",
    authorDate: "18th May 2026",
    image: "/src/assets/figma/img_21.png",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Millets are gluten-free powerhouses loaded with protein, fiber, and vital minerals. Switching to Millet Atta supports blood sugar management, weight control, and heart health.
      </p>
      <h3 style="font-size: 20px; font-weight: 700; color: #101828; margin-top: 30px; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
        Why Millets are Reclaiming Their Superfood Status
      </h3>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 28px; margin-bottom: 25px;">
        For generations, millets were the staple food grains of India. With modern processing, refined wheat and rice took over. However, as lifestyle disorders increase, the wisdom of consuming high-fiber grains like Ragi, Jowar, and Bajra is returning.
      </p>
    `
  },
  {
    category: "Lifestyle",
    title: "Why Organic Food Matters",
    slug: "why-organic-food-matters",
    description: "Organic foods are grown without harmful synthetic pesticides and chemicals. They are fresher, taste better, and contain more essential antioxidants and nutrients.",
    authorName: "ProWIn",
    authorDate: "15th May 2026",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Organic foods are grown without harmful synthetic pesticides and chemicals. They are fresher, taste better, and contain more essential antioxidants and nutrients.
      </p>
    `
  },
  {
    category: "Cooking",
    title: "Best Oil for Indian Cooking",
    slug: "best-oil-for-indian-cooking",
    description: "Deep frying, tempering, and high-heat cooking require oils with high smoke points and high stability. Discover why cold-pressed oils are the best options.",
    authorName: "ProWIn",
    authorDate: "12th May 2026",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Deep frying, tempering, and high-heat cooking require oils with high smoke points and high stability. Discover why cold-pressed oils are the best options.
      </p>
    `
  },
  {
    category: "Agriculture",
    title: "Chemical-Free Farming Benefits",
    slug: "chemical-free-farming-benefits",
    description: "Chemical-free farming restores soil fertility, preserves local biodiversity, and guarantees toxic-free produce for your family.",
    authorName: "ProWIn",
    authorDate: "10th May 2026",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Chemical-free farming restores soil fertility, preserves local biodiversity, and guarantees toxic-free produce for your family.
      </p>
    `
  },
  {
    category: "Recipes",
    title: "Healthy Breakfast Recipes",
    slug: "healthy-breakfast-recipes",
    description: "Start your day right with nutrient-rich Indian breakfasts like millet upma, red rice poha, and organic fruit smoothies.",
    authorName: "ProWIn",
    authorDate: "8th May 2026",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Start your day right with nutrient-rich Indian breakfasts like millet upma, red rice poha, and organic fruit smoothies.
      </p>
    `
  },
  {
    category: "Health",
    title: "Gluten-Free Indian Diet",
    slug: "gluten-free-indian-diet",
    description: "A detailed guide on designing a healthy, satisfying, and traditional gluten-free meal plan utilizing local Indian grains.",
    authorName: "ProWIn",
    authorDate: "5th May 2026",
    image: "https://images.unsplash.com/photo-1531535934200-459a3ade0f31?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        A detailed guide on designing a healthy, satisfying, and traditional gluten-free meal plan utilizing local Indian grains.
      </p>
    `
  },
  {
    category: "Nutrition",
    title: "Immunity Boosting Foods",
    slug: "immunity-boosting-foods",
    description: "Integrate Amla, Turmeric, Ginger, Cold-pressed Oils, and organic honey into your daily meals to build strong physical immunity naturally.",
    authorName: "ProWIn",
    authorDate: "2nd May 2026",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        Integrate Amla, Turmeric, Ginger, Cold-pressed Oils, and organic honey into your daily meals to build strong physical immunity naturally.
      </p>
    `
  },
  {
    category: "Health",
    title: "Health & Nutrition Topics",
    slug: "health-and-nutrition-topics",
    description: "A summary of top wellness practices, dietary tips, and traditional habits that promote lifelong holistic health.",
    authorName: "ProWIn",
    authorDate: "30th April 2026",
    image: "https://images.unsplash.com/photo-1556761175-b813f53a362e?auto=format&fit=crop&w=600&q=80",
    content: `
      <p style="font-size: 20px; color: #0A6738; line-height: 30px; font-family: 'Poppins', sans-serif; font-weight: 500; margin-bottom: 30px;">
        A summary of top wellness practices, dietary tips, and traditional habits that promote lifelong holistic health.
      </p>
    `
  }
];

// Helper to seed if database is empty (disabled)
async function ensureSeeded() {
  // Seeding disabled to remove fallback blogs
}

// Helper to seed categories if database is empty (disabled)
async function ensureCategoriesSeeded() {
  // Seeding disabled to remove fallback categories
}

// ─── CATEGORY ENDPOINTS ───

// GET: Fetch all blog categories
router.get('/categories', async (req, res) => {
  try {
    await ensureCategoriesSeeded();
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ status: true, categories });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// POST: Create a new blog category (Admin required)
router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.json({ status: false, message: 'Category name is required' });
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    
    // Check if category name or slug already exists
    const existing = await prisma.blogCategory.findFirst({
      where: {
        OR: [
          { name },
          { slug: generatedSlug }
        ]
      }
    });
    if (existing) {
      return res.json({ status: false, message: 'Category with this name or slug already exists' });
    }

    const category = await prisma.blogCategory.create({
      data: { name, slug: generatedSlug }
    });
    res.json({ status: true, category });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// PUT: Update an existing blog category (Admin required)
router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug } = req.body;
    if (!name) return res.json({ status: false, message: 'Category name is required' });
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

    const category = await prisma.blogCategory.update({
      where: { id },
      data: { name, slug: generatedSlug }
    });
    res.json({ status: true, category });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// DELETE: Delete a blog category (Admin required)
router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.blogCategory.delete({
      where: { id }
    });
    res.json({ status: true, message: 'Category deleted successfully' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── API ENDPOINTS ───

// GET: Fetch all blog posts
router.get('/', async (req, res) => {
  try {
    await ensureSeeded();
    const blogs = await prisma.blogPost.findMany({
      orderBy: { id: 'desc' }
    });
    res.json({ status: true, blogs });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// GET: Fetch single blog post by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    await ensureSeeded();
    const param = req.params.idOrSlug;
    let blog;
    
    if (/^\d+$/.test(param)) {
      // Is dynamic numeric ID
      blog = await prisma.blogPost.findUnique({
        where: { id: parseInt(param) }
      });
    } else {
      // Is Slug
      blog = await prisma.blogPost.findUnique({
        where: { slug: param }
      });
    }

    if (!blog) {
      return res.status(404).json({ status: false, message: 'Blog post not found' });
    }
    res.json({ status: true, blog });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// POST: Create a blog post (Admin required)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { category, title, description, content, image, bannerImage, authorName, authorDate } = req.body;
    
    if (!title || !category || !content) {
      return res.json({ status: false, message: 'Title, category, and content are required' });
    }

    // Generate unique slug
    let baseSlug = slugify(title, { lower: true, strict: true }) || 'blog-post';
    let slug = baseSlug;
    let index = 1;
    while (true) {
      const exists = await prisma.blogPost.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${baseSlug}-${index}`;
      index++;
    }

    const newBlog = await prisma.blogPost.create({
      data: {
        category,
        title,
        slug,
        description: description || '',
        content,
        image: image || null,
        bannerImage: bannerImage || null,
        authorName: authorName || 'ProWIn',
        authorDate: authorDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    });

    res.json({ status: true, message: 'Blog created successfully', blog: newBlog });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// PUT: Update a blog post (Admin required)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { category, title, description, content, image, bannerImage, authorName, authorDate, slug } = req.body;

    const exists = await prisma.blogPost.findUnique({ where: { id } });
    if (!exists) {
      return res.json({ status: false, message: 'Blog post not found' });
    }

    const data = {};
    if (category !== undefined) data.category = category;
    if (title !== undefined) {
      data.title = title;
      if (!slug) {
        // regenerate slug if title changed
        let baseSlug = slugify(title, { lower: true, strict: true }) || 'blog-post';
        let uniqueSlug = baseSlug;
        let index = 1;
        while (true) {
          const existsSlug = await prisma.blogPost.findFirst({ where: { slug: uniqueSlug, id: { not: id } } });
          if (!existsSlug) break;
          uniqueSlug = `${baseSlug}-${index}`;
          index++;
        }
        data.slug = uniqueSlug;
      }
    }
    if (slug !== undefined && slug !== '') {
      // Validate unique slug
      const existsSlug = await prisma.blogPost.findFirst({ where: { slug, id: { not: id } } });
      if (existsSlug) {
        return res.json({ status: false, message: 'Slug already in use' });
      }
      data.slug = slug;
    }
    if (description !== undefined) data.description = description;
    if (content !== undefined) data.content = content;
    if (image !== undefined) data.image = image;
    if (bannerImage !== undefined) data.bannerImage = bannerImage;
    if (authorName !== undefined) data.authorName = authorName;
    if (authorDate !== undefined) data.authorDate = authorDate;

    const updatedBlog = await prisma.blogPost.update({
      where: { id },
      data
    });

    res.json({ status: true, message: 'Blog updated successfully', blog: updatedBlog });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// DELETE: Delete a blog post (Admin required)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.blogPost.findUnique({ where: { id } });
    if (!exists) {
      return res.json({ status: false, message: 'Blog post not found' });
    }

    await prisma.blogPost.delete({ where: { id } });
    res.json({ status: true, message: 'Blog post deleted successfully' });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

// POST: Upload image for editor content (Admin required)
router.post('/upload', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ status: false, message: 'No file uploaded' });
    }
    
    // Construct public accessible URL path
    // For S3 upload, key represents the path. For local files, multer stores filename.
    const fileUrl = req.file.key 
      ? (process.env.ASSET_URL || '') + req.file.key 
      : '/uploads/blogs/' + req.file.filename;

    res.json({ status: true, url: fileUrl });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
