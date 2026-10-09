const assert = require('assert');
const prisma = require('../src/db');
const {
  getPointsConfig,
  updatePointsConfig,
  getUserPointsSummary,
  checkRedemptionEligibility,
  redeemPointsAtomic,
  awardOrderCompletionPoints,
  reverseOrderPoints,
  awardWelcomeBonus,
  calculateExpiryDate,
  calculateRupeeValue
} = require('../src/utils/yogisPoints');
const { calculateOrderTotals } = require('../src/utils/pricing');

async function runTests() {
  console.log('🧪 Starting Yogis Points Comprehensive Test Suite...\n');

  let passedTests = 0;
  let totalTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // Helper to create or clean dummy user
  const testPhone = '9999999999';
  let testUser = await prisma.user.findUnique({ where: { phone: testPhone } });
  if (testUser) {
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.deleteMany({ where: { userId: testUser.id } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: testUser.id } } });
    await prisma.order.deleteMany({ where: { userId: testUser.id } });
    await prisma.cart.deleteMany({ where: { userId: testUser.id } });
  } else {
    testUser = await prisma.user.create({
      data: {
        name: 'Test Customer',
        phone: testPhone,
        email: 'testcustomer@example.com'
      }
    });
  }

  // Helper product setup
  let testTax = await prisma.tax.findFirst({ where: { name: 'GST 5%' } });
  if (!testTax) {
    testTax = await prisma.tax.create({ data: { name: 'GST 5%', tax: 5, status: 'active' } });
  }

  let testProduct = await prisma.product.findFirst({ where: { slug: 'test-points-product' } });
  if (!testProduct) {
    testProduct = await prisma.product.create({
      data: {
        name: 'Organic Honey 500g',
        slug: 'test-points-product',
        taxId: testTax.id,
        status: 'active'
      }
    });
  }

  let testVariant = await prisma.productVariant.findFirst({ where: { productId: testProduct.id } });
  if (!testVariant) {
    testVariant = await prisma.productVariant.create({
      data: {
        productId: testProduct.id,
        name: '500g',
        price: 500.00,
        salePrice: 400.00,
        stock: 100
      }
    });
  }

  // ─── TEST 1: Configuration Management & Dynamic Conversion ───
  await test('1. Config updates and dynamic conversion calculations', async () => {
    // Reset config
    const config = await updatePointsConfig({
      enabled: true,
      pointsPerOrder: 20,
      conversionPoints: 50,
      conversionRupees: 25.00, // 50 pts = ₹25 (₹0.50 per point)
      minimumRedeemablePoints: 100,
      minimumCartValue: 500.00,
      expiryEnabled: true,
      expiryValue: 6,
      expiryUnit: 'months',
      welcomeBonusEnabled: true,
      welcomeBonusPoints: 100
    });

    assert.strictEqual(config.enabled, true);
    assert.strictEqual(config.pointsPerOrder, 20);
    assert.strictEqual(config.conversionPoints, 50);
    assert.strictEqual(config.conversionRupees, 25.00);
    assert.strictEqual(config.minimumRedeemablePoints, 100);
    assert.strictEqual(config.minimumCartValue, 500.00);
    assert.strictEqual(config.expiryUnit, 'months');

    // Test conversion calculation: 100 points should equal ₹50
    const val1 = calculateRupeeValue(100, config);
    assert.strictEqual(val1, 50);

    // Test conversion calculation: 200 points should equal ₹100
    const val2 = calculateRupeeValue(200, config);
    assert.strictEqual(val2, 100);
  });

  // ─── TEST 2: Welcome Bonus & Single-Issue Enforcement ───
  await test('2. Welcome bonus issuance and idempotency', async () => {
    // Clean user points
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.deleteMany({ where: { userId: testUser.id } });

    // First issue
    const bonusResult = await awardWelcomeBonus(testUser.id);
    assert.ok(bonusResult);
    assert.strictEqual(bonusResult.awarded, true);
    assert.strictEqual(bonusResult.points, 100);

    const summary1 = await getUserPointsSummary(testUser.id);
    assert.strictEqual(summary1.balance, 100);
    assert.strictEqual(summary1.rupeeValue, 50); // 100 pts * 0.5 = ₹50

    // Attempt second issue (must be rejected)
    const duplicateBonus = await awardWelcomeBonus(testUser.id);
    assert.strictEqual(duplicateBonus, null);

    const summary2 = await getUserPointsSummary(testUser.id);
    assert.strictEqual(summary2.balance, 100, 'Balance must remain 100 without duplicate bonus');
  });

  // ─── TEST 3: FEFO (First Expiring, First Out) Lot Consumption ───
  await test('3. FEFO lot consumption logic', async () => {
    // Clean user points
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.deleteMany({ where: { userId: testUser.id } });

    await prisma.yogisPointsAccount.create({ data: { userId: testUser.id, balance: 300 } });

    // Create 3 batches with different expiry dates:
    // Batch 1: 100 pts expiring in 10 days
    // Batch 2: 100 pts expiring in 30 days
    // Batch 3: 100 pts expiring in 60 days
    const now = Date.now();
    const exp1 = new Date(now + 10 * 86400000);
    const exp2 = new Date(now + 30 * 86400000);
    const exp3 = new Date(now + 60 * 86400000);

    const tx1 = await prisma.yogisPointsTransaction.create({
      data: { userId: testUser.id, type: 'ORDER_EARN', points: 100, balanceAfter: 100, expiresAt: exp1 }
    });
    const lot1 = await prisma.yogisPointsLot.create({
      data: { userId: testUser.id, transactionId: tx1.id, originalPoints: 100, remainingPoints: 100, expiresAt: exp1 }
    });

    const tx2 = await prisma.yogisPointsTransaction.create({
      data: { userId: testUser.id, type: 'ORDER_EARN', points: 100, balanceAfter: 200, expiresAt: exp2 }
    });
    const lot2 = await prisma.yogisPointsLot.create({
      data: { userId: testUser.id, transactionId: tx2.id, originalPoints: 100, remainingPoints: 100, expiresAt: exp2 }
    });

    const tx3 = await prisma.yogisPointsTransaction.create({
      data: { userId: testUser.id, type: 'ORDER_EARN', points: 100, balanceAfter: 300, expiresAt: exp3 }
    });
    const lot3 = await prisma.yogisPointsLot.create({
      data: { userId: testUser.id, transactionId: tx3.id, originalPoints: 100, remainingPoints: 100, expiresAt: exp3 }
    });

    // Now redeem 150 points.
    // Must consume all 100 points of Batch 1, and 50 points of Batch 2.
    // Batch 3 must remain untouched (100 pts).
    await prisma.$transaction(async (tx) => {
      await redeemPointsAtomic(testUser.id, null, 150, 75.00, tx);
    });

    const updatedLot1 = await prisma.yogisPointsLot.findUnique({ where: { id: lot1.id } });
    const updatedLot2 = await prisma.yogisPointsLot.findUnique({ where: { id: lot2.id } });
    const updatedLot3 = await prisma.yogisPointsLot.findUnique({ where: { id: lot3.id } });

    assert.strictEqual(updatedLot1.remainingPoints, 0, 'Lot 1 must be fully consumed');
    assert.strictEqual(updatedLot2.remainingPoints, 50, 'Lot 2 must have 50 remaining');
    assert.strictEqual(updatedLot3.remainingPoints, 100, 'Lot 3 must remain completely intact');

    const summary = await getUserPointsSummary(testUser.id);
    assert.strictEqual(summary.balance, 150, 'Remaining balance must be 150');
  });

  // ─── TEST 4: Points Expiry Processing ───
  await test('4. Points expiry evaluation and exclusion', async () => {
    // Clean user points
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.deleteMany({ where: { userId: testUser.id } });

    await prisma.yogisPointsAccount.create({ data: { userId: testUser.id, balance: 200 } });

    // Create 1 expired lot (expired yesterday) and 1 valid lot (expires in 10 days)
    const yesterday = new Date(Date.now() - 86400000);
    const futureDate = new Date(Date.now() + 10 * 86400000);

    const txExpired = await prisma.yogisPointsTransaction.create({
      data: { userId: testUser.id, type: 'ORDER_EARN', points: 80, balanceAfter: 80, expiresAt: yesterday }
    });
    await prisma.yogisPointsLot.create({
      data: { userId: testUser.id, transactionId: txExpired.id, originalPoints: 80, remainingPoints: 80, expiresAt: yesterday }
    });

    const txValid = await prisma.yogisPointsTransaction.create({
      data: { userId: testUser.id, type: 'ORDER_EARN', points: 120, balanceAfter: 200, expiresAt: futureDate }
    });
    await prisma.yogisPointsLot.create({
      data: { userId: testUser.id, transactionId: txValid.id, originalPoints: 120, remainingPoints: 120, expiresAt: futureDate }
    });

    // Calling getUserPointsSummary should automatically process expiry
    const summary = await getUserPointsSummary(testUser.id);
    assert.strictEqual(summary.balance, 120, 'Expired points must be deducted, leaving 120');

    // Check expiry transaction exists
    const expiryTx = await prisma.yogisPointsTransaction.findFirst({
      where: { userId: testUser.id, type: 'EXPIRY' }
    });
    assert.ok(expiryTx, 'Expiry audit transaction must be created');
    assert.strictEqual(expiryTx.points, -80);
    assert.strictEqual(expiryTx.balanceAfter, 120);
  });

  // ─── TEST 5: Minimum Points and Cart Value Validation ───
  await test('5. Redemption eligibility constraints (Minimum Points & Cart Value)', async () => {
    // Config: min 100 points, min cart ₹500
    await updatePointsConfig({
      enabled: true,
      minimumRedeemablePoints: 100,
      minimumCartValue: 500.00,
      conversionPoints: 100,
      conversionRupees: 100.00
    });

    // Case A: Cart value below minimum (₹300 < ₹500)
    const resA = await checkRedemptionEligibility(testUser.id, 300, 0);
    assert.strictEqual(resA.eligible, false);
    assert.ok(resA.reason.includes('500'));

    // Case B: User balance below minimum (give user only 50 points)
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.update({ where: { userId: testUser.id }, data: { balance: 50 } });
    await prisma.yogisPointsLot.create({
      data: {
        userId: testUser.id,
        transactionId: (await prisma.yogisPointsTransaction.create({
          data: { userId: testUser.id, type: 'ORDER_EARN', points: 50, balanceAfter: 50 }
        })).id,
        originalPoints: 50,
        remainingPoints: 50,
        expiresAt: new Date(Date.now() + 86400000)
      }
    });

    const resB = await checkRedemptionEligibility(testUser.id, 600, 0);
    assert.strictEqual(resB.eligible, false);
    assert.ok(resB.reason.includes('100'));

    // Case C: Eligible (Cart ₹600 >= ₹500, User points 150 >= 100)
    await prisma.yogisPointsAccount.update({ where: { userId: testUser.id }, data: { balance: 150 } });
    await prisma.yogisPointsLot.create({
      data: {
        userId: testUser.id,
        transactionId: (await prisma.yogisPointsTransaction.create({
          data: { userId: testUser.id, type: 'ORDER_EARN', points: 100, balanceAfter: 150 }
        })).id,
        originalPoints: 100,
        remainingPoints: 100,
        expiresAt: new Date(Date.now() + 86400000)
      }
    });

    const resC = await checkRedemptionEligibility(testUser.id, 600, 0);
    assert.strictEqual(resC.eligible, true);
    assert.strictEqual(resC.availablePoints, 150);
    assert.strictEqual(resC.pointsToUse, 150);
    assert.strictEqual(resC.pointsDiscount, 150); // 150 pts = ₹150
  });

  // ─── TEST 6: Safe Capping (Never Exceed Order Value) ───
  await test('6. Safe capping prevents negative order totals', async () => {
    // Give user 1000 points (₹1000 value), but cart is only ₹400 after coupon
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.update({ where: { userId: testUser.id }, data: { balance: 1000 } });
    await prisma.yogisPointsLot.create({
      data: {
        userId: testUser.id,
        transactionId: (await prisma.yogisPointsTransaction.create({
          data: { userId: testUser.id, type: 'ORDER_EARN', points: 1000, balanceAfter: 1000 }
        })).id,
        originalPoints: 1000,
        remainingPoints: 1000,
        expiresAt: new Date(Date.now() + 86400000)
      }
    });

    const res = await checkRedemptionEligibility(testUser.id, 600, 200); // 600 - 200 coupon = 400 net
    assert.strictEqual(res.eligible, true);
    assert.strictEqual(res.pointsDiscount, 400, 'Discount must be safely capped to ₹400');
    assert.strictEqual(res.pointsToUse, 400, 'Points used must be capped to 400 points');
  });

  // ─── TEST 7: Global Toggle Feature ON/OFF ───
  await test('7. Global toggle OFF hides and blocks points', async () => {
    await updatePointsConfig({ enabled: false });

    const eligibility = await checkRedemptionEligibility(testUser.id, 1000, 0);
    assert.strictEqual(eligibility.eligible, false);
    assert.strictEqual(eligibility.reason, 'Yogis Points feature is disabled');

    // Restore to ON for subsequent tests
    await updatePointsConfig({ enabled: true });
  });

  // ─── TEST 8: GST Platform Discount Integration & Line Item Split ───
  await test('8. Pricing engine treats Yogis Points as Platform Discount with GST rebuild assertion', async () => {
    // Setup cart for test user
    await prisma.cart.deleteMany({ where: { userId: testUser.id } });
    await prisma.cart.create({
      data: {
        userId: testUser.id,
        productId: testProduct.id,
        variantId: testVariant.id,
        quantity: 2 // 2 * ₹400 = ₹800
      }
    });

    // Set points config: 100 pts = ₹100
    await updatePointsConfig({
      enabled: true,
      conversionPoints: 100,
      conversionRupees: 100.00,
      minimumRedeemablePoints: 100,
      minimumCartValue: 500.00
    });

    // Give user 200 points
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.update({ where: { userId: testUser.id }, data: { balance: 200 } });
    await prisma.yogisPointsLot.create({
      data: {
        userId: testUser.id,
        transactionId: (await prisma.yogisPointsTransaction.create({
          data: { userId: testUser.id, type: 'ORDER_EARN', points: 200, balanceAfter: 200 }
        })).id,
        originalPoints: 200,
        remainingPoints: 200,
        expiresAt: new Date(Date.now() + 86400000)
      }
    });

    // Calculate order totals with useYogisPoints = true
    const pricing = await calculateOrderTotals(testUser.id, 'userId', null, true);

    assert.strictEqual(pricing.offerPriceSum, 800);
    assert.strictEqual(pricing.yogisPointsUsed, 200);
    assert.strictEqual(pricing.yogisPointsDiscount, 200);
    assert.strictEqual(pricing.discountType, 'YOGIS_POINTS');

    // Offer sum (800) - Yogis points discount (200) = 600 net item total
    const item = pricing.orderItems[0];
    assert.strictEqual(item.total, 600);
    assert.strictEqual(item.yogisPointsDiscount, 200);

    // Verify GST-inclusive back calculation on the line item
    const rebuiltTax = Math.round((item.taxableValue + item.cgst + item.sgst) * 100) / 100;
    assert.strictEqual(rebuiltTax, item.total, 'Taxable value + CGST + SGST must strictly equal item total');

    // Verify grand total
    const expectedGrandTotal = 600 + pricing.shippingTotal;
    assert.strictEqual(pricing.grandTotal, expectedGrandTotal);
  });

  // ─── TEST 9: Order Completion Point Awarding ───
  await test('9. Award points when order reaches delivered status', async () => {
    await updatePointsConfig({ enabled: true, pointsPerOrder: 15 });

    // Create a mock order
    const orderNumber = 'YF-TEST-AWARD-001';
    await prisma.order.deleteMany({ where: { orderNumber } });

    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        orderNumber,
        subtotal: 500,
        total: 500,
        grandTotal: 500,
        orderStatus: 'placed',
        paymentMethod: 'cod',
        pointsAwarded: false
      }
    });

    const summaryBefore = await getUserPointsSummary(testUser.id);
    const balanceBefore = summaryBefore.balance;

    // Simulate completion
    const awardRes = await awardOrderCompletionPoints(order.id);
    assert.ok(awardRes);
    assert.strictEqual(awardRes.awarded, true);
    assert.strictEqual(awardRes.points, 15);
    assert.strictEqual(awardRes.newBalance, balanceBefore + 15);

    // Verify second call does nothing (idempotency)
    const secondCall = await awardOrderCompletionPoints(order.id);
    assert.strictEqual(secondCall, null);

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    assert.strictEqual(updatedOrder.pointsAwarded, true);
  });

  // ─── TEST 10: Order Cancellation & Refund Reversals ───
  await test('10. Cancellation and refund reversals (restores spent points, reverses earned points)', async () => {
    // Create an order that both spent points AND earned points
    const orderNumber = 'YF-TEST-CANCEL-001';
    await prisma.order.deleteMany({ where: { orderNumber } });

    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        orderNumber,
        subtotal: 500,
        total: 300,
        grandTotal: 300,
        yogisPointsUsed: 50,
        yogisPointsDiscount: 50,
        orderStatus: 'delivered',
        paymentMethod: 'cod',
        pointsAwarded: true
      }
    });

    // Create the earn transaction associated with this order
    const earnTx = await prisma.yogisPointsTransaction.create({
      data: {
        userId: testUser.id,
        type: 'ORDER_EARN',
        points: 15,
        balanceAfter: 15,
        orderId: order.id
      }
    });
    await prisma.yogisPointsLot.create({
      data: {
        userId: testUser.id,
        transactionId: earnTx.id,
        originalPoints: 15,
        remainingPoints: 15
      }
    });

    const balanceBefore = (await getUserPointsSummary(testUser.id)).balance;

    // Trigger reversal
    const reversal = await reverseOrderPoints(order.id);
    assert.strictEqual(reversal.restored, 50, 'Spent 50 points must be restored');
    assert.strictEqual(reversal.deducted, 15, 'Earned 15 points must be deducted');

    const balanceAfter = (await getUserPointsSummary(testUser.id)).balance;
    // Net change: +50 -15 = +35
    assert.strictEqual(balanceAfter, balanceBefore + 35);
  });

  // ─── TEST 11: Concurrent Redemption Lock Verification ───
  await test('11. Atomic row locking prevents concurrent double-spending', async () => {
    // Set user balance to exactly 100 points
    await prisma.yogisPointsLot.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.yogisPointsAccount.update({ where: { userId: testUser.id }, data: { balance: 100 } });
    await prisma.yogisPointsLot.create({
      data: {
        userId: testUser.id,
        transactionId: (await prisma.yogisPointsTransaction.create({
          data: { userId: testUser.id, type: 'ORDER_EARN', points: 100, balanceAfter: 100 }
        })).id,
        originalPoints: 100,
        remainingPoints: 100,
        expiresAt: new Date(Date.now() + 86400000)
      }
    });

    // Simulate two concurrent requests trying to redeem the SAME 100 points
    let successfulRedemptions = 0;
    let failedRedemptions = 0;

    const promise1 = prisma.$transaction(async (tx) => {
      return redeemPointsAtomic(testUser.id, null, 100, 100.00, tx);
    });

    const promise2 = prisma.$transaction(async (tx) => {
      return redeemPointsAtomic(testUser.id, null, 100, 100.00, tx);
    });

    const results = await Promise.allSettled([promise1, promise2]);

    results.forEach(r => {
      if (r.status === 'fulfilled') successfulRedemptions++;
      else failedRedemptions++;
    });

    assert.strictEqual(successfulRedemptions, 1, 'Only one transaction must succeed');
    assert.strictEqual(failedRedemptions, 1, 'Second transaction must fail with insufficient points');

    const finalSummary = await getUserPointsSummary(testUser.id);
    assert.strictEqual(finalSummary.balance, 0, 'Final balance must be exactly 0, never negative');
  });

  console.log(`\n========================================`);
  console.log(`Results: ${passedTests}/${totalTests} Tests Passed`);
  console.log(`========================================\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All Yogis Points backend tests passed flawlessly!');
  } else {
    process.exit(1);
  }
}

runTests()
  .catch(err => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
