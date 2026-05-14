import { useState, useEffect, useMemo } from 'react';
import api from '../api';

/**
 * Centralized pricing hook for Yogis Farm frontend.
 * 
 * SINGLE SOURCE OF TRUTH for all price calculations on the client side.
 * Used by: Cart, Checkout, Payment pages.
 * 
 * Pricing model: GST-INCLUSIVE (offer prices already include GST)
 * 
 * @param {Array} cartItems - Cart items from CartContext
 * @param {number} discount - Coupon discount amount (default 0)
 * @returns {Object} { offerPriceSum, subtotalBase, totalTax, shipping, shippingLoaded, grandTotal }
 */
export function useOrderPricing(cartItems, discount = 0) {
  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingThreshold, setShippingThreshold] = useState(0);
  const [shippingLoaded, setShippingLoaded] = useState(false);

  // Fetch shipping rules once
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await api.get('/shipping');
        if (res.data.status && res.data.shipping?.length > 0) {
          const active = res.data.shipping[0];
          setShippingCharge(parseFloat(active.charge));
          setShippingThreshold(parseFloat(active.minCartValue));
        }
      } catch (err) { console.error(err); }
      finally { setShippingLoaded(true); }
    };
    fetchShipping();
  }, []);

  // Calculate all pricing from cart items (memoized for performance)
  const pricing = useMemo(() => {
    let offerPriceSum = 0;
    let totalTax = 0;

    cartItems.forEach(item => {
      const offerPrice = item.variant
        ? parseFloat(item.variant.salePrice || item.variant.price)
        : parseFloat(item.product.salePrice || item.product.price);
      const itemTotal = offerPrice * item.quantity;
      const taxRate = item.product.tax ? parseFloat(item.product.tax.tax) : 0;

      offerPriceSum += itemTotal;
      totalTax += itemTotal * (taxRate / 100);
    });

    const subtotalBase = offerPriceSum - totalTax;
    const shipping = (shippingThreshold > 0 && offerPriceSum >= shippingThreshold) ? 0 : shippingCharge;
    const grandTotal = Math.round(subtotalBase - discount + totalTax + shipping);

    return { offerPriceSum, subtotalBase, totalTax, shipping, grandTotal };
  }, [cartItems, discount, shippingCharge, shippingThreshold]);

  return {
    ...pricing,
    shippingLoaded
  };
}
