/**
 * Centralized Yogis Points Loyalty & Discount Engine
 * 
 * Production-ready service handling:
 * - Configuration management (editable, dynamic conversion, toggle)
 * - FEFO (First Expiring, First Out) lot consumption
 * - Atomic point redemption with row-level database locking
 * - Expiry evaluation and tracking
 * - Welcome bonus distribution
 * - Order completion credits and cancellation/refund reversals
 * - Ledger transaction auditing
 */

const prisma = require('../db');

/**
 * Get or initialize Yogis Points global configuration
 */
async function getPointsConfig(prismaClient = prisma) {
  let config = await prismaClient.yogisPointsConfig.findFirst();
  if (!config) {
    config = await prismaClient.yogisPointsConfig.create({
      data: {
        enabled: false,
        pointsPerOrder: 10,
        conversionPoints: 100,
        conversionRupees: 100.00,
        minimumRedeemablePoints: 100,
        minimumCartValue: 500.00,
        expiryEnabled: true,
        expiryValue: 1,
        expiryUnit: 'years',
        welcomeBonusEnabled: false,
        welcomeBonusPoints: 100
      }
    });
  }
  return {
    ...config,
    conversionRupees: Number(config.conversionRupees),
    minimumCartValue: Number(config.minimumCartValue)
  };
}

/**
 * Update Yogis Points configuration with strict validation
 */
async function updatePointsConfig(data, prismaClient = prisma) {
  const current = await getPointsConfig(prismaClient);

  const payload = {};
  if (data.enabled !== undefined) payload.enabled = Boolean(data.enabled);
  if (data.pointsPerOrder !== undefined) {
    const val = parseInt(data.pointsPerOrder, 10);
    if (isNaN(val) || val < 0) throw new Error('Points per order must be a non-negative integer');
    payload.pointsPerOrder = val;
  }
  if (data.conversionPoints !== undefined) {
    const val = parseInt(data.conversionPoints, 10);
    if (isNaN(val) || val <= 0) throw new Error('Conversion points must be a positive integer');
    payload.conversionPoints = val;
  }
  if (data.conversionRupees !== undefined) {
    const val = parseFloat(data.conversionRupees);
    if (isNaN(val) || val <= 0) throw new Error('Conversion rupees must be a positive number');
    payload.conversionRupees = val;
  }
  if (data.minimumRedeemablePoints !== undefined) {
    const val = parseInt(data.minimumRedeemablePoints, 10);
    if (isNaN(val) || val < 0) throw new Error('Minimum redeemable points must be a non-negative integer');
    payload.minimumRedeemablePoints = val;
  }
  if (data.minimumCartValue !== undefined) {
    const val = parseFloat(data.minimumCartValue);
    if (isNaN(val) || val < 0) throw new Error('Minimum cart value must be a non-negative number');
    payload.minimumCartValue = val;
  }
  if (data.expiryEnabled !== undefined) payload.expiryEnabled = Boolean(data.expiryEnabled);
  if (data.expiryValue !== undefined) {
    const val = parseInt(data.expiryValue, 10);
    if (isNaN(val) || val <= 0) throw new Error('Expiry value must be a positive integer');
    payload.expiryValue = val;
  }
  if (data.expiryUnit !== undefined) {
    const unit = String(data.expiryUnit).toLowerCase();
    if (!['days', 'months', 'years'].includes(unit)) {
      throw new Error("Expiry unit must be 'days', 'months', or 'years'");
    }
    payload.expiryUnit = unit;
  }
  if (data.welcomeBonusEnabled !== undefined) payload.welcomeBonusEnabled = Boolean(data.welcomeBonusEnabled);
  if (data.welcomeBonusPoints !== undefined) {
    const val = parseInt(data.welcomeBonusPoints, 10);
    if (isNaN(val) || val < 0) throw new Error('Welcome bonus points must be a non-negative integer');
    payload.welcomeBonusPoints = val;
  }

  const updated = await prismaClient.yogisPointsConfig.update({
    where: { id: current.id },
    data: payload
  });

  return {
    ...updated,
    conversionRupees: Number(updated.conversionRupees),
    minimumCartValue: Number(updated.minimumCartValue)
  };
}

/**
 * Calculates future expiry date based on current config
 */
function calculateExpiryDate(config, fromDate = new Date()) {
  if (!config.expiryEnabled) return null;
  const expiry = new Date(fromDate);
  const val = parseInt(config.expiryValue, 10) || 1;
  const unit = String(config.expiryUnit).toLowerCase();

  if (unit === 'days') {
    expiry.setDate(expiry.getDate() + val);
  } else if (unit === 'months') {
    expiry.setMonth(expiry.getMonth() + val);
  } else if (unit === 'years') {
    expiry.setFullYear(expiry.getFullYear() + val);
  }
  return expiry;
}

