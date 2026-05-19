/**
 * Centralized Pricing Engine for YogisFarms
 * 
 * SINGLE SOURCE OF TRUTH for all price calculations.
 * Used by: orders.js (place order), coupons.js (apply coupon), admin.js (order details)
 * 
 * Pricing model: GST-INCLUSIVE (offer prices already include GST)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
 * Calculate all order totals from the user's cart.
 * 
 * @param {number} userId - The user whose cart to calculate
 * @param {string|null} couponCode - Optional coupon code to apply
 * @returns {Object} { offerPriceSum, subtotal, totalTax, discountAmount, shipping, total, orderItems, cartItemIds, appliedCouponId, coupon }
 */
async function calculateOrderTotals(identifier, type = 'userId', couponCode = null) {
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
    const offerPrice = item.variant
      ? parseFloat(item.variant.salePrice || item.variant.price)
      : parseFloat(item.product.salePrice || item.product.price);
    offerPriceSum += offerPrice * item.quantity;
  });

  // 3. Calculate total coupon discount
  let discountAmount = 0;
  let appliedCouponId = null;
  let coupon = null;

  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.status === 'active') {
      const now = new Date();
      if (!coupon.expireOn || new Date(coupon.expireOn) > now) {
        if (offerPriceSum >= parseFloat(coupon.minOrderAmount)) {
          discountAmount = coupon.amountType === 'percent'
            ? (offerPriceSum * parseFloat(coupon.amount)) / 100
            : parseFloat(coupon.amount);
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
          appliedCouponId = coupon.id;
        }
      } else {
        // Coupon expired
        coupon = null;
      }
    }
  }

  // 4. Second pass: Calculate tax and item totals
  let totalTaxAmount = 0;
  let subtotal = 0; // Sum of taxable values
  
  const orderItems = cartItems.map(item => {
    const offerPrice = item.variant
      ? parseFloat(item.variant.salePrice || item.variant.price)
      : parseFloat(item.product.salePrice || item.product.price);
    const originalPrice = item.variant
      ? parseFloat(item.variant.price)
      : parseFloat(item.product.price);

    const itemTotal = offerPrice * item.quantity;
    const productDiscount = (originalPrice - offerPrice) * item.quantity;

    // Allocate order discount proportionally
    const odForLine = allocateOrderDiscount(itemTotal, offerPriceSum, discountAmount);
    const finalItemTotal = itemTotal - odForLine;
    
    const itemTaxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;
    const itemHsnCode = item.product.hsn ? item.product.hsn.hsnCode : null;
    
    // Inclusive GST Back-Calculation
    const { taxableValue, gstAmount } = calculateInclusiveGST(finalItemTotal, itemTaxRate);
    
    // Strictly correct splitting
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
      taxableValue: taxableValue,
      gstRate: itemTaxRate,
      gstAmount: gstAmount,
      cgst: cgst,
      sgst: sgst,
      gst: gstAmount, // keeping for backwards compatibility if needed
      taxRate_legacy: itemTaxRate,
      hsnCode: itemHsnCode,
      total: finalItemTotal
    };
  });

  const totalTax = totalTaxAmount;

  // 5. Fetch shipping rule
  const shippingRule = await prisma.shipping.findFirst({ where: { status: 'active' }, orderBy: { minCartValue: 'asc' } });
  let shippingTotal = 0;
  if (shippingRule) {
    shippingTotal = offerPriceSum >= parseFloat(shippingRule.minCartValue) ? 0 : parseFloat(shippingRule.charge);
  }

  // Calculate 18% inclusive GST for shipping
  const shippingTax = calculateInclusiveGST(shippingTotal, 18);
  const shippingTaxable = shippingTax.taxableValue;
  const shippingGST = shippingTax.gstAmount;

  // 6. Final total
  const grandTotal = offerPriceSum - discountAmount + shippingTotal;
  const total = grandTotal; // legacy alias

  // 7. Cart item IDs for stock deduction later
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
  roundCurrency,
  allocateOrderDiscount,
  calculateInclusiveGST,
  splitGST
};
