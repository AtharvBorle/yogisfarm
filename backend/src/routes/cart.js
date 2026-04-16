const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get cart
router.get('/', async (req, res) => {
  try {
    const where = req.session.userId
      ? { userId: req.session.userId }
      : { sessionId: req.sessionID };

    const items = await prisma.cart.findMany({
      where,
      include: {
        product: { include: { category: true, images: true, tax: true } },
        variant: true
      }
    });
    res.json({ status: true, items });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Get cart count
router.get('/count', async (req, res) => {
  try {
    const where = req.session.userId
      ? { userId: req.session.userId }
      : { sessionId: req.sessionID };
    const count = await prisma.cart.count({ where });
    res.json({ status: true, count });
  } catch (e) {
    res.json({ status: true, count: 0 });
  }
});

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const data = {
      productId: parseInt(productId),
      variantId: variantId ? parseInt(variantId) : null,
      quantity: parseInt(quantity)
    };

    if (req.session.userId) {
      data.userId = req.session.userId;
    } else {
      data.sessionId = req.sessionID;
      req.session.sessionId = req.sessionID;
    }

    // Stock Validation
    let availableStock = 0;
    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: data.variantId } });
      if (!variant) return res.json({ status: false, message: 'Variant not found' });
      availableStock = variant.stock;
    } else {
      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (!product) return res.json({ status: false, message: 'Product not found' });
      availableStock = product.stock;
    }

    // Check if already in cart
    const existing = await prisma.cart.findFirst({
      where: {
        productId: data.productId,
        variantId: data.variantId,
        ...(data.userId ? { userId: data.userId } : { sessionId: data.sessionId })
      }
    });

    if (existing) {
      if (existing.quantity + data.quantity > availableStock) {
        return res.json({ status: false, message: `Only ${availableStock} units available in stock.` });
      }
      await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity }
      });
      if (data.quantity > availableStock) {
        return res.json({ status: false, message: `Only ${availableStock} units available in stock.` });
      }
      await prisma.cart.create({ data });
    }

    const count = await prisma.cart.count({
      where: data.userId ? { userId: data.userId } : { sessionId: data.sessionId }
    });

    res.json({ status: true, message: 'Added to cart', count });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Update quantity
router.put('/update', async (req, res) => {
  try {
    const { cartId, quantity } = req.body;
    if (parseInt(quantity) < 1) {
      await prisma.cart.delete({ where: { id: parseInt(cartId) } });
    } else {
      const cartItem = await prisma.cart.findUnique({ where: { id: parseInt(cartId) } });
      if (!cartItem) return res.json({ status: false, message: 'Cart item not found' });
      
      let availableStock = 0;
      if (cartItem.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: cartItem.variantId } });
        availableStock = variant ? variant.stock : 0;
      } else {
        const product = await prisma.product.findUnique({ where: { id: cartItem.productId } });
        availableStock = product ? product.stock : 0;
      }

      if (parseInt(quantity) > availableStock) {
        return res.json({ status: false, message: `Only ${availableStock} units available in stock.` });
      }

      await prisma.cart.update({ where: { id: parseInt(cartId) }, data: { quantity: parseInt(quantity) } });
    }
    res.json({ status: true, message: 'Cart updated' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Remove item
router.delete('/remove/:id', async (req, res) => {
  try {
    await prisma.cart.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ status: true, message: 'Removed from cart' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