/**
 * Calculates rupee value from points
 */
function calculateRupeeValue(points, config) {
  if (!points || points <= 0) return 0;
  const rate = Number(config.conversionRupees) / Number(config.conversionPoints);
  return Math.round(points * rate * 100) / 100;
}

/**
 * Ensures a user has a YogisPointsAccount record
 */
async function ensureUserAccount(userId, prismaClient = prisma) {
  let account = await prismaClient.yogisPointsAccount.findUnique({
    where: { userId }
  });
  if (!account) {
    account = await prismaClient.yogisPointsAccount.create({
      data: {
        userId,
        balance: 0
      }
    });
  }
  return account;
}

/**
 * Process expired lots for a user and record audit transaction
 */
async function processExpiryForUser(userId, prismaClient = prisma) {
  const now = new Date();
  const expiredLots = await prismaClient.yogisPointsLot.findMany({
    where: {
      userId,
      remainingPoints: { gt: 0 },
      expiresAt: { lte: now }
    }
  });

  if (!expiredLots.length) return { expiredPointsTotal: 0 };

  const expiredPointsTotal = expiredLots.reduce((sum, lot) => sum + lot.remainingPoints, 0);

  await prismaClient.$transaction(async (tx) => {
    // Zero out expired lots
    await tx.yogisPointsLot.updateMany({
      where: {
        id: { in: expiredLots.map(l => l.id) }
      },
      data: {
        remainingPoints: 0
      }
    });

    const account = await ensureUserAccount(userId, tx);
    const newBalance = Math.max(0, account.balance - expiredPointsTotal);

    await tx.yogisPointsAccount.update({
      where: { userId },
      data: { balance: newBalance }
    });

    await tx.yogisPointsTransaction.create({
      data: {
        userId,
        type: 'EXPIRY',
        points: -expiredPointsTotal,
        balanceAfter: newBalance,
        description: `${expiredPointsTotal} points expired`
      }
    });
  });

  return { expiredPointsTotal };
}

/**
 * Returns user points summary, balance, rupee value, and expiring points
 */
async function getUserPointsSummary(userId, prismaClient = prisma) {
  if (!userId) return null;

  await processExpiryForUser(userId, prismaClient);

  const config = await getPointsConfig(prismaClient);
  const account = await ensureUserAccount(userId, prismaClient);

  const now = new Date();
  const activeLots = await prismaClient.yogisPointsLot.findMany({
    where: {
      userId,
      remainingPoints: { gt: 0 },
      OR: [
        { expiresAt: { gt: now } },
        { expiresAt: null }
      ]
    },
    orderBy: { expiresAt: 'asc' }
  });

  const activePoints = activeLots.reduce((sum, lot) => sum + lot.remainingPoints, 0);

  // Reconcile account balance if there's any drift
  if (account.balance !== activePoints) {
    await prismaClient.yogisPointsAccount.update({
      where: { userId },
      data: { balance: activePoints }
    });
    account.balance = activePoints;
  }

  const rupeeValue = calculateRupeeValue(activePoints, config);

  const nearestExpiringLot = activeLots.find(l => l.expiresAt !== null) || null;

  return {
    enabled: config.enabled,
    balance: activePoints,
    rupeeValue,
    conversionRate: {
      points: config.conversionPoints,
      rupees: config.conversionRupees,
      perPointValue: config.conversionRupees / config.conversionPoints
    },
    minimumRedeemablePoints: config.minimumRedeemablePoints,
    minimumCartValue: config.minimumCartValue,
    expiringSoon: nearestExpiringLot ? {
      points: nearestExpiringLot.remainingPoints,
      expiresAt: nearestExpiringLot.expiresAt
    } : null
  };
}

/**
 * Check if the customer can redeem Yogis Points on the current cart
 */
