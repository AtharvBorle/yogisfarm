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
 * Calculate all order totals from the user's cart.
 * 
 * @param {number} userId - The user whose cart to calculate
 * @param {string|null} couponCode - Optional coupon code to apply
 * @returns {Object} { offerPriceSum, subtotal, totalTax, discountAmount, shipping, total, orderItems, cartItemIds, appliedCouponId, coupon }
 */
async function calculateOrderTotals(userId, couponCode = null) {
  // 1. Fetch cart with product tax & HSN info
  const cartItems = await prisma.cart.findMany({
    where: { userId },
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
      if (offerPriceSum >= parseFloat(coupon.minOrderAmount)) {
        discountAmount = coupon.amountType === 'percent'
          ? (offerPriceSum * parseFloat(coupon.amount)) / 100
          : parseFloat(coupon.amount);
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
        appliedCouponId = coupon.id;
      }
    }
  }

  // 4. Second pass: Calculate tax and item totals
  let totalTaxAmount = 0;
  let subtotal = 0; // Sum of tax values

  const orderItems = cartItems.map(item => {
    const offerPrice = item.variant
      ? parseFloat(item.variant.salePrice || item.variant.price)
      : parseFloat(item.product.salePrice || item.product.price);
    const originalPrice = item.variant
      ? parseFloat(item.variant.price)
      : parseFloat(item.product.price);

    const itemTotal = offerPrice * item.quantity;
    const productDiscount = (originalPrice - offerPrice) * item.quantity;

    // Allocate order discount to this line
    let odForLine = 0;
    if (discountAmount > 0) {
      if (coupon.amountType === 'percent') {
        // Proportional allocation ensures percent logic holds true per item while respecting any max caps
        odForLine = (itemTotal / offerPriceSum) * discountAmount;
      } else {
        // Flat coupon evenly divided across all line items
        odForLine = discountAmount / cartItems.length;
      }
    }

    const finalItemTotal = itemTotal - odForLine;
    const itemTaxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;
    const itemHsnCode = item.product.hsn ? item.product.hsn.hsnCode : null;
    
    // User's formula: Tax Amount = Final Item Price * Tax Rate
    const itemGst = finalItemTotal * (itemTaxRate / 100);
    const itemTaxVal = finalItemTotal - itemGst;

    totalTaxAmount += itemGst;
    subtotal += itemTaxVal;

    return {
      productId: item.productId,
      name: item.product.name,
      variant: item.variant?.name || null,
      brand: item.product.brand?.name || null,
      price: originalPrice,
      discount: productDiscount,
      gst: itemGst,
      taxRate: itemTaxRate,
      hsnCode: itemHsnCode,
      quantity: item.quantity,
      total: itemTotal // Keep total as itemTotal so UI can re-derive the breakdown if needed
    };
  });

  const totalTax = totalTaxAmount;

  // 5. Fetch shipping rule
  const shippingRule = await prisma.shipping.findFirst({ where: { status: 'active' }, orderBy: { minCartValue: 'asc' } });
  let shipping = 0;
  if (shippingRule) {
    shipping = offerPriceSum >= parseFloat(shippingRule.minCartValue) ? 0 : parseFloat(shippingRule.charge);
  }

  // 6. Final total (subtotal + tax + shipping = offerPriceSum - discount + shipping)
  const rawTotal = subtotal + totalTax + shipping;
  const total = Math.round(rawTotal);

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
    shipping,
    shippingThreshold: shippingRule ? parseFloat(shippingRule.minCartValue) : 0,
    shippingCharge: shippingRule ? parseFloat(shippingRule.charge) : 0,
    total,
    orderItems,
    cartItemIds,
    appliedCouponId,
    coupon
  };
}

module.exports = { calculateOrderTotals };
