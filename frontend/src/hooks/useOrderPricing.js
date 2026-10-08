import { useState, useEffect } from 'react';
import api from '../api';

let cachedPointsPerOrder = null;
let pointsStatusPromise = null;

const getInitialPointsPerOrder = async () => {
  if (cachedPointsPerOrder !== null) return cachedPointsPerOrder;
  if (!pointsStatusPromise) {
    pointsStatusPromise = api.get('/points/status')
      .then(res => {
        if (res.data?.status && res.data?.enabled && res.data?.pointsPerOrder > 0) {
          cachedPointsPerOrder = res.data.pointsPerOrder;
        } else {
          cachedPointsPerOrder = 0;
        }
        return cachedPointsPerOrder;
      })
      .catch(() => 0);
  }
  return pointsStatusPromise;
};

/**
 * Centralized pricing hook for Yogis Farm frontend.
 * 
 * SINGLE SOURCE OF TRUTH (Fetches directly from backend API).
 * Used by: Cart, Checkout, Payment pages.
 * 
 * @param {Array} cartItems - Cart items
 * @param {string|null} couponCode - Applied coupon code
 * @param {boolean} useYogisPoints - Whether to redeem available Yogis Points
 * @returns {Object} Pricing details including pointsEarned & pointsPerOrder
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
    yogisPoints: null,
    pointsEarned: cachedPointsPerOrder || 0,
    pointsPerOrder: cachedPointsPerOrder || 0
  });
  const [loading, setLoading] = useState(true);
  const [lastCalculatedCouponCode, setLastCalculatedCouponCode] = useState(null);
  const [lastCalculatedUsePoints, setLastCalculatedUsePoints] = useState(false);

  useEffect(() => {
    if (cachedPointsPerOrder === null) {
      getInitialPointsPerOrder().then(pts => {
        if (pts > 0) {
          setPricing(prev => ({
            ...prev,
            pointsPerOrder: prev.pointsPerOrder || pts,
            pointsEarned: prev.pointsEarned || pts
          }));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setPricing(prev => ({
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
        yogisPoints: null,
        pointsEarned: 0,
        pointsPerOrder: prev.pointsPerOrder || 0
      }));
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
          const earned = res.data.pricing.pointsEarned !== undefined 
            ? res.data.pricing.pointsEarned 
            : (res.data.pricing.pointsPerOrder || 0);
          const perOrder = res.data.pricing.pointsPerOrder !== undefined 
            ? res.data.pricing.pointsPerOrder 
            : earned;
          
          if (perOrder > 0) cachedPointsPerOrder = perOrder;

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
            yogisPoints: res.data.pricing.yogisPoints || null,
            pointsEarned: earned,
            pointsPerOrder: perOrder
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
