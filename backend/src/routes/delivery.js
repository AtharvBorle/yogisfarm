const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { sendOutForDeliverySMS, sendDeliveredSMS } = require('../utils/sms');

// ─── Delivery Boy Auth Middleware ───
const requireDeliveryBoy = (req, res, next) => {
  if (req.session && req.session.deliveryBoyId) {
    next();
  } else {
    res.status(401).json({ status: false, message: 'Unauthorized. Please login.' });
  }
};

// ─── Login ───
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) return res.json({ status: false, message: 'Phone and PIN are required' });

    const boy = await prisma.deliveryBoy.findFirst({ where: { phone, status: 'active' } });
    if (!boy || !boy.pin) {
      return res.json({ status: false, message: 'Invalid credentials or account inactive' });
    }

    const valid = await bcrypt.compare(pin, boy.pin);
    if (!valid) {
      return res.json({ status: false, message: 'Invalid credentials' });
    }

    req.session.deliveryBoyId = boy.id;
    
    // safe return
    const { pin: _, ...safeBoy } = boy;
    res.json({ status: true, message: 'Login successful', deliveryBoy: safeBoy });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

router.post('/logout', (req, res) => {
  delete req.session.deliveryBoyId;
  res.json({ status: true, message: 'Logged out' });
});

// ─── Me & Dashboard Data ───
router.get('/me', requireDeliveryBoy, async (req, res) => {
  try {
    const boy = await prisma.deliveryBoy.findUnique({ where: { id: req.session.deliveryBoyId } });
    if (!boy) return res.json({ status: false, message: 'Not found' });
    const { pin, ...safeBoy } = boy;

    // Get today's counts and overall stats if needed
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const pendingCount = await prisma.order.count({
      where: {
        deliveryBoyId: boy.id,
        orderStatus: { in: ['shipped', 'out_for_delivery'] }
      }
    });

    const assignedTodayCount = await prisma.order.count({
      where: {
        deliveryBoyId: boy.id,
        createdAt: { gte: startOfToday }
      }
    });

    res.json({ 
      status: true, 
      deliveryBoy: safeBoy, 
      stats: { pendingCount, assignedTodayCount } 
    });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Pending Deliveries ───
router.get('/pending-deliveries', requireDeliveryBoy, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        deliveryBoyId: req.session.deliveryBoyId,
        orderStatus: { in: ['shipped', 'out_for_delivery'] }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true } }
      }
    });
    res.json({ status: true, orders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Delivery History ───
router.get('/history', requireDeliveryBoy, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {
      deliveryBoyId: req.session.deliveryBoyId,
      orderStatus: 'delivered'
    };

    if (startDate && endDate) {
      where.updatedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true } },
        items: true
      }
    });
    res.json({ status: true, orders });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Order Details ───
router.get('/orders/:id', requireDeliveryBoy, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { 
        id: parseInt(req.params.id),
        deliveryBoyId: req.session.deliveryBoyId 
      },
      include: {
        user: true,
        items: true
      }
    });
    if (!order) return res.json({ status: false, message: 'Order not found or unauthorized' });
    res.json({ status: true, order });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// ─── Change Status ───
router.put('/orders/:id/status', requireDeliveryBoy, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Only allow specific transitions by delivery boy
    const allowedStatuses = ['out_for_delivery', 'delivered'];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.json({ status: false, message: 'Invalid status update for delivery person' });
    }

    const orderId = parseInt(req.params.id);
    const boyId = req.session.deliveryBoyId;
    
    const current = await prisma.order.findFirst({ 
      where: { id: orderId, deliveryBoyId: boyId },
      include: { user: true }
    });
    if (!current) return res.json({ status: false, message: 'Order not found' });
    
    if (current.orderStatus === 'delivered' || current.orderStatus === 'cancelled') {
      return res.json({ status: false, message: 'Order is already ' + current.orderStatus });
    }

    await prisma.$transaction(async (tx) => {
      // update order
      const data = { orderStatus };
      
      let becamePaid = false;
      if (orderStatus === 'delivered' && current.paymentMethod === 'cod' && current.paymentStatus === 'pending') {
        data.paymentStatus = 'paid';
        becamePaid = true;
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data
      });

      // if collected COD, increase outstanding amount
      if (becamePaid) {
        await tx.deliveryBoy.update({
          where: { id: boyId },
          data: { outstandingAmount: { increment: updatedOrder.total } }
        });
      }
    });

    // Send status-specific SMS via Way2Smart
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (orderStatus === 'out_for_delivery') {
      sendOutForDeliverySMS(current.user?.phone, current.orderNumber);
    } else if (orderStatus === 'delivered') {
      const invoiceLink = `${FRONTEND_URL}/invoice/${current.orderNumber}?download=true`;
      sendDeliveredSMS(current.user?.phone, current.orderNumber, invoiceLink);
    }

    res.json({ status: true, message: 'Status updated successfully' });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

module.exports = router;