async function checkRedemptionEligibility(userId, cartOfferPriceSum, couponDiscount = 0, prismaClient = prisma) {
  const config = await getPointsConfig(prismaClient);

  if (!config.enabled) {
    return {
      eligible: false,
      reason: 'Yogis Points feature is disabled',
      config
    };
  }

  if (cartOfferPriceSum < config.minimumCartValue) {
    return {
      eligible: false,
      reason: `Cart value must be at least ₹${config.minimumCartValue} to redeem Yogis Points`,
      minCartValue: config.minimumCartValue,
      currentCartValue: cartOfferPriceSum,
      config
    };
  }

  if (!userId) {
    return {
      eligible: false,
      reason: 'Please log in to redeem Yogis Points',
      config
    };
  }

  const summary = await getUserPointsSummary(userId, prismaClient);
  if (!summary || summary.balance < config.minimumRedeemablePoints) {
    return {
      eligible: false,
      reason: `At least ${config.minimumRedeemablePoints} Yogis Points required to redeem (You have ${summary ? summary.balance : 0})`,
      availablePoints: summary ? summary.balance : 0,
      minPoints: config.minimumRedeemablePoints,
      config
    };
  }

  // Points can discount up to remaining offer price sum after coupon
  const maxPossibleDiscount = Math.max(0, cartOfferPriceSum - couponDiscount);
  if (maxPossibleDiscount <= 0) {
    return {
      eligible: false,
      reason: 'Order is already fully discounted',
      config
    };
  }

  const perPointValue = config.conversionRupees / config.conversionPoints;
  const fullPointsValue = Math.round(summary.balance * perPointValue * 100) / 100;

  // Safe capping logic (Requirements 5 & 6):
  // When redeemed, ALL available points are used, safely capped to max possible discount
  let pointsToUse = summary.balance;
  let pointsDiscount = fullPointsValue;

  if (fullPointsValue > maxPossibleDiscount) {
    pointsToUse = Math.min(summary.balance, Math.ceil(maxPossibleDiscount / perPointValue));
    pointsDiscount = Math.min(maxPossibleDiscount, Math.round(pointsToUse * perPointValue * 100) / 100);
  }

  return {
    eligible: true,
    availablePoints: summary.balance,
    pointsToUse,
    pointsDiscount,
    perPointValue,
    config
  };
}

/**
 * Atomically redeem Yogis Points during order placement
 * Employs PostgreSQL row-level locking (SELECT ... FOR UPDATE) to prevent double spending
 */
