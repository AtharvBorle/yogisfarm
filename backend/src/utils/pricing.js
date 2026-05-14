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

  // 2. Calculate per-item prices & tax (GST-inclusive model)
  let offerPriceSum = 0;
  let totalTaxAmount = 0;

  const orderItems = cartItems.map(item => {
    const offerPrice = item.variant
      ? parseFloat(item.variant.salePrice || item.variant.price)
      : parseFloat(item.product.salePrice || item.product.price);
    const originalPrice = item.variant
      ? parseFloat(item.variant.price)
      : parseFloat(item.product.price);

    const itemTotal = offerPrice * item.quantity;
    const productDiscount = (originalPrice - offerPrice) * item.quantity;

    const itemTaxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;
    const itemHsnCode = item.product.hsn ? item.product.hsn.hsnCode : null;
    const itemGst = itemTotal * (itemTaxRate / 100);

    offerPriceSum += itemTotal;
    totalTaxAmount += itemGst;

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
      total: itemTotal
    };
  });

  // 3. Subtotal = offerPriceSum minus GST (base price)
  const subtotal = offerPriceSum - totalTaxAmount;
  const totalTax = totalTaxAmount;

  // 4. Apply coupon discount (on base/subtotal, not on tax)
  let discountAmount = 0;
  let appliedCouponId = null;
  let coupon = null;

  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.status === 'active') {
      if (offerPriceSum >= parseFloat(coupon.minOrderAmount)) {
        discountAmount = coupon.amountType === 'percent'
          ? (subtotal * parseFloat(coupon.amount)) / 100
          : parseFloat(coupon.amount);
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
        appliedCouponId = coupon.id;
      }
    }
  }

  // 5. Fetch shipping rule
  const shippingRule = await prisma.shipping.findFirst({ where: { status: 'active' }, orderBy: { minCartValue: 'asc' } });
  let shipping = 0;
  if (shippingRule) {
    shipping = offerPriceSum >= parseFloat(shippingRule.minCartValue) ? 0 : parseFloat(shippingRule.charge);
  }

  // 6. Final total (round only the final amount)
  const rawTotal = subtotal - discountAmount + totalTax + shipping;
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
