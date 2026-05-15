import { useState, useEffect } from 'react';
import api from '../api';

/**
 * Centralized pricing hook for Yogis Farm frontend.
 * 
 * SINGLE SOURCE OF TRUTH (Fetches directly from backend API).
 * Used by: Cart, Checkout, Payment pages.
 * 
 * @param {Array} cartItems - Cart items
 * @param {string|null} couponCode - Applied coupon code
 * @returns {Object} { offerPriceSum, subtotalBase, totalTax, shipping, loading, grandTotal }
 */
export function useOrderPricing(cartItems, couponCode = null) {
  const [pricing, setPricing] = useState({
    offerPriceSum: 0,
    subtotalBase: 0,
    totalTax: 0,
    shipping: 0,
    discountAmount: 0,
    grandTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setPricing({ offerPriceSum: 0, subtotalBase: 0, totalTax: 0, shipping: 0, discountAmount: 0, grandTotal: 0 });
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api.post('/cart/calculate', { couponCode })
      .then(res => {
        if (isMounted && res.data.status) {
          setPricing({
            offerPriceSum: res.data.pricing.offerPriceSum,
            subtotalBase: res.data.pricing.subtotal,
            totalTax: res.data.pricing.totalTax,
            shipping: res.data.pricing.shipping,
            discountAmount: res.data.pricing.discountAmount,
            grandTotal: res.data.pricing.grandTotal
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [cartItems, couponCode]);

  return { ...pricing, loading };
}