async function redeemPointsAtomic(userId, orderId, pointsToRedeem, discountAmount, tx) {
  if (!pointsToRedeem || pointsToRedeem <= 0) return { success: true, redeemed: 0 };

  // 1. Lock the account row in Postgres
  await tx.$queryRawUnsafe(
    'SELECT * FROM "yogis_points_accounts" WHERE "user_id" = $1 FOR UPDATE',
    userId
  );

  const now = new Date();

  // 2. Fetch active unexpired lots ordered by expiresAt ASC (FEFO)
  const lots = await tx.yogisPointsLot.findMany({
    where: {
      userId,
      remainingPoints: { gt: 0 },
      OR: [
        { expiresAt: { gt: now } },
        { expiresAt: null }
      ]
    },
    orderBy: [
      { expiresAt: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  const totalAvailable = lots.reduce((sum, l) => sum + l.remainingPoints, 0);
  if (totalAvailable < pointsToRedeem) {
    throw new Error(`Insufficient Yogis Points. Available: ${totalAvailable}, Requested: ${pointsToRedeem}`);
  }

  // 3. Consume lots FEFO
  let remainingToConsume = pointsToRedeem;
  for (const lot of lots) {
    if (remainingToConsume <= 0) break;
    const deduct = Math.min(lot.remainingPoints, remainingToConsume);
    await tx.yogisPointsLot.update({
      where: { id: lot.id },
      data: { remainingPoints: lot.remainingPoints - deduct }
    });
    remainingToConsume -= deduct;
  }

  // 4. Update account balance
  const account = await tx.yogisPointsAccount.update({
    where: { userId },
    data: { balance: { decrement: pointsToRedeem } }
  });

  // 5. Create immutable audit transaction
  await tx.yogisPointsTransaction.create({
    data: {
      userId,
      type: 'REDEEM',
      points: -pointsToRedeem,
      balanceAfter: account.balance,
      orderId,
      description: `Redeemed ${pointsToRedeem} Yogis Points for ₹${discountAmount.toFixed(2)} discount`
    }
  });

  return {
    success: true,
    redeemed: pointsToRedeem,
    newBalance: account.balance
  };
}

/**
 * Award Yogis Points on order completion (status = 'delivered')
 */
async function awardOrderCompletionPoints(orderId, tx = prisma) {
  const order = await tx.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.pointsAwarded) return null;

  const config = await getPointsConfig(tx);
  if (!config.enabled || config.pointsPerOrder <= 0) return null;

  await ensureUserAccount(order.userId, tx);

  // Row lock
  await tx.$queryRawUnsafe(
    'SELECT * FROM "yogis_points_accounts" WHERE "user_id" = $1 FOR UPDATE',
    order.userId
  );

  const expiryDate = calculateExpiryDate(config);
  const account = await tx.yogisPointsAccount.update({
    where: { userId: order.userId },
    data: { balance: { increment: config.pointsPerOrder } }
  });

  const transaction = await tx.yogisPointsTransaction.create({
    data: {
      userId: order.userId,
      type: 'ORDER_EARN',
      points: config.pointsPerOrder,
      balanceAfter: account.balance,
      orderId: order.id,
      description: `Earned ${config.pointsPerOrder} Yogis Points on delivery of Order #${order.orderNumber}`,
      expiresAt: expiryDate
    }
  });

  await tx.yogisPointsLot.create({
    data: {
      userId: order.userId,
      transactionId: transaction.id,
      originalPoints: config.pointsPerOrder,
      remainingPoints: config.pointsPerOrder,
      expiresAt: expiryDate
    }
  });

  await tx.order.update({
    where: { id: order.id },
    data: { pointsAwarded: true }
  });

  return {
    awarded: true,
    points: config.pointsPerOrder,
    newBalance: account.balance
  };
}

/**
 * Reverse points when an order is cancelled or refunded
 * - If order used points: restores redeemed points to user with validity
 * - If order earned points: reverses credited points
 */
async function reverseOrderPoints(orderId, tx = prisma) {
  const order = await tx.order.findUnique({
    where: { id: orderId }
  });

  if (!order) return null;

  const config = await getPointsConfig(tx);
  await ensureUserAccount(order.userId, tx);

  // Row lock
  await tx.$queryRawUnsafe(
    'SELECT * FROM "yogis_points_accounts" WHERE "user_id" = $1 FOR UPDATE',
    order.userId
  );

  const results = { restored: 0, deducted: 0 };

  // 1. If points were used on this order, restore them
  if (order.yogisPointsUsed > 0) {
    const existingRestoration = await tx.yogisPointsTransaction.findFirst({
      where: {
        orderId: order.id,
        type: 'REFUND_REVERSAL',
        points: { gt: 0 }
      }
    });

    if (!existingRestoration) {
      const expiryDate = calculateExpiryDate(config);
      const account = await tx.yogisPointsAccount.update({
        where: { userId: order.userId },
        data: { balance: { increment: order.yogisPointsUsed } }
      });

      const restoreTx = await tx.yogisPointsTransaction.create({
        data: {
          userId: order.userId,
          type: 'REFUND_REVERSAL',
          points: order.yogisPointsUsed,
          balanceAfter: account.balance,
          orderId: order.id,
          description: `Restored ${order.yogisPointsUsed} Yogis Points from cancelled/refunded Order #${order.orderNumber}`,
          expiresAt: expiryDate
        }
      });

      await tx.yogisPointsLot.create({
        data: {
          userId: order.userId,
          transactionId: restoreTx.id,
          originalPoints: order.yogisPointsUsed,
          remainingPoints: order.yogisPointsUsed,
          expiresAt: expiryDate
        }
      });

      results.restored = order.yogisPointsUsed;
    }
  }

  // 2. If points were awarded for order completion, reverse them
  if (order.pointsAwarded) {
    const existingDeduction = await tx.yogisPointsTransaction.findFirst({
      where: {
        orderId: order.id,
        type: 'REFUND_REVERSAL',
        points: { lt: 0 }
      }
    });

    if (!existingDeduction) {
      const earnTx = await tx.yogisPointsTransaction.findFirst({
        where: {
          orderId: order.id,
          type: 'ORDER_EARN'
        },
        include: { lots: true }
      });

      const pointsToReverse = earnTx ? earnTx.points : config.pointsPerOrder;

      // Cancel the remaining points in the lot created for this order
      if (earnTx && earnTx.lots && earnTx.lots.length) {
        for (const lot of earnTx.lots) {
          await tx.yogisPointsLot.update({
            where: { id: lot.id },
            data: { remainingPoints: 0 }
          });
        }
      }

      const account = await tx.yogisPointsAccount.findUnique({
        where: { userId: order.userId }
      });

      const newBalance = Math.max(0, account.balance - pointsToReverse);
      await tx.yogisPointsAccount.update({
        where: { userId: order.userId },
        data: { balance: newBalance }
      });

      await tx.yogisPointsTransaction.create({
        data: {
          userId: order.userId,
          type: 'REFUND_REVERSAL',
          points: -pointsToReverse,
          balanceAfter: newBalance,
          orderId: order.id,
          description: `Reversed ${pointsToReverse} earned Yogis Points due to cancellation/refund of Order #${order.orderNumber}`
        }
      });

      await tx.order.update({
        where: { id: order.id },
        data: { pointsAwarded: false }
      });

      results.deducted = pointsToReverse;
    }
  }

  return results;
}

/**
 * Award welcome bonus to eligible new customer
 * Guaranteed to be issued at most once per user
 */
async function awardWelcomeBonus(userId, tx = prisma) {
  if (!userId) return null;

  const config = await getPointsConfig(tx);
  if (!config.enabled || !config.welcomeBonusEnabled || config.welcomeBonusPoints <= 0) {
    return null;
  }

  // Check if welcome bonus already given to this user
  const existingBonus = await tx.yogisPointsTransaction.findFirst({
    where: {
      userId,
      type: 'WELCOME_BONUS'
    }
  });

  if (existingBonus) return null;

  await ensureUserAccount(userId, tx);

  // Row lock
  await tx.$queryRawUnsafe(
    'SELECT * FROM "yogis_points_accounts" WHERE "user_id" = $1 FOR UPDATE',
    userId
  );

  const expiryDate = calculateExpiryDate(config);
  const account = await tx.yogisPointsAccount.update({
    where: { userId },
    data: { balance: { increment: config.welcomeBonusPoints } }
  });

  const transaction = await tx.yogisPointsTransaction.create({
    data: {
      userId,
      type: 'WELCOME_BONUS',
      points: config.welcomeBonusPoints,
      balanceAfter: account.balance,
      description: `Welcome Bonus of ${config.welcomeBonusPoints} Yogis Points credited!`,
      expiresAt: expiryDate
    }
  });

  await tx.yogisPointsLot.create({
    data: {
      userId,
      transactionId: transaction.id,
      originalPoints: config.welcomeBonusPoints,
      remainingPoints: config.welcomeBonusPoints,
      expiresAt: expiryDate
    }
  });

  return {
    awarded: true,
    points: config.welcomeBonusPoints,
    newBalance: account.balance
  };
}

/**
 * Admin manual adjustment
 */
async function adminAdjustPoints(userId, points, description, adminId, tx = prisma) {
  const pts = parseInt(points, 10);
  if (isNaN(pts) || pts === 0) throw new Error('Points adjustment must be a non-zero integer');

  await ensureUserAccount(userId, tx);

  await tx.$queryRawUnsafe(
    'SELECT * FROM "yogis_points_accounts" WHERE "user_id" = $1 FOR UPDATE',
    userId
  );

  const account = await tx.yogisPointsAccount.findUnique({ where: { userId } });
  const newBalance = Math.max(0, account.balance + pts);

  await tx.yogisPointsAccount.update({
    where: { userId },
    data: { balance: newBalance }
  });

  const config = await getPointsConfig(tx);
  const expiryDate = pts > 0 ? calculateExpiryDate(config) : null;

  const transaction = await tx.yogisPointsTransaction.create({
    data: {
      userId,
      type: 'ADMIN_ADJUSTMENT',
      points: pts,
      balanceAfter: newBalance,
      description: description || `Admin manual points adjustment (${pts > 0 ? '+' : ''}${pts})`,
      expiresAt: expiryDate
    }
  });

  if (pts > 0) {
    await tx.yogisPointsLot.create({
      data: {
        userId,
        transactionId: transaction.id,
        originalPoints: pts,
        remainingPoints: pts,
        expiresAt: expiryDate
      }
    });
  } else {
    // If deducting, consume lots FEFO
    let toDeduct = Math.abs(pts);
    const activeLots = await tx.yogisPointsLot.findMany({
      where: { userId, remainingPoints: { gt: 0 } },
      orderBy: { expiresAt: 'asc' }
    });
    for (const lot of activeLots) {
      if (toDeduct <= 0) break;
      const d = Math.min(lot.remainingPoints, toDeduct);
      await tx.yogisPointsLot.update({
        where: { id: lot.id },
        data: { remainingPoints: lot.remainingPoints - d }
      });
      toDeduct -= d;
    }
  }

  return { success: true, balance: newBalance };
}

module.exports = {
  getPointsConfig,
  updatePointsConfig,
  calculateExpiryDate,
  calculateRupeeValue,
  getUserPointsSummary,
  processExpiryForUser,
  checkRedemptionEligibility,
  redeemPointsAtomic,
  awardOrderCompletionPoints,
  reverseOrderPoints,
  awardWelcomeBonus,
  adminAdjustPoints
};
