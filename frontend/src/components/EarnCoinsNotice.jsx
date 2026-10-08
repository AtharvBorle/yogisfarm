import React from 'react';

const EarnCoinsNotice = ({ coins = 0, size = 'md', style = {} }) => {
  const count = parseInt(coins, 10) || 0;
  if (count <= 0) return null;

  const isSmall = size === 'sm';

  return (
    <div 
      className="earn-coins-notice-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isSmall ? '8px' : '10px',
        background: '#F0FDF4',
        border: '1px dashed #16A34A',
        borderRadius: isSmall ? '8px' : '10px',
        padding: isSmall ? '9px 12px' : '12px 16px',
        boxShadow: '0 1px 3px rgba(10, 103, 56, 0.05)',
        ...style
      }}
    >
      <img 
        src="/yogis_farms_coin_smooth_360_spin.svg" 
        alt="Yogi's Coins" 
        style={{ 
          width: isSmall ? '22px' : '26px', 
          height: isSmall ? '22px' : '26px', 
          objectFit: 'contain',
          flexShrink: 0 
        }} 
        onError={(e) => {
          if (!e.currentTarget.dataset.retried) {
            e.currentTarget.dataset.retried = 'true';
            e.currentTarget.src = "/assets/imgs/theme/yogis-coin.png";
          }
        }}
      />
      <span 
        style={{ 
          color: '#0A6738', 
          fontSize: isSmall ? '11px' : '13px', 
          fontWeight: '600', 
          fontFamily: 'Poppins, sans-serif',
          lineHeight: '1.4'
        }}
      >
        You will earn <strong style={{ color: '#B45309', fontWeight: '700' }}>{count} {count === 1 ? 'coin' : 'coins'}</strong> on this order
      </span>
    </div>
  );
};

export default EarnCoinsNotice;
