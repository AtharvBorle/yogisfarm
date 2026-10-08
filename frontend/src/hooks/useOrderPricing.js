import { useState, useEffect } from 'react';
import api from '../api';

let cachedPointsConfig = null;
let pointsStatusPromise = null;

const getInitialPointsConfig = async () => {
  if (cachedPointsConfig !== null) return cachedPointsConfig;
  if (!pointsStatusPromise) {
    pointsStatusPromise = api.get('/points/status')
      .then(res => {
        if (res.data?.status && res.data?.enabled) {
          cachedPointsConfig = {
            enabled: true,
            pointsPerOrder: res.data.pointsPerOrder || 0,
            minOrderValue: res.data.minimumCartValue || res.data.minOrderValue || 0,
            minPoints: res.data.minimumRedeemablePoints || res.data.minPoints || 0,
            minimumCartValue: res.data.minimumCartValue || 0,
            minimumRedeemablePoints: res.data.minimumRedeemablePoints || 0,
            conversionPoints: res.data.conversionPoints || 100,
            conversionRupees: res.data.conversionRupees || 100
          };
        } else {
          cachedPointsConfig = { enabled: false, pointsPerOrder: 0, minOrderValue: 0, minPoints: 0 };
        }
        return cachedPointsConfig;
      })
      .catch(() => ({ enabled: false, pointsPerOrder: 0, minOrderValue: 0, minPoints: 0 }));
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
    yogisPoints: cachedPointsConfig || null,
    pointsEarned: cachedPointsConfig?.pointsPerOrder || 0,
    pointsPerOrder: cachedPointsConfig?.pointsPerOrder || 0
  });
  const [loading, setLoading] = useState(true);
  const [lastCalculatedCouponCode, setLastCalculatedCouponCode] = useState(null);
  const [lastCalculatedUsePoints, setLastCalculatedUsePoints] = useState(false);

  useEffect(() => {
    if (cachedPointsConfig === null) {
      getInitialPointsConfig().then(cfg => {
        if (cfg) {
          setPricing(prev => ({
            ...prev,
            yogisPoints: prev.yogisPoints || cfg,
            pointsPerOrder: prev.pointsPerOrder || cfg.pointsPerOrder,
            pointsEarned: prev.pointsEarned || cfg.pointsPerOrder
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
