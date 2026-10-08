/**
 * Centralized Pricing Engine for YogisFarms
 * 
 * SINGLE SOURCE OF TRUTH for all price calculations.
 * Used by: orders.js (place order), coupons.js (apply coupon), admin.js (order details)
 * 
 * Pricing model: GST-INCLUSIVE (offer prices already include GST)
 */

const prisma = require('../db');

/**
 * ─── UTILITY FUNCTIONS ───
 */

/**
 * Rounds a value to 2 decimal places properly.
 */
function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Allocates order discount proportionally to a line item.
 */
function allocateOrderDiscount(itemTotal, offerPriceSum, discountAmount) {
  if (discountAmount > 0 && offerPriceSum > 0) {
    return (itemTotal / offerPriceSum) * discountAmount;
  }
  return 0;
}

/**
 * Back-calculates taxable value and GST amount from an inclusive price.
 * Formula: Taxable = Inclusive / (1 + Rate/100)
 */
function calculateInclusiveGST(inclusiveAmount, gstRate) {
  const taxableValue = inclusiveAmount / (1 + (gstRate / 100));
  const gstAmount = inclusiveAmount - taxableValue;
  return { taxableValue, gstAmount };
}

/**
 * Splits GST into CGST and SGST without 0.01 mismatch.
 */
function splitGST(gstAmount) {
  const cgst = roundCurrency(gstAmount / 2);
  const sgst = parseFloat((gstAmount - cgst).toFixed(2));
  return { cgst, sgst };
}

/**
 * ─── MAIN PRICING ENGINE ───
 */

/**
 * Evaluate validation constraints and calculate discounts for a given coupon.
 */
