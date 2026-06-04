const router = require('express').Router();
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { logAdminAction } = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json({ status: true, settings: obj });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.json({ status: false, message: 'Invalid settings object' });
    }

    // Fetch previous settings for logging
    const keys = Object.keys(settings);
    const previousSettings = await prisma.setting.findMany({
      where: { key: { in: keys } }
    });
    const prevMap = {};
    previousSettings.forEach(s => { prevMap[s.key] = s.value; });

    const logDetails = [];

    for (const [key, value] of Object.entries(settings)) {
      const valStr = String(value);
      const prevVal = prevMap[key];
      if (prevVal !== valStr) {
        logDetails.push(`${key}: "${prevVal || ''}" -> "${valStr}"`);
      }

      await prisma.setting.upsert({
        where: { key },
        update: { value: valStr },
        create: { key, value: valStr }
      });
    }

    if (logDetails.length > 0) {
      await logAdminAction(
        req.session.adminId,
        'Updated Settings',
        logDetails.join(', ')
      );
    }

    res.json({ status: true, message: 'Settings saved successfully' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// GET list of SEO pages with filters, pagination, search, and date range
router.get('/seo', requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'seo_'
        }
      }
    });

    const pagesMap = {};
    settings.forEach(s => {
      let pageKey = '';
      let field = '';
      if (s.key.endsWith('_title')) {
        pageKey = s.key.slice(4, -6);
        field = 'title';
      } else if (s.key.endsWith('_description')) {
        pageKey = s.key.slice(4, -12);
        field = 'description';
      } else if (s.key.endsWith('_keywords')) {
        pageKey = s.key.slice(4, -9);
        field = 'keywords';
      } else if (s.key.endsWith('_og_image')) {
        pageKey = s.key.slice(4, -9);
        field = 'ogImage';
      }

      if (!pageKey) return;

      if (!pagesMap[pageKey]) {
        let pageType = 'static';
        if (pageKey.startsWith('blogs/')) {
          pageType = 'blog';
        } else if (pageKey.startsWith('product/')) {
          pageType = 'product';
        }

        pagesMap[pageKey] = {
          page: pageKey,
          type: pageType,
          title: '',
          description: '',
          keywords: '',
          ogImage: '',
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        };
      }

      pagesMap[pageKey][field] = s.value;
      if (s.updatedAt > pagesMap[pageKey].updatedAt) {
        pagesMap[pageKey].updatedAt = s.updatedAt;
      }
      if (s.createdAt < pagesMap[pageKey].createdAt) {
        pagesMap[pageKey].createdAt = s.createdAt;
      }
    });

    let result = Object.values(pagesMap);

    // Apply Search
    const search = (req.query.search || '').trim().toLowerCase();
    if (search) {
      result = result.filter(item => 
        item.page.toLowerCase().includes(search) ||
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.keywords.toLowerCase().includes(search)
      );
    }

    // Apply Filter Type
    const filterType = (req.query.type || 'all').trim().toLowerCase();
    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType);
    }

    // Apply Date Range
    const { startDate, endDate } = req.query;
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(item => new Date(item.updatedAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(item => new Date(item.updatedAt) <= end);
    }

    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Pagination
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = result.length;
    const paginatedData = result.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      status: true,
      data: paginatedData,
      totalCount,
      page,
      limit,
      totalPages
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// DELETE SEO config for a page
router.delete('/seo/*', requireAdmin, async (req, res) => {
  try {
    const pageKey = req.params[0];
    if (!pageKey) {
      return res.json({ status: false, message: 'Page key is required' });
    }

    await prisma.setting.deleteMany({
      where: {
        key: {
          in: [
            `seo_${pageKey}_title`,
            `seo_${pageKey}_description`,
            `seo_${pageKey}_keywords`,
            `seo_${pageKey}_og_image`
          ]
        }
      }
    });

    res.json({ status: true, message: `SEO settings for '${pageKey}' deleted successfully` });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
