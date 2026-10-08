import React from 'react';

/**
 * Reusable banner showing Yogis Points redemption rules:
 * - Minimum Order Value required
 * - Minimum Points required
 * - User balance & eligibility progress
 * - Explicit notification that points are redeemed on the Payment page
 */
const RedeemPointsNotice = ({ 
  yogisPoints = null, 
  cartTotal = 0, 
  user = null, 
  page = 'cart', // 'cart' | 'checkout' | 'payment'
  size = 'md',
  style = {} 
}) => {
  if (!yogisPoints || !yogisPoints.enabled) return null;

  const minOrder = Number(yogisPoints.minOrderValue || yogisPoints.minimumCartValue || 0);
  const minPoints = Number(yogisPoints.minPoints || yogisPoints.minimumRedeemablePoints || 0);
  const availablePoints = Number(yogisPoints.availablePoints || 0);
  const isSmall = size === 'sm';

  // Only render if rules exist (either minOrder > 0 or minPoints > 0)
  if (minOrder <= 0 && minPoints <= 0) return null;

  const currentCart = Number(cartTotal) || 0;
  const meetsOrderValue = currentCart >= minOrder;
  const meetsPoints = availablePoints >= minPoints;
  const isEligible = Boolean(yogisPoints.eligible || (meetsOrderValue && meetsPoints && user));

  return (
    <div
      className="redeem-points-notice-card"
      style={{
        background: isEligible ? '#F0FDF4' : '#FFFBEB',
        border: isEligible ? '1px dashed #16A34A' : '1px dashed #F59E0B',
        borderRadius: isSmall ? '8px' : '10px',
        padding: isSmall ? '10px 12px' : '14px 16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        fontFamily: 'Poppins, sans-serif',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: isSmall ? '8px' : '12px' }}>
        <img
          src="/yogis_farms_coin_smooth_360_spin.svg"
          alt="Yogi's Coins"
          style={{
            width: isSmall ? '24px' : '28px',
            height: isSmall ? '24px' : '28px',
            objectFit: 'contain',
            flexShrink: 0,
            marginTop: '2px'
          }}
          onError={(e) => {
            if (!e.currentTarget.dataset.retried) {
              e.currentTarget.dataset.retried = 'true';
              e.currentTarget.src = "/assets/imgs/theme/yogis-coin.png";
            }
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
            <span style={{ 
              fontWeight: '700', 
              fontSize: isSmall ? '12px' : '13px', 
              color: '#253D4E',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Redeem Yogi's Points
              {page !== 'payment' && (
                <span style={{ 
                  fontSize: isSmall ? '10px' : '11px', 
                  fontWeight: '600', 
                  color: '#0A6738', 
                  backgroundColor: 'rgba(10, 103, 56, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  On Payment Page
                </span>
              )}
            </span>

            {user && (
              <span style={{ fontSize: isSmall ? '11px' : '12px', fontWeight: '600', color: '#B45309' }}>
                Your Balance: <strong>{availablePoints} Points</strong>
              </span>
            )}
          </div>

          {/* Redemption Thresholds Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {minOrder > 0 && (
              <div style={{
                fontSize: isSmall ? '11px' : '12px',
                color: meetsOrderValue ? '#15803D' : '#92400E',
                backgroundColor: meetsOrderValue ? '#DCFCE7' : '#FEF3C7',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Min. Order:</span>
                <strong>₹{minOrder}</strong>
                {currentCart > 0 && !meetsOrderValue && (
                  <span style={{ fontWeight: '500', opacity: 0.85 }}>(Current: ₹{currentCart.toFixed(0)})</span>
                )}
              </div>
            )}

            {minPoints > 0 && (
              <div style={{
                fontSize: isSmall ? '11px' : '12px',
                color: meetsPoints ? '#15803D' : '#92400E',
                backgroundColor: meetsPoints ? '#DCFCE7' : '#FEF3C7',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Min. Points to Redeem:</span>
                <strong>{minPoints} Pts</strong>
              </div>
            )}
          </div>

          {/* Contextual Guidance */}
          <div style={{ fontSize: isSmall ? '11px' : '12px', color: '#4B5563', lineHeight: '1.4' }}>
            {user ? (
              !meetsOrderValue ? (
                <span style={{ color: '#B45309', fontWeight: '500' }}>
                  Add <strong>₹{(minOrder - currentCart).toFixed(0)}</strong> more to cart to redeem your points on the Payment page.
                </span>
              ) : !meetsPoints ? (
                <span style={{ color: '#B45309', fontWeight: '500' }}>
                  You need <strong>{minPoints - availablePoints}</strong> more points to reach the redemption threshold.
                </span>
              ) : (
                <span style={{ color: '#15803D', fontWeight: '600' }}>
                  {page === 'payment' ? 'You are eligible to apply your points below!' : 'Eligible! You can apply your points for a discount on the Payment step.'}
                </span>
              )
            ) : (
              <span style={{ color: '#6B7280' }}>
                Log in to use your points for instant discounts on orders meeting these minimum requirements.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemPointsNotice;