async function evaluateCouponForCart(coupon, cartItems, identifier, type, offerPriceSum) {
  const lineDiscounts = Array(cartItems.length).fill(0);
  let discountAmount = 0;
  
  if (!coupon || coupon.status !== 'active') {
    return { isValid: false, discountAmount: 0, lineDiscounts };
  }

  const now = new Date();
  const isStarted = !coupon.startOn || new Date(coupon.startOn) <= now;
  const isNotExpired = !coupon.expireOn || new Date(coupon.expireOn) > now;
  
  let isValid = isStarted && isNotExpired;

  // Validate User Constraints if logged in
  if (isValid && type === 'userId') {
    if (coupon.firstOrdersLimit) {
      const orderCount = await prisma.order.count({
        where: {
          userId: identifier,
          orderStatus: { notIn: ['cancelled', 'failed', 'pending'] }
        }
      });
      if (orderCount >= coupon.firstOrdersLimit) {
        isValid = false;
      }
    }
    if (isValid && coupon.userLimit) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId: identifier,
          couponCode: coupon.code,
          orderStatus: { notIn: ['cancelled', 'failed'] }
        }
      });
      if (userUsageCount >= coupon.userLimit) {
        isValid = false;
      }
    }
  }

  if (!isValid) {
    return { isValid: false, discountAmount: 0, lineDiscounts };
  }

  const parseIds = (str) => {
    if (!str || str.trim() === '') return [];
    return str.split(',').map(id => parseInt(id.trim())).filter(Boolean);
  };

  const matchesCriteria = (item, productIds, categoryIds, brandIds) => {
    const hasProductCriteria = productIds && productIds.length > 0;
    const hasCategoryCriteria = categoryIds && categoryIds.length > 0;
    const hasBrandCriteria = brandIds && brandIds.length > 0;
    
    if (!hasProductCriteria && !hasCategoryCriteria && !hasBrandCriteria) {
      return true;
    }
    if (hasProductCriteria && productIds.includes(item.productId)) return true;
    if (hasCategoryCriteria && item.product.categoryId && categoryIds.includes(item.product.categoryId)) return true;
    if (hasBrandCriteria && item.product.brandId && brandIds.includes(item.product.brandId)) return true;
    return false;
  };

  if (coupon.isBogo) {
    const buyProductIds = parseIds(coupon.buyProductIds);
    const buyCategoryIds = parseIds(coupon.buyCategoryIds);
    const buyBrandIds = parseIds(coupon.buyBrandIds);
    
    const getProductIds = parseIds(coupon.getProductIds);
    const getCategoryIds = parseIds(coupon.getCategoryIds);
    const getBrandIds = parseIds(coupon.getBrandIds);
    
    const buyQuantity = coupon.buyQuantity || 1;
    const getQuantity = coupon.getQuantity || 1;
    
    const isGetEmpty = getProductIds.length === 0 && getCategoryIds.length === 0 && getBrandIds.length === 0;

    let effectiveGetProductIds = getProductIds;
    let effectiveGetCategoryIds = getCategoryIds;
    let effectiveGetBrandIds = getBrandIds;
    if (isGetEmpty) {
      effectiveGetProductIds = buyProductIds;
      effectiveGetCategoryIds = buyCategoryIds;
      effectiveGetBrandIds = buyBrandIds;
    }

    // Build flat list of all units in the cart
    const allUnits = [];
    cartItems.forEach((item, index) => {
      const offerPrice = item.variant
        ? parseFloat(item.variant.salePrice || item.variant.price)
        : parseFloat(item.product.salePrice || item.product.price);
      for (let i = 0; i < item.quantity; i++) {
        allUnits.push({
          price: offerPrice,
          cartItemIndex: index,
          matchesBuy: matchesCriteria(item, buyProductIds, buyCategoryIds, buyBrandIds),
          matchesGet: matchesCriteria(item, effectiveGetProductIds, effectiveGetCategoryIds, effectiveGetBrandIds),
          role: null
        });
      }
    });

    // Sort units by price ascending so that the cheapest eligible units are discounted first
    allUnits.sort((a, b) => a.price - b.price);

    let groupsFormed = 0;
    while (true) {
      // Find getQuantity available units for 'get' role
      const candidateGetIndices = [];
      for (let i = 0; i < allUnits.length; i++) {
        if (allUnits[i].role === null && allUnits[i].matchesGet) {
          candidateGetIndices.push(i);
          if (candidateGetIndices.length === getQuantity) break;
        }
      }

      if (candidateGetIndices.length < getQuantity) {
        break;
      }

      // Temporarily mark them to avoid selecting them for 'buy' role in this group
      candidateGetIndices.forEach(idx => { allUnits[idx].role = 'temp_get'; });

      // Find buyQuantity available units for 'buy' role (scan right-to-left: most expensive first)
      const candidateBuyIndices = [];
      for (let i = allUnits.length - 1; i >= 0; i--) {
        if (allUnits[i].role === null && allUnits[i].matchesBuy) {
          candidateBuyIndices.push(i);
          if (candidateBuyIndices.length === buyQuantity) break;
        }
      }

      if (candidateBuyIndices.length < buyQuantity) {
        // Rollback temporary roles and exit
        candidateGetIndices.forEach(idx => { allUnits[idx].role = null; });
        break;
      }

      // Permanently commit roles
      candidateGetIndices.forEach(idx => { allUnits[idx].role = 'get'; });
      candidateBuyIndices.forEach(idx => { allUnits[idx].role = 'buy'; });
      groupsFormed++;
    }

    // Apply discounts for units that got the 'get' role
    const selectedFreeUnits = allUnits.filter(u => u.role === 'get');
    if (selectedFreeUnits.length > 0) {
      selectedFreeUnits.forEach(u => {
        lineDiscounts[u.cartItemIndex] += u.price;
      });
      discountAmount = selectedFreeUnits.reduce((sum, u) => sum + u.price, 0);
    }
  } else {
    // Standard targeted or general discount coupon
    const targetProductIds = parseIds(coupon.buyProductIds);
    const targetCategoryIds = parseIds(coupon.buyCategoryIds);
    const targetBrandIds = parseIds(coupon.buyBrandIds);
    
    const hasBuyRestrictions = targetProductIds.length > 0 || targetCategoryIds.length > 0 || targetBrandIds.length > 0;

    if (hasBuyRestrictions) {
      const matchingItems = cartItems.filter(item => matchesCriteria(item, targetProductIds, targetCategoryIds, targetBrandIds));
      let matchingSum = 0;
      matchingItems.forEach(item => {
        const offerPrice = item.variant
          ? parseFloat(item.variant.salePrice || item.variant.price)
          : parseFloat(item.product.salePrice || item.product.price);
        matchingSum += offerPrice * item.quantity;
      });

      if (matchingSum >= parseFloat(coupon.minOrderAmount)) {
        discountAmount = coupon.amountType === 'percent'
          ? (matchingSum * parseFloat(coupon.amount)) / 100
          : parseFloat(coupon.amount);
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
        
        if (discountAmount > 0) {
          cartItems.forEach((item, index) => {
            if (matchesCriteria(item, targetProductIds, targetCategoryIds, targetBrandIds)) {
              const offerPrice = item.variant
                ? parseFloat(item.variant.salePrice || item.variant.price)
                : parseFloat(item.product.salePrice || item.product.price);
              const itemTotal = offerPrice * item.quantity;
              lineDiscounts[index] = (itemTotal / matchingSum) * discountAmount;
            }
          });
        }
      }
    } else {
      // General discount coupon
      if (offerPriceSum >= parseFloat(coupon.minOrderAmount)) {
        discountAmount = coupon.amountType === 'percent'
          ? (offerPriceSum * parseFloat(coupon.amount)) / 100
          : parseFloat(coupon.amount);
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
        
        if (discountAmount > 0) {
          cartItems.forEach((item, index) => {
            const offerPrice = item.variant
              ? parseFloat(item.variant.salePrice || item.variant.price)
              : parseFloat(item.product.salePrice || item.product.price);
            const itemTotal = offerPrice * item.quantity;
            lineDiscounts[index] = (itemTotal / offerPriceSum) * discountAmount;
          });
        }
      }
    }
  }

  // Clean and round allocated line discounts to prevent float issues
  if (discountAmount > 0) {
    let totalAllocated = 0;
    lineDiscounts.forEach((val, index) => {
      lineDiscounts[index] = parseFloat(val.toFixed(2));
      totalAllocated += lineDiscounts[index];
    });
    
    let diff = parseFloat((discountAmount - totalAllocated).toFixed(2));
    if (diff !== 0) {
      const firstDiscountIdx = lineDiscounts.findIndex(val => val > 0);
      if (firstDiscountIdx !== -1) {
        lineDiscounts[firstDiscountIdx] = parseFloat((lineDiscounts[firstDiscountIdx] + diff).toFixed(2));
      }
    }
  }

  return {
    isValid: discountAmount > 0,
    discountAmount,
    lineDiscounts
  };
}

