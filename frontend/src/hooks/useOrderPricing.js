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
export function useOrderPricing(cartItems, couponCode = null, useYogisPoints = false) {
  const [pricing, setPricing] = useState({
    offerPriceSum: 0,
    subtotalBase: 0,
    totalTax: 0,
    shipping: 0,
    discountAmount: 0,
    grandTotal: 0,
    coupon: null,
    yogisPointsUsed: 0,
    yogisPointsDiscount: 0,
    discountType: null,
    yogisPoints: null
  });
  const [loading, setLoading] = useState(true);
  const [lastCalculatedCouponCode, setLastCalculatedCouponCode] = useState(null);
  const [lastCalculatedUsePoints, setLastCalculatedUsePoints] = useState(false);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setPricing({
        offerPriceSum: 0,
        subtotalBase: 0,
        totalTax: 0,
        shipping: 0,
        discountAmount: 0,
        grandTotal: 0,
        coupon: null,
        yogisPointsUsed: 0,
        yogisPointsDiscount: 0,
        discountType: null,
        yogisPoints: null
      });
      setLastCalculatedCouponCode(null);
      setLastCalculatedUsePoints(false);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api.post('/cart/calculate', { couponCode, useYogisPoints: Boolean(useYogisPoints) })
      .then(res => {
        if (isMounted && res.data.status) {
          setPricing({
            offerPriceSum: res.data.pricing.offerPriceSum,
            subtotalBase: res.data.pricing.subtotal,
            totalTax: res.data.pricing.totalTax,
            shipping: res.data.pricing.shipping,
            discountAmount: res.data.pricing.discountAmount,
            grandTotal: res.data.pricing.grandTotal,
            coupon: res.data.pricing.coupon,
            yogisPointsUsed: res.data.pricing.yogisPointsUsed || 0,
            yogisPointsDiscount: res.data.pricing.yogisPointsDiscount || 0,
            discountType: res.data.pricing.discountType || null,
            yogisPoints: res.data.pricing.yogisPoints || null
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) {
          setLastCalculatedCouponCode(couponCode);
          setLastCalculatedUsePoints(Boolean(useYogisPoints));
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [cartItems, couponCode, useYogisPoints]);

  const isOutofSync = couponCode !== lastCalculatedCouponCode || Boolean(useYogisPoints) !== lastCalculatedUsePoints;

  return { ...pricing, loading: loading || isOutofSync };
}
