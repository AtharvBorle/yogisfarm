const assert = require('assert');
const prisma = require('../src/db');
const {
  getPointsConfig,
  updatePointsConfig,
  getUserPointsSummary,
  generateUniqueReferralCode,
  getOrCreateUserReferralCode,
  validateReferralCode,
  processNewCustomerSignup,
  getUserReferralSummary,
  getAdminReferralHistory
} = require('../src/utils/yogisPoints');

async function runReferralTests() {
  console.log('🧪 Starting Refer & Earn Comprehensive Test Suite...\n');

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

  // Clean up any existing test accounts
  const testPhoneReferrer = '9888811111';
  const testPhoneReferred1 = '9888822222';
  const testPhoneReferred2 = '9888833333';
  const testPhones = [testPhoneReferrer, testPhoneReferred1, testPhoneReferred2];

  for (const ph of testPhones) {
    const u = await prisma.user.findUnique({ where: { phone: ph } });
    if (u) {
      await prisma.referral.deleteMany({
        where: { OR: [{ referrerUserId: u.id }, { referredUserId: u.id }] }
      });
      await prisma.yogisPointsLot.deleteMany({ where: { userId: u.id } });
      await prisma.yogisPointsTransaction.deleteMany({ where: { userId: u.id } });
      await prisma.yogisPointsAccount.deleteMany({ where: { userId: u.id } });
      await prisma.user.delete({ where: { id: u.id } });
    }
  }

  // 1. Yogis Points Dependency Rules
  await test('Rule 1: Refer & Earn cannot be enabled when Yogis Points is OFF', async () => {
    // Turn points OFF
    await updatePointsConfig({ enabled: false, referralEnabled: false });

    // Attempt to turn referral ON while points is OFF
    await assert.rejects(
      async () => updatePointsConfig({ referralEnabled: true }),
      /Cannot enable Refer & Earn while Yogis Points is disabled/
    );
  });

  await test('Rule 2: Disabling Yogis Points automatically forces Refer & Earn to OFF', async () => {
    // Enable points first, then referral
    await updatePointsConfig({ enabled: true, referralEnabled: true });
    let current = await getPointsConfig();
    assert.strictEqual(current.enabled, true);
    assert.strictEqual(current.referralEnabled, true);

    // Disable points
    const updated = await updatePointsConfig({ enabled: false });
    assert.strictEqual(updated.enabled, false, 'Points is now OFF');
    assert.strictEqual(updated.referralEnabled, false, 'Refer & Earn must automatically become OFF');
  });

  await test('Rule 3: Config-driven rewards and settings can be updated dynamically', async () => {
    // Re-enable points and referral
    const config = await updatePointsConfig({
      enabled: true,
      referralEnabled: true,
      referrerRewardPoints: 150,
      referredRewardPoints: 75,
      conversionPoints: 100,
      conversionRupees: 20
    });

    assert.strictEqual(config.referralEnabled, true);
    assert.strictEqual(config.referrerRewardPoints, 150);
    assert.strictEqual(config.referredRewardPoints, 75);
    assert.strictEqual(config.conversionPoints, 100);
    assert.strictEqual(config.conversionRupees, 20);
  });

  // 2. Referral Code Generation & Idempotence
  let referrerUser;
  await test('Rule 4: Generates unique formatted referral code for customer', async () => {
    referrerUser = await prisma.user.create({
      data: {
        name: 'Akash Demo',
        phone: testPhoneReferrer,
        email: 'akash.demo@example.com'
      }
    });

    const code1 = await getOrCreateUserReferralCode(referrerUser.id);
    assert.ok(code1, 'Referral code should be generated');
    assert.ok(code1.startsWith('AKASH-'), 'Code should incorporate user name prefix');

    // Idempotent call returns identical code
    const code2 = await getOrCreateUserReferralCode(referrerUser.id);
    assert.strictEqual(code1, code2, 'Subsequent fetch must return the exact same referral code');
  });

  // 3. Validation Rules
  await test('Rule 5: Self-referral is strictly prevented', async () => {
    const code = await getOrCreateUserReferralCode(referrerUser.id);
    const result = await validateReferralCode(code, referrerUser.id);
    assert.strictEqual(result.valid, false, 'Self-referral must be invalid');
    assert.strictEqual(result.reason, 'SELF_REFERRAL');
  });

  await test('Rule 6: Non-existent referral codes are rejected', async () => {
    const result = await validateReferralCode('NONEXISTENT9999');
    assert.strictEqual(result.valid, false, 'Unknown code must be invalid');
    assert.strictEqual(result.reason, 'INVALID_CODE');
  });

  // 4. New Customer Signup Trigger (Instant, No Order Required)
  let referredUser1;
  await test('Rule 7: Referral rewards awarded immediately on new customer registration (No order needed)', async () => {
    // Set config to: Referrer = 100, Referred = 50, Welcome = 100
    await updatePointsConfig({
      enabled: true,
      referralEnabled: true,
      referrerRewardPoints: 100,
      referredRewardPoints: 50,
      welcomeBonusEnabled: true,
      welcomeBonusPoints: 100
    });

    // Create new customer awaiting details
    referredUser1 = await prisma.user.create({
      data: {
        phone: testPhoneReferred1
      }
    });

    const referrerCode = await getOrCreateUserReferralCode(referrerUser.id);

    // Initial referrer balance
    const initialReferrerSum = await getUserPointsSummary(referrerUser.id);
    assert.strictEqual(initialReferrerSum.balance, 0);

    // Process new customer signup with referral code
    const signupResult = await processNewCustomerSignup({
      userId: referredUser1.id,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      referralCode: referrerCode
    });

    assert.strictEqual(signupResult.success, true);
    assert.ok(signupResult.referral, 'Referral record must be created');
    assert.strictEqual(signupResult.referral.status, 'REWARDED');
    assert.strictEqual(signupResult.referral.referrerRewardPoints, 100);
    assert.strictEqual(signupResult.referral.referredRewardPoints, 50);

    // Referrer balance check: Must have +100
    const referrerSummary = await getUserPointsSummary(referrerUser.id);
    assert.strictEqual(referrerSummary.balance, 100, 'Referrer must receive 100 points');

    // Referred friend balance check: Must have 50 (referral) + 100 (welcome bonus) = 150 points
    const referredSummary = await getUserPointsSummary(referredUser1.id);
    assert.strictEqual(referredSummary.balance, 150, 'Referred user must receive 50 referral + 100 welcome bonus = 150 points');

    // Check transactions for referred friend: Must have separate transactions
    const transactions = await prisma.yogisPointsTransaction.findMany({
      where: { userId: referredUser1.id },
      orderBy: { createdAt: 'asc' }
    });
    assert.strictEqual(transactions.length, 2, 'Must have 2 separate transactions');
    const types = transactions.map(t => t.type);
    assert.ok(types.includes('REFERRAL_REWARD_REFERRED'), 'Must include REFERRAL_REWARD_REFERRED');
    assert.ok(types.includes('WELCOME_BONUS'), 'Must include WELCOME_BONUS');
  });

  // 5. Duplicate Attribution Prevention
  await test('Rule 8: An existing customer cannot be referred a second time', async () => {
    const referrerCode = await getOrCreateUserReferralCode(referrerUser.id);
    
    // Attempt to refer the already completed customer again
    await assert.rejects(
      async () => processNewCustomerSignup({
        userId: referredUser1.id,
        name: 'Priya Sharma Updated',
        email: 'priya.updated@example.com',
        referralCode: referrerCode
      }),
      /already been issued/
    );

    // Balances must remain unchanged
    const referrerSummary = await getUserPointsSummary(referrerUser.id);
    assert.strictEqual(referrerSummary.balance, 100, 'Referrer points must not duplicate');
  });

  // 6. User Summary & Masking for Privacy
  await test('Rule 9: getUserReferralSummary produces privacy-masked friend info and totals', async () => {
    const summary = await getUserReferralSummary(referrerUser.id);
    assert.strictEqual(summary.totalReferrals, 1);
    assert.strictEqual(summary.totalEarnedPoints, 100);
    assert.strictEqual(summary.referrals.length, 1);

    const refItem = summary.referrals[0];
    assert.strictEqual(refItem.maskedName, 'Priya S.', 'Name must be masked for privacy (First L.)');
    assert.ok(refItem.maskedEmail.includes('***'), 'Email must be masked');
    assert.strictEqual(refItem.status, 'Joined');
    assert.strictEqual(refItem.points, 100);
  });

  // 7. Admin History & Aggregation
  await test('Rule 10: getAdminReferralHistory aggregates metrics correctly', async () => {
    const adminHistory = await getAdminReferralHistory({ page: 1, limit: 10 });
    assert.ok(adminHistory.referrals.length >= 1);
    assert.ok(adminHistory.metrics.totalReferrals >= 1);
    assert.ok(adminHistory.metrics.totalReferrerPoints >= 100);
    assert.ok(adminHistory.metrics.totalReferredPoints >= 50);
  });

  // Cleanup test users
  for (const ph of testPhones) {
    const u = await prisma.user.findUnique({ where: { phone: ph } });
    if (u) {
      await prisma.referral.deleteMany({
        where: { OR: [{ referrerUserId: u.id }, { referredUserId: u.id }] }
      });
      await prisma.yogisPointsLot.deleteMany({ where: { userId: u.id } });
      await prisma.yogisPointsTransaction.deleteMany({ where: { userId: u.id } });
      await prisma.yogisPointsAccount.deleteMany({ where: { userId: u.id } });
      await prisma.user.delete({ where: { id: u.id } });
    }
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passedTests}/${totalTests} Tests Passed`);
  console.log(`========================================\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All Refer & Earn backend tests passed flawlessly!');
  } else {
    process.exit(1);
  }
}

runReferralTests()
  .catch(err => {
    console.error('Fatal Referral Test Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