/**
 * Calculate all order totals from the user's cart.
 * 
 * @param {number|string} identifier - The user ID or guest session ID
 * @param {string} type - 'userId' or 'sessionId'
 * @param {string|null} couponCode - Optional coupon code to apply
 * @param {boolean} useYogisPoints - Whether to redeem available Yogis Points
 * @returns {Object} Calculated pricing details
 */
async function calculateOrderTotals(identifier, type = 'userId', couponCode = null, useYogisPoints = false) {
  const { checkRedemptionEligibility, getPointsConfig } = require('./yogisPoints');

  // 1. Fetch cart with product tax & HSN info
  const whereClause = type === 'userId' ? { userId: identifier } : { sessionId: identifier };
  const cartItems = await prisma.cart.findMany({
    where: whereClause,
    include: { product: { include: { brand: true, tax: true, hsn: true } }, variant: true }
  });

  if (!cartItems.length) {
    throw new Error('Cart is empty');
  }

  // 2. First pass: find offerPriceSum
  let offerPriceSum = 0;
  cartItems.forEach(item => {
    let offerPrice = item.variant
      ? parseFloat(item.variant.salePrice || item.variant.price)
      : parseFloat(item.product.salePrice || item.product.price);
    if (isNaN(offerPrice) || !offerPrice) offerPrice = 0;
    offerPriceSum += offerPrice * item.quantity;
  });

  // 3. Calculate total coupon discount
  let discountAmount = 0;
  let appliedCouponId = null;
  let coupon = null;
  const lineDiscounts = Array(cartItems.length).fill(0);

  if (couponCode === 'NONE') {
    couponCode = null; // Explicitly removed by user, do not auto-apply
  } else if (couponCode) {
    const matchedCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (matchedCoupon) {
      const evalResult = await evaluateCouponForCart(matchedCoupon, cartItems, identifier, type, offerPriceSum);
      if (evalResult.isValid) {
        coupon = matchedCoupon;
        appliedCouponId = matchedCoupon.id;
        discountAmount = evalResult.discountAmount;
        evalResult.lineDiscounts.forEach((val, idx) => { lineDiscounts[idx] = val; });
      }
    }
  } else {
    // Attempt Auto Apply
    const autoCoupons = await prisma.coupon.findMany({
      where: { status: 'active', autoApply: true }
    });
    let bestCoupon = null;
    let bestDiscount = 0;
    let bestLineDiscounts = null;

    for (const c of autoCoupons) {
      const evalResult = await evaluateCouponForCart(c, cartItems, identifier, type, offerPriceSum);
      if (evalResult.isValid && evalResult.discountAmount > bestDiscount) {
        bestCoupon = c;
        bestDiscount = evalResult.discountAmount;
        bestLineDiscounts = evalResult.lineDiscounts;
      }
    }

    if (bestCoupon) {
      coupon = bestCoupon;
      appliedCouponId = bestCoupon.id;
      discountAmount = bestDiscount;
      bestLineDiscounts.forEach((val, idx) => { lineDiscounts[idx] = val; });
    }
  }

  // 4. Calculate Yogis Points eligibility & discount (Platform Discount)
  const pointsConfig = await getPointsConfig();
  const isPointsEnabled = Boolean(pointsConfig && pointsConfig.enabled);
  const configuredPointsPerOrder = (isPointsEnabled && pointsConfig.pointsPerOrder > 0) ? pointsConfig.pointsPerOrder : 0;

  let yogisPointsInfo = {
    enabled: isPointsEnabled,
    pointsPerOrder: configuredPointsPerOrder,
    pointsEarned: configuredPointsPerOrder,
    minOrderValue: pointsConfig ? Number(pointsConfig.minimumCartValue) : 0,
    minPoints: pointsConfig ? Number(pointsConfig.minimumRedeemablePoints) : 0,
    minimumCartValue: pointsConfig ? Number(pointsConfig.minimumCartValue) : 0,
    minimumRedeemablePoints: pointsConfig ? Number(pointsConfig.minimumRedeemablePoints) : 0,
    conversionPoints: pointsConfig ? Number(pointsConfig.conversionPoints) : 100,
    conversionRupees: pointsConfig ? Number(pointsConfig.conversionRupees) : 100,
    eligible: false,
    availablePoints: 0,
    potentialPointsToUse: 0,
    potentialPointsDiscount: 0,
    perPointValue: pointsConfig ? (pointsConfig.conversionRupees / pointsConfig.conversionPoints) : 1,
    applied: false,
    pointsToUse: 0,
    pointsDiscount: 0
  };

  if (type === 'userId' && isPointsEnabled) {
    try {
      const eligibility = await checkRedemptionEligibility(identifier, offerPriceSum, discountAmount);
      if (eligibility) {
        yogisPointsInfo = {
          ...yogisPointsInfo,
          enabled: eligibility.config ? eligibility.config.enabled : isPointsEnabled,
          pointsPerOrder: configuredPointsPerOrder,
          pointsEarned: configuredPointsPerOrder,
          minOrderValue: pointsConfig ? Number(pointsConfig.minimumCartValue) : 0,
          minPoints: pointsConfig ? Number(pointsConfig.minimumRedeemablePoints) : 0,
          minimumCartValue: pointsConfig ? Number(pointsConfig.minimumCartValue) : 0,
          minimumRedeemablePoints: pointsConfig ? Number(pointsConfig.minimumRedeemablePoints) : 0,
          conversionPoints: pointsConfig ? Number(pointsConfig.conversionPoints) : 100,
          conversionRupees: pointsConfig ? Number(pointsConfig.conversionRupees) : 100,
          eligible: eligibility.eligible,
          reason: eligibility.reason || null,
          availablePoints: eligibility.availablePoints !== undefined ? eligibility.availablePoints : 0,
          potentialPointsToUse: eligibility.pointsToUse || 0,
          potentialPointsDiscount: eligibility.pointsDiscount || 0,
          perPointValue: eligibility.perPointValue || yogisPointsInfo.perPointValue,
          applied: false,
          pointsToUse: 0,
          pointsDiscount: 0
        };

        if (useYogisPoints && eligibility.eligible && eligibility.pointsDiscount > 0) {
          yogisPointsInfo.applied = true;
          yogisPointsInfo.pointsToUse = eligibility.pointsToUse;
          yogisPointsInfo.pointsDiscount = eligibility.pointsDiscount;
        }
      }
    } catch (err) {
      console.error('Error evaluating Yogis Points eligibility:', err);
    }
  }

  // Allocate Yogis Points discount across line items proportionally based on post-coupon item totals
  const yogisPointsLineDiscounts = Array(cartItems.length).fill(0);
  const totalNetAfterCoupon = Math.max(0, offerPriceSum - discountAmount);

  if (yogisPointsInfo.applied && yogisPointsInfo.pointsDiscount > 0 && totalNetAfterCoupon > 0) {
    let allocatedYP = 0;
    cartItems.forEach((item, index) => {
      let offerPrice = item.variant
        ? parseFloat(item.variant.salePrice || item.variant.price)
        : parseFloat(item.product.salePrice || item.product.price);
      if (isNaN(offerPrice) || !offerPrice) offerPrice = 0;
      const itemTotal = offerPrice * item.quantity;
      const netItemAfterCoupon = Math.max(0, itemTotal - lineDiscounts[index]);

      const itemYPDiscount = Math.round(((netItemAfterCoupon / totalNetAfterCoupon) * yogisPointsInfo.pointsDiscount) * 100) / 100;
      yogisPointsLineDiscounts[index] = itemYPDiscount;
      allocatedYP += itemYPDiscount;
    });

    const ypDiff = Math.round((yogisPointsInfo.pointsDiscount - allocatedYP) * 100) / 100;
    if (ypDiff !== 0) {
      const idx = yogisPointsLineDiscounts.findIndex(v => v > 0) !== -1
        ? yogisPointsLineDiscounts.findIndex(v => v > 0)
        : 0;
      yogisPointsLineDiscounts[idx] = Math.round((yogisPointsLineDiscounts[idx] + ypDiff) * 100) / 100;
    }
  }

  // 5. Calculate tax and line item totals (GST-Inclusive Back-Calculation)
  let totalTaxAmount = 0;
  let subtotal = 0; // Sum of taxable values

  const orderItems = cartItems.map((item, index) => {
    let offerPrice = item.variant
      ? parseFloat(item.variant.salePrice || item.variant.price)
      : parseFloat(item.product.salePrice || item.product.price);
    if (isNaN(offerPrice) || !offerPrice) offerPrice = 0;

    let originalPrice = item.variant
      ? parseFloat(item.variant.price)
      : parseFloat(item.product.price);
    if (isNaN(originalPrice) || !originalPrice) originalPrice = 0;

    const itemTotal = offerPrice * item.quantity;
    const productDiscount = (originalPrice - offerPrice) * item.quantity;

    const odForLine = lineDiscounts[index];
    const ypForLine = yogisPointsLineDiscounts[index];
    const totalLineDiscount = odForLine + ypForLine;
    const finalItemTotal = Math.max(0, Math.round((itemTotal - totalLineDiscount) * 100) / 100);

    const itemTaxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;
    const itemHsnCode = item.product.hsn ? item.product.hsn.hsnCode : null;

    // Inclusive GST Back-Calculation on post-discount line total
    const { taxableValue, gstAmount } = calculateInclusiveGST(finalItemTotal, itemTaxRate);
    const { cgst, sgst } = splitGST(gstAmount);

    totalTaxAmount += gstAmount;
    subtotal += taxableValue;

    return {
      productId: item.productId,
      name: item.product.name,
      variant: item.variant?.name || null,
      brand: item.product.brand?.name || null,
      quantity: item.quantity,
      price: originalPrice,
      mrp: originalPrice,
      productDiscount: productDiscount,
      orderDiscount: odForLine,
      yogisPointsDiscount: ypForLine,
      platformDiscount: ypForLine,
      taxableValue: taxableValue,
      gstRate: itemTaxRate,
      gstAmount: gstAmount,
      cgst: cgst,
      sgst: sgst,
      gst: gstAmount,
      taxRate_legacy: itemTaxRate,
      hsnCode: itemHsnCode,
      total: finalItemTotal
    };
  });

  const totalTax = totalTaxAmount;

  // 6. Fetch shipping rule
  const shippingRule = await prisma.shipping.findFirst({ where: { status: 'active' }, orderBy: { minCartValue: 'asc' } });
  let shippingTotal = 0;
  if (shippingRule) {
    shippingTotal = offerPriceSum >= parseFloat(shippingRule.minCartValue) ? 0 : parseFloat(shippingRule.charge);
  }

  // Calculate 18% inclusive GST for shipping
  const shippingTax = calculateInclusiveGST(shippingTotal, 18);
  const shippingTaxable = shippingTax.taxableValue;
  const shippingGST = shippingTax.gstAmount;

  // 7. Final total
  const totalYogisPointsDiscount = yogisPointsInfo.applied ? yogisPointsInfo.pointsDiscount : 0;
  const grandTotal = Math.max(0, offerPriceSum - discountAmount - totalYogisPointsDiscount) + shippingTotal;
  const total = grandTotal;

  // Determine discountType
  let discountType = null;
  if (discountAmount > 0 && totalYogisPointsDiscount > 0) {
    discountType = 'COUPON_AND_POINTS';
  } else if (discountAmount > 0) {
    discountType = 'COUPON';
  } else if (totalYogisPointsDiscount > 0) {
    discountType = 'YOGIS_POINTS';
  }

  // 8. Cart item IDs for stock deduction later
  const cartItemIds = cartItems.map(c => ({
    id: c.id,
    productId: c.productId,
    variantId: c.variantId,
    quantity: c.quantity
  }));

  return {
    offerPriceSum,
    subtotal,
    totalTax,
    discountAmount,
    yogisPointsUsed: yogisPointsInfo.applied ? yogisPointsInfo.pointsToUse : 0,
    yogisPointsDiscount: totalYogisPointsDiscount,
    discountType,
    yogisPoints: yogisPointsInfo,
    pointsPerOrder: configuredPointsPerOrder,
    pointsEarned: configuredPointsPerOrder,
    shipping: shippingTotal,
    shippingTotal,
    shippingTaxable,
    shippingGST,
    shippingThreshold: shippingRule ? parseFloat(shippingRule.minCartValue) : 0,
    shippingCharge: shippingRule ? parseFloat(shippingRule.charge) : 0,
    total,
    grandTotal,
    orderItems,
    cartItemIds,
    appliedCouponId,
    coupon
  };
}

module.exports = { 
  calculateOrderTotals,
  evaluateCouponForCart,
  roundCurrency,
  allocateOrderDiscount,
  calculateInclusiveGST,
  splitGST
};
